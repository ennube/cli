import {Project, Shell} from '../../classes';
import {http, storage} from '@ennube/runtime';
import {getStackName} from './common';

import {pascalCase, paramCase} from 'change-case';
//import * as _ from 'lodash';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';

import * as aws from 'aws-sdk';

import {mixin} from './common';
import {Gateway} from './gateway';
import {S3} from './s3';

@mixin(Gateway, S3)
export class Amazon implements Gateway, S3 {

    stage: string = 'development';
    region: string = 'us-east-1';

    client : any;

    Template: Object;
    Metadata: Object = {};
    Parameters: Object = {};
    Mappings: Object = {};
    Conditions: Object = {};

    Resources: {
        [resourceId:string]: {
            Type: string,
            Properties: Object
        }
    } = { };

    Outputs: Object = {};

    constructor(public project:Project) {


        this.client = new aws['CloudFormation']({
            region: this.region
        });

        this.prepareTemplate();
    }

    prepareTemplate() {
        this.project.ensureLoaded();

        this.Template = {
           AWSTemplateFormatVersion: "2010-09-09",
           Metadata: this.Metadata,
           Parameters: this.Parameters,
           Mappings: this.Mappings,
           Conditions: this.Conditions,
           Resources: this.Resources,
           Outputs: this.Outputs
        };

        this.prepareS3Template();
        this.prepareGatewayTemplate();
        // Guarda el template para crear y para actualizar el stack..

        fs.writeFileSync('template.yaml', yaml.dump(this.Template));
    }

    // S3 methods
    prepareS3Template: () => void;
    uploadDeploymentFiles: () => Promise<void>;

    // Gateway methods
    prepareGatewayTemplate: () => void;
    prepareGatewayMOCKTemplate: () => void;
    prepareGatewayHTTPTemplate: () => void;
    prepareGatewayLambdaTemplate: () => void;

    @Shell.command('upload')
    upload(args) {
        return this.uploadDeploymentFiles();
    }

    @Shell.command('validate')
    validate(args) {
        this.send('validateTemplate', {
            TemplateBody: JSON.stringify(this.Template)
        })
        .then((x) => console.log('OK'))
        .catch((x) => console.log('ER', x));
    }

    @Shell.command('describe')
    describe(args) {
        this.send('describeStacks', {
            TemplateBody: JSON.stringify(this.Template)
        })
        .then((x) => console.log('OK'))
        .catch((x) => console.log('ER', x));
    }

    @Shell.command('create')
    create(args) {
        let stage = 'dev'; // from args

        this.send('createStack', {
            StackName: getStackName(this.project.npm.name, stage),
            TemplateBody: JSON.stringify(this.Template),
            //Capabilities: 'CAPABILITY_NAMED_IAM',
            //OnFailure: 'DELETE',
            // Stage on parameters
            //

        })
        .then((x) => console.log('OK', x))
        .catch((x) => console.log('ER', x));
    }


    send(method:string, params:Object) {
        return new Promise((resolve, reject) => {
            this.client[method](params)
            .on('success', (response) => resolve(response) )
            .on('error', (response) => reject(response) )
            .send();
        });
    }

}

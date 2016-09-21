import {Project} from '../../project';
import {http, storage} from '@ennube/runtime';
import {getStackName} from './common';

import {pascalCase, paramCase} from 'change-case';
//import * as _ from 'lodash';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';

import * as aws from 'aws-sdk';

import {mixin, send} from './common';

import {S3} from './s3';
import {Gateway} from './gateway';
import {Lambda} from './lambda';

@mixin(S3, Gateway, Lambda)
export class Amazon  implements Gateway, S3, Lambda {
    debug = true;
//    stage: string = 'development';
    region: string = 'eu-west-1';


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


    deploymentBucketName: string;
    deploymentKeyPrefix: string;
    deployHash: string;

    updateStackTemplate: string;

    constructor(public project:Project, public stage: string='development') {
        this.deploymentBucketName = `${paramCase(project.name)}-deployment`;
        this.client = new aws['CloudFormation']({
            region: this.region
        });

        this.deployHash = (new Date()).toJSON();
    }

    prepared: Boolean = false;
    ensurePrepared() {
        if(this.prepared)
            return;

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
        this.prepareLambdaTemplate();
        this.prepareGatewayIntegrationTemplate();

        fs.writeFileSync(`${this.project.deploymentDir}/stack.update.json`,
            this.updateStackTemplate = JSON.stringify(this.Template));

        fs.writeFileSync(`${this.project.deploymentDir}/stack.update.yaml`,
            yaml.dump(this.Template));

        this.prepared = true;
    }

    // S3 methods
    prepareS3Template: () => void;
    uploadDeploymentFiles: () => Promise<void>;

    // Gateway methods
    prepareGatewayTemplate: () => void;
    prepareGatewayIntegrationTemplate: () => void;
    prepareGatewayMOCKTemplate: () => void;
    prepareGatewayHTTPTemplate: () => void;
    prepareGatewayLambdaTemplate: () => void;

    // Lambda
    prepareLambdaTemplate: () => void;

//    @command('upload')
    upload(args) {
        this.ensurePrepared();
        return this.uploadDeploymentFiles();
    }

//    @command('validate')
    validate(args) {
        this.ensurePrepared();
        this.send('validateTemplate', {
            TemplateBody: JSON.stringify(this.Template)
        })
        .then((x) => console.log('OK'))
        .catch((x) => console.log('ER', x));
    }

//    @command('describe')
    describe(args) {
        this.send('describeStacks', {

        })
        .then((x) => console.log('OK', x))
        .catch((x) => console.log('ER', x));
    }


//    @command('ensures the stack exists')
    ensure() {
        this.ensurePrepared();
        let stackName = getStackName(this.project.name, this.stage);

        return Promise.resolve()



    }

//    @command()
    updateStack(shell) {
        this.ensurePrepared();
        let cf = this.client;

        // si existe, efectua un update, sino un create...

        let stackName = getStackName(this.project.name, this.stage);

        return Promise.resolve()

        //.then( () => ) validate template...

        // stack exists??

        .then(() => new Promise((resolve, reject) => {
            console.log('Stack exists??');

            send( () => this.client.describeStacks({
                StackName: stackName
            }))
            .then((x) => resolve(true))
            .catch((x) => x.message.endsWith('does not exist')?
                resolve(false):
                reject(x))
        }))

        // UPDATE / CREATE STACK

        .then((exists: any) => new Promise((resolve, reject) => {

            if( exists ){
                var task = 'Updating stack';
                var method = 'updateStack';
                var successState = 'stackUpdateComplete';
            } else {
                var task = 'Creating stack';
                var method = 'createStack';
                var successState = 'stackCreateComplete';
            }

            shell.task(task);

            send( () => cf[method]({
                StackName: stackName,
                TemplateBody: this.updateStackTemplate,
                Capabilities: ['CAPABILITY_IAM'],
                //OnFailure: this.debug? 'ROLLBACK': 'DELETE',
            }) )
            .then( () => {
                send( () => this.client.waitFor(successState, {
                    StackName: stackName
                }))
                .then( () => shell.resolveTask(resolve) )
                .catch( (x) => shell.rejectTask(reject, x) )
            })
            .catch((x) => shell.rejectTask(reject, x));

        }))

    }


    send(method:string, ...params: any[]) {
        return new Promise((resolve, reject) => {
            this.client[method](...params)
            .on('success', (response) => resolve(response) )
            .on('error', (response) => reject(response) )
            .send();
        });
    }

}

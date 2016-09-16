import * as _common from './common';
export const common = _common;

import * as _cloudFormation from './cloudFormation';
export const cloudFormation = _cloudFormation;

import * as _gateway from './gateway';
export const gateway = _gateway;

import * as _lambda from './lambda';
export const lambda = _lambda;

import * as _s3 from './s3';
export const s3 = _s3;



import * as aws from 'aws-sdk';

function send(request) {
    return new Promise((resolve, reject) => {
        request
        .on('success', (response) => resolve(response) )
        .on('error', (response) => reject(response) )
        .send();
    });
}

export class CloudFormationClient {
    client: any;

    constructor(){
        this.client = new aws['CloudFormation']({
            region: 'us-east-1'
        });

    }

    validateTemplate(template: Object){
        return send(this.client.validateTemplate({
            TemplateBody: JSON.stringify(template)
        }));
    }
}

import * as aws from 'aws-sdk';

export abstract class Resource {
    service: any;

    constructor(service: string, options?: any){
        let srv = aws[service];
        if(service === undefined)
            throw new Error(`AWS unknow service ${service}`);
        this.service = new srv(options);
    }

    call(method:string, params?:any) {
        return new Promise((resolve, reject) => {
            this.service[method](params, () => {})
            .on('success', (response) => resolve(response.data) )
            .on('error', (response) => reject(response.data) );
        });
    }
};



export class Bucket extends Resource {

    constructor(public name:string) {
        super('S3', {
            params: {
                Bucket: name
            }
        });
    }

    create() {
        return this.call('createBucket');
    }

    createFolder(name: string, ACL:string='private') {
        return this.call('upload', {
            Key: name + '/',
            Body: 'body',
            ACL
        });
    }

    listObjects() {
        return this.call('listObjectsV2');
    }

}

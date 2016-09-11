import {Project, Step, ParallelTask, SerialTask} from '../../core';
import {Bucket} from './resource';

export class Deployment extends SerialTask {
    buckets: { [key:string]: Bucket };

    constructor(public project: Project, public stage:string='development', public region:string = 'us-east-1') {
        super(`Deploying ${project.name} ${stage} stage on ${region}`);
    }

    get stackName(): string {
        return `${this.project.name}-${this.stage}`;
    }
}

class PrepareStack extends SerialTask {
    constructor(deployment: Deployment) {
        super(`Preparing stack ${deployment.name}`);

    }
}
/*
class DeployStage extends SerialTask {
    constructor(deployment: Deployment) {
        super(`Deploying ${project.name}`);

        this.appendStep( new ZipDirectory(project.buildDir) );
    }
}*/

export class EnsureBucket extends Step {
    constructor(public bucket: Bucket) {
        super(`Ensuring the existence of the bucket ${bucket.name}`);
    }

    perform() {
        return this.bucket.create();
    }
}
/*

export class CreateBucketFolder extends Task<Deployer> {
    constructor(public bucket: string, public folder: string) {
        super();
    }

    logEntry(){
        console.log(`Creating folder ${this.folder} on ${this.bucket} bucket`);
    }

    task(deployer: Deployer) {
        let bucket = deployer.buckets[this.bucket];
        return bucket.createFolder(this.folder);
    }
}

*/
//export * from './core';
//export * from './tasks';
//export * from './targets';

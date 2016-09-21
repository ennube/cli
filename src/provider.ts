import {Shell, Manager, manager, command} from './shell';
import {Project} from './project';
import {Builder} from './builder';

import {Amazon} from './providers/amazon';

/*
    Esta es una clase intermediaria
 */

export abstract class Provider {

    constructor(public shell: Shell) {

    }

    @command('deploy')
    deploy(shell:Shell, project: Project, builder: Builder) {

        let amazon = new Amazon(project);

        return Promise.resolve()
        .then( () => builder.build(shell, project) )

        .then( () => amazon.ensurePrepared() )

        .then( () => amazon.uploadDeploymentFiles() )

        .then( () => amazon.updateStack(shell) );


    }



}

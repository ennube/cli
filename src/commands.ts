import {CommandService, command, Builder, Packager, providers} from './index';
import {pascalCase} from 'change-case';

class Commands extends CommandService {

    @command('deploys the application', (yargs) => yargs
        .option('stage', { default: 'development' })
        .option('provider', { default: 'amazon' })
        .boolean('dry')
    )
    deploy(args) {
        //console.log(args);
        console.log(`${this.project.name } will storm the sky`);

        let providerClass = pascalCase(args.provider);

        let builder = new Builder(this.project);
        let packager = new Packager(this.project);
        let provider = new providers[providerClass](this.project);

        Promise.resolve()
        .then(() => builder.build() )
        .then(() => packager.packup() )
        .then(() => provider.ensure() )
        .then(() => provider.upload() )
        .then(() => provider.update() )
        .then(() => console.log('\nDeployment completed'));

    }


}

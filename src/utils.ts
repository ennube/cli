import {Promise} from 'es6-promise';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as archiver from 'archiver';

export function readJsonSync(filename: string)
{
    if(!fs.existsSync(filename))
        return null;
    return JSON.parse(fs.readFileSync(filename, 'utf8')) || {};
}

export function writeJsonSync(filename: string, data: any)
{
    fs.writeFileSync(filename, JSON.stringify(data));
}

export function readYamlSync(filename: string)
{
    if(!fs.existsSync(filename))
        return null;
    return yaml.safeLoad(fs.readFileSync(filename, 'utf8')) || {};
}

export function writeYamlSync(filename: string, data: any)
{
    fs.writeFileSync(filename, yaml.safeDump(data));
}


export function zipDirectory(directory:string, output?:string) {
    return new Promise((resolve, reject) => {
        output = output || `${directory}.zip`;
        var outFile = fs.createWriteStream(output);
        let archive = <any>archiver.create('zip', {});

        outFile.on('close', () => resolve(output))
        archive.on('error', (error) => reject(error));

        archive.pipe(outFile);
        archive.directory(directory, '/', {});
        archive.finalize();
    });
}

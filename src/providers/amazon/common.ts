import {pascalCase, paramCase} from 'change-case';

// common
export function getStackName(projectName: string, stage: string) {
    return `${pascalCase(projectName)}-${pascalCase(stage)}`;
}

export function ref(id:string) {
    return { Ref: id };
}

export function getAtt(id:string, attr:string){
    return { "Fn::GetAtt": [id, attr] };
}

export function mixin(...baseClasses) {
    return (targetClass: Function) => {
        for(let baseClass of baseClasses) {
            for(let property of Object.getOwnPropertyNames(baseClass.prototype)) {
                targetClass.prototype[property] = baseClass.prototype[property];
            }
        }
    }
}

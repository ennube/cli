/// <reference types="core-js" />
export declare function getStackName(projectName: string, stage: string): string;
export declare function ref(id: string): {
    Ref: string;
};
export declare function getAtt(id: string, attr: string): {
    "Fn::GetAtt": string[];
};
export declare function mixin(...baseClasses: any[]): (targetClass: Function) => void;

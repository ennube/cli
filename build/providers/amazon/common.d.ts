/// <reference types="core-js" />
export declare function getStackName(projectName: string, stage: string): string;
export declare function ref(id: string): {
    Ref: string;
};
export declare function getAtt(id: string, attr: string): {
    "Fn::GetAtt": string[];
};
export declare function fnJoin(...params: any[]): {
    "Fn::Join": any[];
};
export declare function mixin(...baseClasses: any[]): (targetClass: Function) => void;
export declare namespace fn {
    function ref(id: string): {
        Ref: string;
    };
    function getAtt(targetId: string, attr: string): {
        "Fn::GetAtt": string[];
    };
    function join(delimitier: string, ...params: any[]): {
        "Fn::Join": (string | any[])[];
    };
}

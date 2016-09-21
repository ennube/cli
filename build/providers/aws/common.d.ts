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

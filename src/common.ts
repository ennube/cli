
export interface Type extends Function {

}

export function typeOf(value: any): Type {
    if(value === undefined)
        return undefined;

    if(value === null)
        return null;

    return Object.getPrototypeOf(value).constructor;

}

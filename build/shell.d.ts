export interface ManagerClass extends Function {
    new (...params: Manager[]): Manager;
}
export interface Manager {
}
export declare const allManagers: {
    [managerName: string]: {
        managerClass: ManagerClass;
        paramTypes: ManagerClass[];
        commands: {
            [methodName: string]: {
                command: string;
                description?: string;
                builder?: any;
            };
        };
    };
};
export declare function manager(...paramTypes: ManagerClass[]): (managerClass: ManagerClass) => void;
export declare function command(command: string, description?: string, builder?: any): (managerPrototype: any, methodName: string, descriptor: PropertyDescriptor) => void;
export declare class Shell implements Manager {
    private allManagerInstances;
    constructor();
    getManagerInstance(managerClass: ManagerClass): Manager;
    readonly projectDir: string;
    taskMessage: string;
    task(message: string): void;
    resolveTask(resolve: any, ...params: any[]): any;
    rejectTask(reject: any, ...params: any[]): any;
    cli(): void;
    startRepl(): void;
}

export declare type StepCall = [string, any[]];
export declare class Task {
    steps: StepCall[];
    constructor(steps: StepCall[]);
    static step(name: string): void;
}

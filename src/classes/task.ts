
export type StepCall = [string, any[]];

export class Task {

    constructor(public steps: StepCall[]) {

    }

    // decorator of step methods any step is assigned with class..
    // call to a task
    static step(name:string) {

    }
}

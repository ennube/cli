import { ICommandService, Project } from './index';
import { Adapter } from '@ennube/sdk';
export declare class StackCommandService implements ICommandService {
    project: Project;
    adapter: Adapter;
    constructor(project: Project);
    info(): void;
    compile(): void;
}

// type-extensions.d.ts

import "hardhat/types/config";
import "hardhat/types/runtime";
import {TaskDefinition} from 'hardhat/types';

declare module "hardhat/types/runtime" {
    interface HardhatRuntimeEnvironment {
        // Any extensions to the HRE go here
    }

    interface TasksMap {
        setAttester: TaskDefinition;
    }
}

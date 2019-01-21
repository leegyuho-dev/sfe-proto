// SFE Core
// export { LoadingManager } from './core/LoadingManager.js';
// export { TaskManager } from './core/TaskManager.js';
// export { AssetsManager } from './core/AssetsManager.js';
// export { ComponentsMaker } from './core/ComponentsMaker.js';

import { LoadingManager } from './core/LoadingManager.js';
import { TaskManager } from './core/TaskManager.js';
import { AssetsManager } from './core/AssetsManager.js';
import { ComponentsMaker } from './core/ComponentsMaker.js';

if (window.SFE === undefined) {
    window.SFE = {}
}
SFE.LoadingManager = LoadingManager;
SFE.TaskManager = TaskManager;
SFE.AssetsManager = AssetsManager;
SFE.ComponentsMaker = ComponentsMaker;
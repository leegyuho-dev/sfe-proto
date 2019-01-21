// SFE Tools
// export { Player } from './tools/Player.js';
// export { Wiki } from './tools/Wiki.js';

import { Player } from './tools/Player.js';
// import { Wiki } from './tools/Wiki.js';

if (window.SFE === undefined) {
    window.SFE = {}
}
SFE.Player = Player;
// SFE.Wiki = Wiki;

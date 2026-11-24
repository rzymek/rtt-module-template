import {P} from "./globals"
import {attack} from "./procedures/attack"
import {player_turn} from "./procedures/turn"

export * from "./lifecycle"

// framework.js links to these by name, which the bundler can't see: unused, they'd get tree-shaken away.
export {L, ROLES} from "./globals"

// Every state, in one place.
P.player_turn = player_turn
P.attack = attack

// The attack sub-procedure: call("attack", {attacker, target}); it ends with an AttackResult, which the caller's
// _resume finds in L.$.
import {rollDie, type FrameState, type StateDefinition} from "@rzymek/rally-the-troops-module/rules"
import {G, L} from "../globals"
import {rollButton} from "../game/dice"
import {isRough, spaceRef} from "../game/map"
import {pieceById, pieceName, pieceRef} from "../game/pieces"
import type {Piece} from "../types"

export interface AttackResult {
  hit: boolean
}

interface AttackScope {
  attacker: number
  target: number
}

const scope = () => L as FrameState & AttackScope

/** The roll needed to hit: 4+, 5+ into rough. */
export const hitOn = (target: Piece) => isRough(target.at) ? 5 : 4

export const attack: StateDefinition = {
  inactive: "attack",
  _begin() {
    const attacker = pieceById(scope().attacker), target = pieceById(scope().target)
    const rough = isRough(target.at) ? ", +1 for rough" : ""
    log(`${pieceRef(attacker)} attacks ${pieceRef(target)} in ${spaceRef(target.at)}: hits on ${hitOn(target)}+${rough}.`)
  },
  prompt() {
    const target = pieceById(scope().target)
    prompt(`Attack on ${pieceName(target)}: roll a die, ${hitOn(target)} or more hits.`)
    rollButton(`Roll for the attack (${hitOn(target)}+)`)
  },
  roll() {
    const {attacker, target: targetId} = scope()
    const target = pieceById(targetId)
    const die = rollDie()
    // The roll can't be undone, so what it reveals may be shown now.
    set_add(G.revealed, attacker)
    set_add(G.revealed, targetId)
    const hit = die >= hitOn(target)
    if (!hit) {
      log(`.miss Rolled ${die}: a miss.`)
    } else if (--target.strength > 0) {
      log(`.hit Rolled ${die}: a hit. ${pieceRef(target)} loses a step, ${target.strength} left.`)
    } else {
      log(`.hit .loss Rolled ${die}: a hit. ${pieceRef(target)} is eliminated.`)
      target.at = ""
    }
    end({hit} satisfies AttackResult)
  },
}

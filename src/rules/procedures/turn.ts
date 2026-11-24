import type {FrameState, StateDefinition} from "@rzymek/rally-the-troops-module/rules"
import {ROLE_NAMES} from "../../shared/shared"
import {G, L} from "../globals"
import {spaceRef} from "../game/map"
import {attackTargets, BLUE, moveTargets, otherSide, pieceById, pieceName, pieceRef, piecesOf, RED, whyNoMove} from "../game/pieces"
import {checkVictory, endOfGame} from "../game/victory"

interface TurnScope {
  /** The piece selected to move or attack with. */
  selected?: number
}

const scope = () => L as FrameState & TurnScope

/** The active side's pieces that haven't moved or attacked yet this player turn. */
const readyPieces = () => piecesOf(G.active).filter(piece => !set_has(G.moved, piece.id))

/** A player turn: each piece may move one space or attack once, then the player ends the turn. */
export const player_turn: StateDefinition = {
  inactive: "move",
  _begin() {
    G.moved = []
    if (G.active === RED) log(`.h1 Turn ${G.turn}`)
    log(`.h2 ${ROLE_NAMES[G.active]}`)
  },
  prompt() {
    const ready = readyPieces()
    for (const piece of ready) action("select_piece", piece.id)
    button("done")
    const id = scope().selected
    if (id === undefined) {
      prompt(ready.length > 0 ? "Select a piece to move or attack with, or end the turn." : "Every piece has moved: end the turn.")
      return
    }
    const piece = pieceById(id)
    const moves = moveTargets(piece), targets = attackTargets(piece)
    for (const to of moves) action("move_space", to)
    for (const target of targets) action("attack_piece", target)
    const can = [moves.length > 0 ? "move to a highlighted space" : "", targets.length > 0 ? "attack a highlighted enemy" : ""]
      .filter(Boolean)
    // Say why an option the player may expect isn't there.
    const cannot = [
      moves.length === 0 ? `It cannot move: ${whyNoMove(piece)}.` : "",
      targets.length === 0 ? "There is no enemy next to it to attack." : "",
    ].filter(Boolean)
    prompt([`${pieceName(piece)}: ${can.length > 0 ? can.join(", or ") + "." : "nothing it can do."}`, ...cannot].join(" "))
  },
  select_piece(id: number) {
    // Only a selection: nothing to undo.
    scope().selected = scope().selected === id ? undefined : id
  },
  move_space(to: string) {
    push_undo()
    const piece = pieceById(scope().selected!)
    log(`${pieceRef(piece)} moves from ${spaceRef(piece.at)} to ${spaceRef(to)}.`)
    piece.at = to
    set_add(G.moved, piece.id)
    scope().selected = undefined
  },
  attack_piece(target: number) {
    push_undo()
    const attacker = scope().selected!
    set_add(G.moved, attacker)
    scope().selected = undefined
    call("attack", {attacker, target})
  },
  _resume() {
    delete L.$
    checkVictory()
  },
  done() {
    log(`${ROLE_NAMES[G.active]} ends the turn.`)
    if (G.active === BLUE) {
      if (G.turn >= G.lastTurn) return endOfGame()
      G.turn++
    }
    G.active = otherSide(G.active)
    goto("player_turn")
  },
}

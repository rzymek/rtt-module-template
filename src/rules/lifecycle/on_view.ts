import type {FrameState} from "@rzymek/rally-the-troops-module/rules"
import {G, L, R, V} from "../globals"
import {isOnMap} from "../game/pieces"
import type {Piece} from "../types"

/** Whether the viewer may see the piece's strength: its own, and the enemy's once a die roll has revealed it. */
const isVisible = (piece: Piece) => piece.side === R || set_has(G.revealed, piece.id)

export function on_view() {
  V.turn = G.turn
  V.lastTurn = G.lastTurn
  V.pieces = G.pieces.filter(isOnMap)
    .map(piece => isVisible(piece) ? {...piece} : {id: piece.id, side: piece.side, name: piece.name, at: piece.at})
  V.moved = G.moved
  const scope = L as FrameState & {selected?: number, attacker?: number, target?: number}
  if (R === G.active && L.P === "player_turn" && scope.selected !== undefined) V.selected = scope.selected
  if (L.P === "attack") V.attack = {attacker: scope.attacker!, target: scope.target!}
}

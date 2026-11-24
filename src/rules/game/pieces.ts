import {ref} from "@rzymek/rally-the-troops-module/rules"
import {ROLE_NAMES} from "../../shared/shared"
import {G} from "../globals"
import type {Piece} from "../types"
import {adjacentSpaces, crossesRiver} from "./map"

export const RED = 0
export const BLUE = 1
export const otherSide = (side: number) => 1 - side

/** How many pieces of a side a space may hold. */
export const STACKING = 2

export const pieceById = (id: number): Piece => G.pieces[id]
export const isOnMap = (piece: Piece) => piece.at !== ""
export const piecesOf = (side: number) => G.pieces.filter(piece => piece.side === side && isOnMap(piece))
export const piecesAt = (space: string) => G.pieces.filter(piece => piece.at === space)

export const pieceName = (piece: Piece) => `${ROLE_NAMES[piece.side]} ${piece.name}`

/** A piece in the log: the client highlights it on hover and pans to it on click. */
export const pieceRef = (piece: Piece) => ref("p", piece.id, pieceName(piece))

const hasEnemy = (space: string, side: number) => piecesAt(space).some(it => it.side !== side)
const isFull = (space: string, side: number) => piecesAt(space).filter(it => it.side === side).length >= STACKING

/** The spaces the piece may move to: next to it, not across a river, free of enemies and not full. */
export function moveTargets(piece: Piece): string[] {
  return adjacentSpaces(piece.at).filter(to => !crossesRiver(piece.at, to) && !hasEnemy(to, piece.side) && !isFull(to, piece.side))
}

/** Why the piece has nowhere to move: what a player expecting to move it needs to know. */
export function whyNoMove(piece: Piece): string {
  const reasons = new Set(adjacentSpaces(piece.at).map(to =>
    crossesRiver(piece.at, to) ? "across a river" : hasEnemy(to, piece.side) ? "held by the enemy" : "full"))
  return `every space next to it is ${[...reasons].join(" or ")}`
}

/** The enemy pieces the piece may attack: next to it, not across a river. */
export function attackTargets(piece: Piece): number[] {
  return adjacentSpaces(piece.at).filter(to => !crossesRiver(piece.at, to))
    .flatMap(to => piecesAt(to).filter(it => it.side !== piece.side).map(it => it.id))
    .sort((a, b) => a - b)
}

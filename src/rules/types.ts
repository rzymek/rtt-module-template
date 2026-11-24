import type {BaseGameState} from "@rzymek/rally-the-troops-module/rules"

export interface Piece {
  /** Its index in G.pieces. */
  id: number
  side: number
  name: string
  /** Its space, or "" once eliminated. */
  at: string
  /** Steps left: a hit takes one. */
  strength: number
}

/** The game state: everything that lasts between actions. What a state needs only while it runs goes in L. */
export interface GameState extends BaseGameState {
  scenario: string
  options: Record<string, boolean>
  turn: number
  lastTurn: number
  pieces: Piece[]
  /** Sorted ids of the pieces that moved or attacked this player turn. */
  moved: number[]
  /** Sorted ids of the pieces whose strength the enemy has seen. */
  revealed: number[]
}

import type {BaseViewState} from "@rzymek/rally-the-troops-module/rules"

/** What the active player may do: the arguments of each action, or a button. */
export interface ViewActions {
  select_piece?: number[]
  move_space?: string[]
  attack_piece?: number[]
  /** A button, labelled with what the roll is for. */
  roll?: number | string
  done?: number
  undo?: number
}

/** A piece as its viewer sees it: the enemy's strength only once a die roll has revealed it. */
export interface ViewPiece {
  id: number
  side: number
  name: string
  at: string
  strength?: number
}

/** What on_view sends to the client. */
export interface View extends BaseViewState<ViewActions> {
  turn: number
  lastTurn: number
  pieces: ViewPiece[]
  /** The pieces that moved or attacked this player turn. */
  moved: number[]
  /** For the active player: the piece selected to move or attack with. */
  selected?: number
  /** While an attack is being rolled for. */
  attack?: {attacker: number, target: number}
}

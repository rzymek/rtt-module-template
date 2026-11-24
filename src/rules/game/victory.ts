import {ROLE_NAMES} from "../../shared/shared"
import {BLUE, otherSide, piecesOf, RED} from "./pieces"

export const strengthOf = (side: number) => piecesOf(side).reduce((sum, piece) => sum + piece.strength, 0)

/** Ends the game when a side has no pieces left; whether it did. */
export function checkVictory(): boolean {
  for (const side of [RED, BLUE]) {
    if (piecesOf(side).length > 0) continue
    finish(otherSide(side), `${ROLE_NAMES[otherSide(side)]} wins: every ${ROLE_NAMES[side]} piece is eliminated.`)
    return true
  }
  return false
}

/** After the last turn, the side with the most strength left wins. */
export function endOfGame() {
  const red = strengthOf(RED), blue = strengthOf(BLUE)
  const score = `strength ${red} to ${blue}`
  if (red === blue) finish("Draw", `Draw: ${score}.`)
  else {
    const winner = red > blue ? RED : BLUE
    finish(winner, `${ROLE_NAMES[winner]} wins on ${score}.`)
  }
}

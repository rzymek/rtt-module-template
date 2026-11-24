import {ROLE_NAMES} from "../../shared/shared"
import {G} from "../globals"
import {START_SPACES} from "./map"
import {BLUE, RED} from "./pieces"

export interface Scenario {
  turns: number
  /** Each side's pieces, placed in turn on its set-up spaces. */
  pieces: {name: string, strength: number}[]
}

export const SCENARIOS: Record<string, Scenario> = {
  Standard: {
    turns: 8,
    pieces: [{name: "Guards", strength: 3}, {name: "Line", strength: 2}, {name: "Militia", strength: 1}],
  },
}

export function setUp(scenario: string, options: Record<string, boolean>) {
  const data = SCENARIOS[scenario]
  if (!data) throw new Error(`no scenario ${scenario}`)
  G.scenario = scenario
  G.options = options
  G.turn = 1
  // The "short" option of create.html.
  G.lastTurn = options.short ? 4 : data.turns
  G.pieces = []
  for (const side of [RED, BLUE]) {
    const starts = START_SPACES[side]
    if (starts.length === 0) throw new Error(`no ${ROLE_NAMES[side]} set-up spaces: mark them with pnpm edit:terrain`)
    data.pieces.forEach(({name, strength}, i) =>
      G.pieces.push({id: G.pieces.length, side, name, at: starts[i % starts.length], strength}))
  }
  G.moved = []
  G.revealed = []
  G.active = RED
  log(`.h1 ${scenario}`)
  log(`${G.lastTurn} turns. Each side's piece strengths stay hidden from the other until a die is rolled in an attack.`)
}

import {beforeEach, describe, expect, it, vi} from "vitest"
import {offered, stubFramework} from "@rzymek/rally-the-troops-module/testing"
import {G, L, V} from "../globals"
import {setUp} from "../game/scenarios"
import {attack, type AttackResult} from "./attack"

vi.mock("../globals", async importOriginal => ({...await importOriginal<typeof import("../globals")>(), G: {}, L: {}, V: {}}))

type Handlers = Record<string, (argument?: unknown) => void>
const state = attack as unknown as Handlers & {prompt(): void}

let dice: number[] = []
const end = vi.fn()

beforeEach(() => {
  for (const key of Object.keys(G)) delete (G as unknown as Record<string, unknown>)[key]
  for (const key of Object.keys(L)) delete L[key]
  dice = []
  end.mockClear()
  stubFramework({end, random: () => dice.shift()! - 1})
  setUp("Standard", {})
  // Red Guards (0) attack Blue Line (4), next to each other.
  G.pieces[0].at = "0202"
  G.pieces[4].at = "0302"
  Object.assign(L, {attacker: 0, target: 4})
})

/** The prompt, with the view's actions as the framework sets them up. */
function prompt() {
  V.actions = {}
  const result = offered(state)
  return {...result, label: V.actions.roll}
}

describe("attack", () => {
  it("logs what the roll is for, then stops for a labelled Roll button", () => {
    state._begin()
    expect(log).toHaveBeenLastCalledWith("{p:0:Red Guards} attacks {p:4:Blue Line} in {s:0302:0302}: hits on 4+.")
    expect(prompt()).toMatchObject({buttons: {roll: true}, label: "Roll for the attack (4+)"})
  })

  it("needs one more into rough", () => {
    G.pieces[4].at = "0303"
    expect(prompt().label).toBe("Roll for the attack (5+)")
  })

  it("rolls, which can't be undone, reveals both pieces and takes a step on a hit", () => {
    dice = [4]
    state.roll()
    expect(clear_undo).toHaveBeenCalled()
    expect(G.revealed).toEqual([0, 4])
    expect(G.pieces[4].strength).toBe(1)
    expect(end).toHaveBeenCalledWith({hit: true} satisfies AttackResult)
  })

  it("misses below the number needed", () => {
    dice = [3]
    state.roll()
    expect(G.pieces[4].strength).toBe(2)
    expect(log).toHaveBeenLastCalledWith(".miss Rolled 3: a miss.")
    expect(end).toHaveBeenCalledWith({hit: false})
  })

  it("eliminates a piece at its last step", () => {
    G.pieces[4].strength = 1
    dice = [6]
    state.roll()
    expect(G.pieces[4].at).toBe("")
    expect(log).toHaveBeenLastCalledWith(".hit .loss Rolled 6: a hit. {p:4:Blue Line} is eliminated.")
  })
})

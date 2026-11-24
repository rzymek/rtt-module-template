import {beforeEach, describe, expect, it, vi} from "vitest"
import {gotoRecorder, offered, stubFramework} from "@rzymek/rally-the-troops-module/testing"
import {G, L} from "../globals"
import {BLUE, RED} from "../game/pieces"
import {setUp} from "../game/scenarios"
import {player_turn} from "./turn"

// Each spec gets its own G and L: the rules code reads and writes these objects.
vi.mock("../globals", async importOriginal => ({...await importOriginal<typeof import("../globals")>(), G: {}, L: {}}))

type Handlers = Record<string, (argument?: unknown) => void>
const state = player_turn as unknown as Handlers & {prompt(): void}

const recorder = gotoRecorder(L, {player_turn})
const call = vi.fn()
const finish = vi.fn()

beforeEach(() => {
  for (const key of Object.keys(G)) delete (G as unknown as Record<string, unknown>)[key]
  for (const key of Object.keys(L)) delete L[key]
  call.mockClear()
  finish.mockClear()
  stubFramework({goto: recorder.goto, call, finish})
  // Red: Guards 0102, Line 0104, Militia 0201; Blue: Guards 0802, Line 0804, Militia 0705.
  setUp("Standard", {})
})

/** Puts a piece somewhere, for the case at hand. */
const place = (id: number, at: string) => { G.pieces[id].at = at }

describe("player turn", () => {
  it("offers the active side's pieces, then where the selected one may go", () => {
    expect(offered(state).actions).toEqual({select_piece: ["0", "1", "2"]})
    state.select_piece(0)
    // 0201 holds one Red piece: two may stack.
    expect(offered(state).actions.move_space).toEqual(["0101", "0103", "0201", "0202"])
    state.select_piece(0)
    expect(offered(state).actions.move_space).toBeUndefined()
  })

  it("doesn't cross rivers, nor stack more than two pieces", () => {
    place(0, "0401")
    place(1, "0402")
    place(2, "0402")
    state.select_piece(0)
    // 0501 and 0502 are across the river; 0402 is full.
    expect(offered(state).actions.move_space).toEqual(["0301", "0302"])
  })

  it("says why a piece can't move or attack", () => {
    place(0, "0101")
    place(1, "0102")
    place(2, "0102")
    place(3, "0201")
    state.select_piece(0)
    const {actions, text} = offered(state)
    expect(actions.move_space).toBeUndefined()
    expect(actions.attack_piece).toEqual(["3"])
    expect(text).toBe("Red Guards: attack a highlighted enemy. It cannot move: every space next to it is full or held by the enemy.")
  })

  it("moves a piece once, undoably", () => {
    state.select_piece(0)
    state.move_space("0101")
    expect(push_undo).toHaveBeenCalled()
    expect(G.pieces[0].at).toBe("0101")
    expect(log).toHaveBeenLastCalledWith("{p:0:Red Guards} moves from {s:0102:0102} to {s:0101:0101}.")
    expect(offered(state).actions.select_piece).toEqual(["1", "2"])
  })

  it("attacks an enemy next to it through the attack procedure", () => {
    place(3, "0101")
    state.select_piece(0)
    expect(offered(state).actions.attack_piece).toEqual(["3"])
    state.attack_piece(3)
    expect(call).toHaveBeenCalledWith("attack", {attacker: 0, target: 3})
    expect(G.moved).toEqual([0])
  })

  it("ends the game when a side has no pieces left", () => {
    for (const piece of G.pieces) if (piece.side === BLUE) piece.at = ""
    state._resume()
    expect(finish).toHaveBeenCalledWith(RED, "Red wins: every Blue piece is eliminated.")
  })

  it("hands over to the other side, and after the last turn decides on strength", () => {
    state.done()
    expect(recorder.state).toBe("player_turn")
    expect(G.active).toBe(BLUE)
    G.turn = G.lastTurn
    G.pieces[0].strength = 1
    state.done()
    expect(finish).toHaveBeenCalledWith(BLUE, "Blue wins on strength 4 to 6.")
  })

  it("has a shorter game as an option", () => {
    setUp("Standard", {short: true})
    expect(G.lastTurn).toBe(4)
  })
})

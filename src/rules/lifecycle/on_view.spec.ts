import {beforeEach, expect, it, vi} from "vitest"
import {stubFramework} from "@rzymek/rally-the-troops-module/testing"
import {G, L, V} from "../globals"
import {setUp} from "../game/scenarios"
import {on_view} from "./on_view"

// The viewer is Red (R = 0).
vi.mock("../globals", async importOriginal => ({...await importOriginal<typeof import("../globals")>(), G: {}, L: {}, V: {}, R: 0}))

beforeEach(() => {
  for (const key of Object.keys(G)) delete (G as unknown as Record<string, unknown>)[key]
  for (const key of Object.keys(L)) delete L[key]
  for (const key of Object.keys(V)) delete (V as unknown as Record<string, unknown>)[key]
  stubFramework()
  setUp("Standard", {})
  L.P = "player_turn"
})

const seen = (id: number) => V.pieces.find(it => it.id === id)

it("hides the enemy's strengths until a die roll reveals them", () => {
  on_view()
  expect(seen(0)?.strength).toBe(3)
  expect(seen(3)?.strength).toBeUndefined()
  G.revealed = [3]
  on_view()
  expect(seen(3)?.strength).toBe(3)
})

it("leaves eliminated pieces out", () => {
  G.pieces[3].at = ""
  on_view()
  expect(seen(3)).toBeUndefined()
})

it("shows the selected piece to the active player only", () => {
  L.selected = 1
  on_view()
  expect(V.selected).toBe(1)
  G.active = 1
  delete V.selected
  on_view()
  expect(V.selected).toBeUndefined()
})

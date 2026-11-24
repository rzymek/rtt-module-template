// The map, as the rules see it: generated data (see tools/map/write-map.ts), the same for hex and area maps.
import {ref} from "@rzymek/rally-the-troops-module/rules"
import {ADJACENT, NAMES, TERRAIN} from "./map-data"

const ROUGH = new Set<string>(TERRAIN.rough)
const RIVERS = new Set<string>(TERRAIN.river)

/** A border's key in TERRAIN: "<id>|<id>", sorted. */
export const borderKey = (a: string, b: string) => a < b ? `${a}|${b}` : `${b}|${a}`

export const adjacentSpaces = (space: string): readonly string[] => ADJACENT[space] ?? []

export const isRough = (space: string) => ROUGH.has(space)

export const crossesRiver = (from: string, to: string) => RIVERS.has(borderKey(from, to))

/** The set-up spaces of each side, marked on the map with the terrain editor. */
export const START_SPACES: readonly (readonly string[])[] = [TERRAIN.red_start, TERRAIN.blue_start]

export const spaceName = (space: string) => NAMES[space] ?? space

/** A space in the log: the client highlights it on hover and pans to it on click. */
export const spaceRef = (space: string) => ref("s", space, spaceName(space))

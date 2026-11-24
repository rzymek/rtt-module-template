// The printed hex grid, measured on the map image: the rules and the map both come from it.
import {HEX_FORMATS, type OffsetHexGridOptions} from "@rzymek/rally-the-troops-module/rules"

export const GRID = {
  /** Columns and rows as printed (see createOffsetHexGrid for `shifted`). */
  columns: [1, 8],
  rows: [1, 6],
  shifted: "even",
  format: HEX_FORMATS.fourDigit,
  /** Leave out the hexes that aren't playable, e.g. less than half of them showing: ask when in doubt. */
  isOnMap: (_column: number, _row: number) => true,
} satisfies OffsetHexGridOptions

/** In pixels of the map image. */
export const LAYOUT = {
  /** The center of the first column's first row. */
  first: {x: 70, y: 70},
  /** Between the centers of neighbouring columns, and of the hexes of a column. */
  columnStep: 90,
  rowStep: 104,
  /** Whether rows are numbered upward on the map (e.g. TCS) rather than downward. */
  rowsUp: false,
  /** The map image in public/, e.g. "images/map.jpg", and its size; without one, a plain background stands in. */
  image: undefined as {href: string, width: number, height: number} | undefined,
}

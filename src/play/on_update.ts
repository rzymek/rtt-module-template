import {actionFor, svgElement} from "@rzymek/rally-the-troops-module/client"
import type {Player} from "../shared/shared"
import type {ViewPiece} from "../shared/view"
import {PIECE_ACTIONS, SPACE_ACTIONS} from "./actions"

const SIZE = 44
/** The client's own copy of the rules' ROLE_NAMES: runtime code imported by both bundles breaks rules.js. */
const ROLE_NAMES: readonly Player[] = ["Red", "Blue"]

function drawPiece(piece: ViewPiece, [x, y]: number[], layer: Element) {
  const g = svgElement("g", {
    class: `piece side-${ROLE_NAMES[piece.side].toLowerCase()}`,
    "data-piece": piece.id,
    transform: `translate(${x - SIZE / 2} ${y - SIZE / 2})`,
  }, layer)
  svgElement("rect", {width: SIZE, height: SIZE, rx: 4}, g)
  svgElement("text", {x: SIZE / 2, y: 17, class: "name"}, g).textContent = piece.name
  // The enemy's strength stays hidden until revealed (on_view).
  svgElement("text", {x: SIZE / 2, y: 38, class: "strength"}, g).textContent = piece.strength === undefined ? "?" : String(piece.strength)
  const title = svgElement("title", {}, g)
  title.textContent = `${ROLE_NAMES[piece.side]} ${piece.name}` + (piece.strength === undefined ? "" : `, strength ${piece.strength}`)
  g.classList.toggle("selected", view.selected === piece.id || view.attack?.attacker === piece.id)
  g.classList.toggle("target", view.attack?.target === piece.id)
  g.classList.toggle("moved", view.moved.includes(piece.id))
  for (const verb of PIECE_ACTIONS)
    g.classList.toggle(`legal-${verb}`, actionFor([verb], piece.id) !== undefined)
  g.addEventListener("click", () => {
    const verb = actionFor(PIECE_ACTIONS, piece.id)
    if (verb) send_action(verb, piece.id)
  })
}

function drawPieces() {
  const layer = document.getElementById("pieces")!
  layer.replaceChildren()
  const bySpace = new Map<string, ViewPiece[]>()
  for (const piece of view.pieces) bySpace.set(piece.at, [...bySpace.get(piece.at) ?? [], piece])
  for (const [space, pieces] of bySpace) {
    const anchor = document.getElementById(space)?.dataset.anchor?.split(",").map(Number)
    if (!anchor) continue
    // A stack fans out down and to the right, so every piece stays visible and clickable.
    pieces.forEach((piece, i) => drawPiece(piece, [anchor[0] + i * 8, anchor[1] + i * 8], layer))
  }
}

function markSpaces() {
  document.querySelectorAll<SVGElement>("#spaces > [id]").forEach(el => {
    for (const verb of SPACE_ACTIONS) el.classList.toggle(`legal-${verb}`, actionFor([verb], el.id) !== undefined)
  })
}

export function onUpdate() {
  // action_button prepends, so the last one ends up first
  action_button("done", "End turn")
  action_button("roll")
  action_button("undo", "Undo")

  markSpaces()
  drawPieces()

  document.getElementById("turn_info")!.textContent = `Turn ${view.turn} of ${view.lastTurn}`
}

import {actionFor} from "@rzymek/rally-the-troops-module/client"
import {SPACE_ACTIONS} from "./actions"

export function onInit() {
  document.querySelectorAll<SVGElement>("#spaces > [id]").forEach(el => {
    el.addEventListener("click", () => {
      const verb = actionFor(SPACE_ACTIONS, el.id)
      if (verb) send_action(verb, el.id)
    })
  })
}

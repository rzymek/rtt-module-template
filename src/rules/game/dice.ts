import {V} from "../globals"

/**
 * The Roll button, labelled with what the roll is for. Never roll in the background: stop in a state whose only
 * action is this button, after a log line giving the roll's context (what for, modifiers, what is needed), so the
 * roll is no surprise and the player can still undo what led to it. Roll with rollDie() from the library, which
 * clears the undo stack first.
 */
export function rollButton(label: string) {
  button("roll")
  V.actions!.roll = label
}

import {normalizeOptions} from "@rzymek/rally-the-troops-module/rules"
import {SCENARIOS, setUp} from "../game/scenarios"

export const scenarios = Object.keys(SCENARIOS)

export function on_setup(scenario: string, options: Record<string, unknown> | undefined) {
  setUp(scenario, normalizeOptions(options))
  // The first state is entered with call: goto and end need a state to leave.
  call("player_turn")
}

import type {Player} from "../shared/shared"
import type {View} from "../shared/view"

// The client's globals come from @rzymek/rally-the-troops-module/client/globals (see src/rtt-env.d.ts): only the
// game's own types are merged in here.
declare global {
  interface GameView extends View {}

  interface GameTypes {
    player: Player
  }
}

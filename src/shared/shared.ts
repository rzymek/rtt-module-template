// Types for both the rules and the client; constants for the rules only. Code or data the two bundles both import
// at runtime is split into a chunk of its own, which rules.js can't load, and the build stops: give the client its
// own copy instead (see src/play/on_update.ts).
// Not named `roles`: the framework has a top-level `roles` of its own.
export const ROLE_NAMES = ["Red", "Blue"] as const
export type Player = typeof ROLE_NAMES[number]

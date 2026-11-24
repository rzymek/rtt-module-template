import {expect, it} from "vitest"
import {frameworkNameClashes} from "@rzymek/rally-the-troops-module/testing"

it("declares no top-level name that would replace one of the framework's (e.g. resume, finish)", () => {
  expect(frameworkNameClashes(new URL("./", import.meta.url).pathname)).toEqual([])
})

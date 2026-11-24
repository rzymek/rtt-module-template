import {createLogRenderer} from "@rzymek/rally-the-troops-module/client"

// The rules name pieces with ref("p", id, name) and spaces with ref("s", id, name): see rules/game/{pieces,map}.ts.
export const onLog = createLogRenderer({
  targets: {
    p: id => [...document.querySelectorAll(`#pieces [data-piece="${id}"]`)],
    s: id => [document.getElementById(id)].filter(it => it !== null),
  },
  wordClasses: [[/\b(Red|Blue)\b/g, "side"]],
})

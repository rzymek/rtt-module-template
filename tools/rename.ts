// Turns the template into a module:
//
//   pnpm rename <id> "<Title>" <bgg id>         spec.md from spec-template.md (any machine, e.g. a cloud environment)
//   pnpm rename:local <id> "<Title>" <bgg id>   spec.md from spec-template.local.md (the template author's machine)
//
// e.g. pnpm rename my-game "My Game" 12345. The id is the server's title_id: the module's directory under public/
// and its URLs. Also turns on the deploy workflow, which does nothing in the template.
import {existsSync, readFileSync, rmSync, writeFileSync} from "node:fs"

const args = process.argv.slice(2)
const local = args.includes("--local")
const [id, title, bgg] = args.filter(it => it !== "--local")
if (!id || !/^[a-z0-9-]+$/.test(id) || !title || !/^\d+$/.test(bgg ?? ""))
  throw new Error('usage: pnpm rename[:local] <id> "<Title>" <bgg id>  (id: lowercase letters, digits and dashes)')

const root = new URL("../", import.meta.url)
const path = (file: string) => new URL(file, root)

const FILES = [
  "package.json", "vite.config.ts", ".github/workflows/deploy.yml", "public/title.sql",
  "src/play/play.html", "src/play/play.ts", "src/about.html", "public/info/rules.html", "src/rules/playout.spec.ts",
]
for (const file of FILES) {
  const text = readFileSync(path(file), "utf8")
  const renamed = text
    .replaceAll("module-template", id)
    .replaceAll("Module Template", file.endsWith(".sql") ? title.replaceAll("'", "''") : title)
    .replace(/(values \( '(?:[^']|'')*', '(?:[^']|'')*', )\d+( \);)/, `$1${bgg}$2`)
    // The deploy workflow is off in the template (see deploy.yml): on for the game.
    .replace(/^.*# The template itself is not deployed.*\n.*# until pnpm rename\n/m, "")
  if (renamed !== text) {
    writeFileSync(path(file), renamed)
    console.log(`${file}: renamed`)
  }
}

// The spec: from the template chosen, with the game's names filled in.
const TEMPLATES = ["spec-template.md", "spec-template.local.md"]
if (existsSync(path("spec.md"))) {
  console.log("spec.md: already there, left as it is")
} else {
  const template = readFileSync(path(local ? TEMPLATES[1] : TEMPLATES[0]), "utf8")
  const spec = template
    .replace(/<!--[\s\S]*?-->\n\n/, "")
    .replaceAll("(bgg: <id>)", `(bgg: ${bgg})`)
    .replaceAll("<GAME NAME>", title)
    .replaceAll("<id>", id)
  writeFileSync(path("spec.md"), spec)
  console.log(`spec.md: from ${local ? TEMPLATES[1] : TEMPLATES[0]}`)
}
for (const file of TEMPLATES) rmSync(path(file), {force: true})

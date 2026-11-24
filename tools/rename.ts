// Turns the template into a module: pnpm rename <id> "<Title>" <bgg id>, e.g. pnpm rename my-game "My Game" 12345.
// The id is the server's title_id: the module's directory under public/ and its URLs.
import {readFileSync, writeFileSync} from "node:fs"

const [id, title, bgg] = process.argv.slice(2)
if (!id || !/^[a-z0-9-]+$/.test(id) || !title || !/^\d+$/.test(bgg ?? ""))
  throw new Error('usage: pnpm rename <id> "<Title>" <bgg id>  (id: lowercase letters, digits and dashes)')

const FILES = [
  "package.json", "vite.config.ts", ".github/workflows/deploy.yml", "public/title.sql",
  "src/play/play.html", "src/play/play.ts", "src/about.html", "public/info/rules.html",
]
const root = new URL("../", import.meta.url)
for (const file of FILES) {
  const path = new URL(file, root)
  const text = readFileSync(path, "utf8")
  const renamed = text
    .replaceAll("module-template", id)
    .replaceAll("Module Template", file.endsWith(".sql") ? title.replaceAll("'", "''") : title)
    .replace(/(values \( '(?:[^']|'')*', '(?:[^']|'')*', )\d+( \);)/, `$1${bgg}$2`)
    // The deploy workflow is off in the template (see deploy.yml): on for the game.
    .replace(/^.*# The template itself is not deployed.*\n.*# until pnpm rename\n/m, "")
  if (renamed !== text) {
    writeFileSync(path, renamed)
    console.log(`${file}: renamed`)
  }
}

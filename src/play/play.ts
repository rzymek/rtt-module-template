import {add_main_menu_item_link_newtab} from "@rzymek/rally-the-troops-module/client"
import {onInit} from "./on_init"
import {onLog} from "./on_log"
import {onUpdate} from "./on_update"

on_init = onInit
on_update = onUpdate
on_log = onLog

add_main_menu_item_link_newtab("Rules", "/module-template/info/rules.html")
// What the rules know about the map, to check against the printed one.
add_main_menu_item("Terrain overlay", () => document.body.classList.toggle("show-terrain"))
add_icon_button(1, "pieces_button", "earth-africa-europe", () => document.body.classList.toggle("hide-pieces"))

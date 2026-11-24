/** What a click on a space can mean, in the order tried. */
export const SPACE_ACTIONS = ["move_space"] as const
/** What a click on a piece can mean, in the order tried. */
export const PIECE_ACTIONS = ["attack_piece", "select_piece"] as const

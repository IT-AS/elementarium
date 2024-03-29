import Move from "../engine/moves/move";

export interface MoveInfo {
    gameId: string;
    token: string;
    moves: Move[];
    ai: Move[];
}

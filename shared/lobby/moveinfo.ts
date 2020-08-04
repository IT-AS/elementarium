import {Side} from "../engine/enums/side";
import Move from "../engine/moves/move";

export interface MoveInfo {
    gameId: string;
    token: string;
    moves: Move[];
}

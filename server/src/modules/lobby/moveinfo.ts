import {Side} from "../engine/enums/side";
import Move from "../engine/moves/move";

export interface MoveInfo {
    gameId: string;
    side: Side;
    moves: Move[];
}

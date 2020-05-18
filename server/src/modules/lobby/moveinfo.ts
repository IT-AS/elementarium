import Side from "../engine/enums/side";
import Move from "../engine/moves/move";

interface MoveInfo {
    gameId: string;
    side: Side;
    moves: Move[];
}

export default MoveInfo;
import Move from "./move";
import FieldEvent from "../events/fieldEvent";
import Side from "../enums/side";

interface HalfTurn {
    moves: Move[];
    captures: FieldEvent[];
    spawns: FieldEvent[];
    side: Side;
}

export default HalfTurn;
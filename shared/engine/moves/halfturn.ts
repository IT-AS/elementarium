import {FieldEvent} from "../events/fieldEvent";
import {Side} from "../enums/side";

import Move from "./move";

export interface HalfTurn {
    moves: Move[];
    captures: FieldEvent[];
    spawns: FieldEvent[];
    side: Side;
}

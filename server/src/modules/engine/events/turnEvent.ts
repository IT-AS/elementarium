import FieldEvent from "./fieldEvent";
import Side from "../enums/side";

interface TurnEvent {
    captures: FieldEvent[];
    spawns: FieldEvent[];
    winner: Side;
}

export default TurnEvent;
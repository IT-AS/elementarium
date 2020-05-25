import {FieldEvent} from "./fieldEvent";
import {Side} from "../enums/side";

export interface TurnEvent {
    captures: FieldEvent[];
    spawns: FieldEvent[];
    winner: Side;
}

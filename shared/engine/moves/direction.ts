import {Side} from "../enums/side";

export interface Direction {
    from: number[];
    to: number[][];
    side: Side;
}

import Side from "../enums/side";

interface Direction {
    from: number[];
    to: number[][];
    side: Side;
}

export default Direction;
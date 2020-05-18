import Side from "../enums/side";

interface Move {
    from: number[];
    to: number[];
    side: Side;
}

export default Move;
import {Side} from "../engine/enums/side";

import Board from "../engine/board";
import Move from "../engine/moves/move";

class AI {
    public board: Board;
    public side: Side;
    private name: 'Very strong AI';

    constructor(board: Board, side: Side) {
        this.board = board;
        this.side = side;
    }

    public calculate(): Move[] {
        const availableMoves = this.board.targets.filter(f => f.side === this.side);
        const calculatedMoves: Move[] = [];
        for (let i = 0; i < 3; i++) {
            const moveFrom = Math.floor(Math.random() * availableMoves.length);
            const moveTo = Math.floor(Math.random() * availableMoves[moveFrom].to.length);
            calculatedMoves.push({
                from: [availableMoves[moveFrom].from[0], availableMoves[moveFrom].from[1]],
                to: [availableMoves[moveFrom].to[moveTo][0], availableMoves[moveFrom].to[moveTo][1]],
                side: this.board.fields[availableMoves[moveFrom].from[0]][availableMoves[moveFrom].from[1]].current.side
            });
        }
        return calculatedMoves;
    }
}

export default AI;

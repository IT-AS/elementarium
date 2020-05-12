class AI {
    public board: any;
    public side: any;
    private name: 'Very strong AI';

    constructor(board, side) {
        this.board = board;
        this.side = side;
    }

    public calculate(): any[] {
        const availableMoves = this.board.targets.filter(f => f.side === this.side);
        const calculatedMoves = [];
        for (let i = 0; i < 3; i++) {
            const moveFrom = Math.floor(Math.random() * availableMoves.length);
            const moveTo = Math.floor(Math.random() * availableMoves[moveFrom].to.length);
            calculatedMoves.push([
                availableMoves[moveFrom].from[0],
                availableMoves[moveFrom].from[1],
                availableMoves[moveFrom].to[moveTo][0],
                availableMoves[moveFrom].to[moveTo][1],
                this.board.fields[availableMoves[moveFrom].from[0]][availableMoves[moveFrom].from[1]].current.type,
                this.board.fields[availableMoves[moveFrom].from[0]][availableMoves[moveFrom].from[1]].current.type,
            ]);
        }
        return calculatedMoves;
    }
}

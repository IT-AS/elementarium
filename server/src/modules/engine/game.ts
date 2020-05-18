import Player from "./player";
import Side from "./enums/side";
import Turn from "./moves/turn";
import Move from "./moves/move";
import HalfTurn from "./moves/halfturn";
import TurnEvent from "./events/turnEvent";
import Rules from "./rules";
import Board from "./board";

class Game {
    public gameId: string;
    public players: Player[];
    public turn: number;
    public board: Board;
    public journal: Turn[];
    public winner: Side;

    constructor(gameId: string){
        this.gameId = gameId;
        this.players = [];
        this.board = new Board(Rules.boardsize);
        this.turn = 1;
        this.journal = [];
        this.winner = null;
    }

    public start(): void {
        this.turn = 1;
        this.board.initialize();
    }

    public next(side: Side, moves: Move[]): boolean {
        const turn: Turn = this.current();

        if(!side || !moves) {
            return false;
        }

        if(side === Side.Green) {
            turn.green = {moves, side: Side.Green} as HalfTurn;
        }

        if(side === Side.Red) {
            turn.red = {moves, side: Side.Red} as HalfTurn;
        }

        if(turn.green && turn.red) {
            this.execute(turn.green.moves);
            this.execute(turn.red.moves);

            const result: TurnEvent = this.board.resolve();
            this.winner = result.winner;

            turn.green.captures = result.captures.filter(c => c.unit.side === Side.Green);
            turn.red.captures = result.captures.filter(c => c.unit.side === Side.Red);
            turn.green.spawns = result.spawns.filter(c => c.unit.side === Side.Green);
            turn.red.spawns = result.spawns.filter(c => c.unit.side === Side.Red);

            this.turn++;

            return true;
        }

        return false;
    }

    private execute(moves: Move[]) {
        for(const move of moves) {
            this.board.move(move.from[0],move.from[1],move.to[0],move.to[1]);
        }
    }

    private current(): Turn {
        if(!this.journal[this.turn-1]) {
            this.journal[this.turn-1] = {green: null, red: null} as Turn;
        }

        return this.journal[this.turn-1];
    }

    private opponent(side: Side): Player {
        return this.players.filter(p => p.side !== side)[0];
    }
}

export default Game;
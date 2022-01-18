import {Side} from "./enums/side";
import {Turn} from "./moves/turn";
import {HalfTurn} from "./moves/halfturn";
import {TurnEvent} from "./events/turnEvent";

import Rules from "./rules";
import Board from "./board";
import Player from "./player";
import Move from "./moves/move";

export default class Game {
    public gameId: string;
    public name: string;
    public players: Player[];
    public turn: number;
    public movesPerTurn: number;
    public board: Board;
    public journal: Turn[];
    public winner: Side;

    constructor(gameId: string, name: string) {
        this.gameId = gameId;
        this.name = name;
        this.players = [];
        this.board = new Board(Rules.boardsize);
        this.turn = 1;
        this.movesPerTurn = Rules.movesPerTurn;
        this.journal = [];
        this.winner = null;
    }

    static clone(source: Game): Game {

        if(!source) { return source; }

        const game: Game = new Game(source.gameId, source.name);

        game.players = source.players;
        game.turn = source.turn;
        game.movesPerTurn = source.movesPerTurn;
        game.journal = source.journal;
        game.winner = source.winner;

        game.board = Board.clone(source.board);

        return game;
    }

    public start(): void {
        this.turn = 1;
        this.board.initialize();
    }

    public next(side: Side, moves: Move[]): boolean {
        const turn: Turn = this.current();

        if (!side || !moves || this.winner) {
            return false;
        }

        if (side === Side.Green) {
            turn.green = {moves, side: Side.Green} as HalfTurn;
        }

        if (side === Side.Red) {
            turn.red = {moves, side: Side.Red} as HalfTurn;
        }

        if (turn.green && turn.red) {
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

    public surrender(side: Side) {
        if(side === Side.Green) {
            this.winner = Side.Red;
        }

        if(side === Side.Red) {
            this.winner = Side.Green;
        }
    }

    public last(): Turn {
        if( this.turn < 2) {
            return null;
        }

        return this.journal[this.turn - 2];        
    }

    private execute(moves: Move[]) {
        for (const move of moves) {
            this.board.move(move.from[0], move.from[1], move.to[0], move.to[1]);
        }
    }

    private current(): Turn {
        if (!this.journal[this.turn - 1]) {
            this.journal[this.turn - 1] = {green: null, red: null} as Turn;
        }

        return this.journal[this.turn - 1];
    }
}

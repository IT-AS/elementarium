import bcrypt from 'bcrypt';
import GameEntry from './gameentry';
import JoinInfo from './joininfo';
import Result from './result';
import GameInfo from './gameInfo';
import Game from '../engine/game';
import Player from '../engine/player';
import AI from '../ai/ai';

class Lobby {
    private games: GameEntry[];

    constructor(){ ;}

    public createGame(gameId: string, password: string): void {
        const game: Game = new Game(gameId);
        game.start();

        const encrypted = bcrypt.hashSync(password, 10);
        this.games.push({ game, password: encrypted, ai: null } as GameEntry);
    }

    public joinGame(joinInfo: JoinInfo): Result {
        const gameEntry: GameEntry = this.getGameEntry(joinInfo.gameId);
        const game: Game = gameEntry.game;
        const password: string = gameEntry.password;

        if (joinInfo.playerId === 'CPU') {
            game.players[joinInfo.playerId] = joinInfo.side;
            gameEntry.ai = new AI(game.board, joinInfo.side);

            return {success: true, message: ''} as Result;
        } else {
            if (game && password) {
                if(bcrypt.compareSync(joinInfo.password, password)) {
                    game.players.push({name: joinInfo.playerId, side: joinInfo.side} as Player);
                    return {success: true, message: ''} as Result;
                } else {
                    return {success: false, message: 'Wrong password'} as Result;
                }
            } else {
                return {success: false, message: 'Unknown game'} as Result;
            }
        }
    }

    public getGame(gameId: string): Game {
        return this.getGameEntry(gameId).game;
    }

    public getGameList(): GameInfo[] {
        return this.games.map(g => ({ gameId: g.game.gameId, players: g.game.players, turn: g.game.turn } as GameInfo));
    }

    private getGameEntry(gameId: string) {
        return this.games.filter(g => g.game.gameId === gameId)[0];
    }
}

export default Lobby;
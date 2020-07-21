import bcrypt from 'bcrypt';

import {GameEntry} from './gameentry';
import {JoinInfo} from '../../shared/lobby/joininfo';
import {Result} from '../../shared/lobby/result';
import {GameInfo} from '../../shared/lobby/gameInfo';

import Game from '../../shared/engine/game';
import Player from '../../shared/engine/player';
import AI from './modules/ai/ai';

export default class Lobby {
    private games: GameEntry[];

    constructor() {
        this.games = [];
    }

    public createGame(gameId: string, password: string): void {
        const game: Game = new Game(gameId);
        game.start();

        const encrypted = bcrypt.hashSync(password, 10);
        this.games.push({game, password: encrypted, ai: null} as GameEntry);
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
                if (bcrypt.compareSync(joinInfo.password, password)) {
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
        return this.games.map(g => ({gameId: g.game.gameId, players: g.game.players, turn: g.game.turn} as GameInfo));
    }

    private getGameEntry(gameId: string) {
        const filtered = this.games.filter(g => g.game.gameId === gameId);
        return filtered[0];
    }
}

import bcrypt from 'bcrypt';

import {GameEntry} from './gameentry';
import {JoinInfo} from '../../shared/lobby/joininfo';
import {Result} from '../../shared/lobby/result';
import {GameInfo} from '../../shared/lobby/gameinfo';
import {TokenInfo} from '../../shared/lobby/tokeninfo';

import Game from '../../shared/engine/game';
import Player from '../../shared/engine/player';
import AI from './modules/ai/ai';
import { v4 as uuidv4 } from 'uuid';
import { Side } from '../../shared/engine/enums/side';

export default class Lobby {
    private games: GameEntry[];

    constructor() {
        this.games = [];
    }

    public createGame(name: string, password: string): void {
        const gameId: string = uuidv4();
        const game: Game = new Game(gameId, name);
        game.start();

        const tokens: Map<string, Side> = new Map<string, Side>();
        tokens.set(uuidv4(), Side.Green);
        tokens.set(uuidv4(), Side.Red);

        const encrypted = bcrypt.hashSync(password, 10);
        this.games.push({game, password: encrypted, ai: null, tokens} as GameEntry);
    }

    public deleteGame(gameId: string, password: string): Result {
        const gameEntry: GameEntry = this.getGameEntry(gameId);
        const gamePassword: string = gameEntry.password;

        if (bcrypt.compareSync(password, gamePassword)) {
            this.games = this.games.filter((game) => game.game.gameId !== gameId);
            return {success: true, message: ''} as Result;
        }

        return {success: false, message: 'Wrong password'} as Result;
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

    public resumeGame(tokenInfo: TokenInfo): Result {
        const gameEntry: GameEntry = this.getGameEntry(tokenInfo.gameId);

        if(gameEntry && gameEntry.tokens.has(tokenInfo.token)) {
            return {success: true, message: ''} as Result;
        }

        return {success: false, message: 'Unknown token'} as Result;
    }

    public getGame(gameId: string): Game {
        return this.getGameEntry(gameId).game;
    }

    public getGameList(): GameInfo[] {
        return this.games.map(g => ({
            gameId: g.game.gameId, 
            name: g.game.name, 
            players: g.game.players, 
            turn: g.game.turn 
        } as GameInfo));
    }

    public getToken(gameId: string, side: Side) {
        const gameEntry: GameEntry = this.getGameEntry(gameId);
        let tokenInfo: TokenInfo = null;

        gameEntry.tokens.forEach((value: Side, key: string) => {
            if(value === side) {
                tokenInfo = { gameId, token: key };
            }
        });

        return tokenInfo;
    }

    public getSide(gameId: string, token: string) {
        const gameEntry: GameEntry = this.getGameEntry(gameId);

        if(gameEntry.tokens.has(token)) {
            return gameEntry.tokens.get(token);
        }

        return Side.Gray;
    }

    private getGameEntry(gameId: string) {
        const filtered = this.games.filter(g => g.game.gameId === gameId);
        return filtered[0];
    }
}

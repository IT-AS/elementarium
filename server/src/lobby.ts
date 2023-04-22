import bcrypt from 'bcrypt';
import AsyncNedb from 'nedb-async'

import {GameEntry} from './gameentry';
import {JoinInfo} from '../../shared/lobby/joininfo';
import {Result} from '../../shared/lobby/result';
import {GameInfo} from '../../shared/lobby/gameinfo';
import {TokenInfo} from '../../shared/lobby/tokeninfo';

import Game from '../../shared/engine/game';
import Rules from '../../shared/engine/rules';
import Player from '../../shared/engine/player';
import { v4 as uuidv4 } from 'uuid';
import { Side } from '../../shared/engine/enums/side';
import { Token } from './token';

export default class Lobby {
    private games: any;

    constructor() {

        this.games = new AsyncNedb<GameEntry>({ filename: 'games.db', autoload: true });
    }

    public async createGame(name: string, password: string): Promise<Result> {
        try {

            const gameId: string = uuidv4();
            const game: Game = new Game(gameId, name);
            game.start();

            const tokens: Token[] = [
                { token: uuidv4(), side: Side.Green } as Token,
                { token: uuidv4(), side: Side.Red } as Token
            ];

            const encrypted = await bcrypt.hash(password, 10);
            await this.games.asyncInsert({game, password: encrypted, ai: null, tokens } as GameEntry);

            return {success: true, message: ''} as Result;

        } catch(error) {

            return {success: false, message: error} as Result;
        }
    }

    public async deleteGame(gameId: string, password: string): Promise<Result> {
        try {
            const gameEntry: GameEntry = await this.getGameEntry(gameId);
            const gamePassword: string = gameEntry.password;

            if (await bcrypt.compare(password, gamePassword)) {
                await this.games.asyncRemove({'game.gameId': gameId});

                return {success: true, message: ''} as Result;
            }
    
            return {success: false, message: 'Wrong password'} as Result;
        } catch(error) {

            return {success: false, message: error} as Result;
        }
    }    

    public async updateGame(game: Game): Promise<Result> {
        try {
            const gameEntry: GameEntry = await this.getGameEntry(game.gameId);
            gameEntry.game = game;

            await this.games.asyncUpdate({'game.gameId': gameEntry.game.gameId}, gameEntry);

            return {success: true, message: ''} as Result;

        } catch(error) {

            return {success: false, message: error} as Result;
        }    
    }

    public async joinGame(joinInfo: JoinInfo): Promise<Result> {
        try {
            const gameEntry: GameEntry = await this.getGameEntry(joinInfo.gameId);
            const game: Game = gameEntry.game;
            const password: string = gameEntry.password;

            if (game && password) {
                if (bcrypt.compareSync(joinInfo.password, password)) {
                    game.players.push({name: joinInfo.playerId, side: joinInfo.side} as Player);
                    gameEntry.ai = joinInfo.ai;

                    if (joinInfo.ai) {
                        game.players.push({name: 'AI', side: Rules.opponent(joinInfo.side)} as Player);
                    }

                    await this.games.asyncUpdate({'game.gameId': gameEntry.game.gameId}, gameEntry);

                    return {success: true, message: ''} as Result;
                } else {
                    return {success: false, message: 'Wrong password'} as Result;
                }
            } else {
                return {success: false, message: 'Unknown game'} as Result;
            }
        } catch(error) {

            return {success: false, message: error} as Result;
        }
    }

    public async resumeGame(tokenInfo: TokenInfo): Promise<Result> {
        try {

            const gameEntry: GameEntry = await this.getGameEntry(tokenInfo.gameId);

            if(gameEntry && gameEntry.tokens.filter(t => t.token === tokenInfo.token).length > 0) {
                return {success: true, message: ''} as Result;
            }

            return {success: false, message: 'Unknown token'} as Result;

        } catch(error) {

            return {success: false, message: error} as Result;
        }
    }

    public async getGame(gameId: string): Promise<Game> {
        try {
            
            const gameEntry: GameEntry = await this.getGameEntry(gameId);
            if(gameEntry) {
                return gameEntry.game;
            }

            return null

        } catch(error) {

            return null;
        }
    }

    public async getGameList(): Promise<GameInfo[]> {
        try {
            const result = await this.games.asyncFind({});

            console.log(result);

            if(result) {
                return result.map(g => ({
                    gameId: g.game.gameId, 
                    name: g.game.name, 
                    players: g.game.players, 
                    turn: g.game.turn ,
                    finished: g.game.winner !== null
                } as GameInfo)).filter(g => !g.finished && !(g.players[0] && g.players[1]));
            }

            return null;

        } catch(error) {

            return null;
        }
    }

    public async getToken(gameId: string, side: Side): Promise<TokenInfo> {
        const gameEntry: GameEntry = await this.getGameEntry(gameId);

        if(gameEntry) {
            const tokens: Token[] = gameEntry.tokens.filter(t => t.side === side);

            if (tokens?.length > 0) {
                return { gameId, token: tokens[0].token } as TokenInfo;
            }

            return null;
        }

        return null;
    }

    public async getSide(gameId: string, token: string): Promise<Side> {
        try {

            const gameEntry: GameEntry = await this.getGameEntry(gameId);
            const tokens: Token[] = gameEntry.tokens.filter(t => t.token === token);

            if(tokens?.length > 0) {
                return tokens[0].side;
            }
    
            return null;

        } catch (error) {

            return null;
        }
    }

    public async getAI(gameId: string): Promise<boolean> {
        try {
            const gameEntry: GameEntry = await this.getGameEntry(gameId);

            if(gameEntry) {
                return gameEntry.ai;
            }

            return false;

        } catch(error) {
            
            return false;
        }
    }

    private async getGameEntry(gameId: string): Promise<GameEntry> {
        try {
            const result = await this.games.asyncFind({ 'game.gameId': gameId })

            if(result?.length > 0) {
                return result[0];
            }

            return null;

        } catch(error) {
            
            return null;
        }
    }
}

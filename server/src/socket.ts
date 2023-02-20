import socketIo from 'socket.io'
import http from 'http';

import {JoinInfo} from '../../shared/lobby/joininfo';
import {MoveInfo} from '../../shared/lobby/moveinfo';
import {Result} from '../../shared/lobby/result';
import {SocketEvents} from "../../shared/engine/enums/socketevents";

import Lobby from './lobby';
import Game from '../../shared/engine/game';
import { TokenInfo } from '../../shared/lobby/tokeninfo';
import { Side } from '../../shared/engine/enums/side';
import Rules from '../../shared/engine/rules';

export default class Socket {
    private readonly server: http.Server;
    private readonly io: socketIo.Server;
    private lobby: Lobby;

    constructor(server: http.Server) {
        this.server = server;
        this.io = socketIo.listen(this.server, {origins: '*:*'});

        this.listen();
    }

    private getGameChannel(gameId: string): string {
        return `${SocketEvents.GAME}${gameId}`;
    }

    private listen(): void {
        this.lobby = new Lobby();

        this.io.on(SocketEvents.CONNECTION, (socket: any) => {
            console.log('connected');

            socket.on(SocketEvents.LIST, async () => {

                // Send updated list of games to clients
                this.io.emit(SocketEvents.LIST, await this.lobby.getGameList());
            });

            socket.on(SocketEvents.GAME, async (name: string, password: string) => {

                // create game
                await this.lobby.createGame(name, password);

                // Send updated list of games to clients
                this.io.emit(SocketEvents.LIST, await this.lobby.getGameList());
            });

            socket.on(SocketEvents.DELETE, async (gameId: string, password: string) => {

                // create game
                await this.lobby.deleteGame(gameId, password);

                // Send updated list of games to clients
                this.io.emit(SocketEvents.LIST, await this.lobby.getGameList());
            });

            socket.on(SocketEvents.JOIN, async (joiner: JoinInfo) => {

                // join game
                const result: Result = await this.lobby.joinGame(joiner);

                if (result.success) {

                    const tokenInfo: TokenInfo = await this.lobby.getToken(joiner.gameId, joiner.side)

                    if(tokenInfo) {
                        // Send token info to client
                        socket.emit(this.getGameChannel(joiner.gameId), tokenInfo);
                        
                        // Send updated list of games to clients
                        this.io.emit(SocketEvents.LIST, await this.lobby.getGameList());         

                    } else {

                        socket.emit(SocketEvents.PROBLEM, 'No token available');
                    }
                } else {
                    socket.emit(SocketEvents.PROBLEM, result.message);
                }
            });

            socket.on(SocketEvents.RESUME, async (tokenInfo: TokenInfo) => {

                // resume game
                const result: Result = await this.lobby.resumeGame(tokenInfo);

                if (result.success) {
                    // Send side to client
                    socket.emit(this.getGameChannel(tokenInfo.gameId), await this.lobby.getSide(tokenInfo.gameId, tokenInfo.token));
                    
                    // Send game to client
                    socket.emit(this.getGameChannel(tokenInfo.gameId), await this.lobby.getGame(tokenInfo.gameId));
                } else {
                    socket.emit(SocketEvents.PROBLEM, result.message);
                }
            });

            socket.on(SocketEvents.MOVE, async (moveInfo: MoveInfo) => {

                // get the game
                const game: Game = Game.clone(await this.lobby.getGame(moveInfo.gameId));

                // get side by token (addition authorization per move)
                const side: Side = await this.lobby.getSide(moveInfo.gameId, moveInfo.token);

                // check if ai is activated
                const ai: boolean = await this.lobby.getAI(moveInfo.gameId);

                // Ignore not authorized moves
                if(side !== Side.Gray) {

                    // do the move
                    if (game.next(side, moveInfo.moves)) {

                        this.io.emit(this.getGameChannel(moveInfo.gameId), game);
                    } else if (ai) {

                        console.log('Applying AI moves');
                        // TODO: This one should be refactored!
                        if (game.next(Rules.opponent(side), moveInfo.ai)) {

                            this.io.emit(this.getGameChannel(moveInfo.gameId), game);
                        }
                    }

                    // save to db
                    this.lobby.updateGame(game);
                }
            });

            socket.on(SocketEvents.SURRENDER, async (tokenInfo: TokenInfo) => {

                // get the game
                const game: Game = Game.clone(await this.lobby.getGame(tokenInfo.gameId));

                // get side by token (addition authorization per move)
                const side: Side = await this.lobby.getSide(tokenInfo.gameId, tokenInfo.token);

                // Ignore not authorized moves
                if(side !== Side.Gray) {

                    // apply surrender
                    game.surrender(side);
                    
                    // save to db
                    this.lobby.updateGame(game);

                    // send the game
                    this.io.emit(this.getGameChannel(tokenInfo.gameId), game);
                }
            });
        });
    }
}

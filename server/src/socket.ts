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

            socket.on(SocketEvents.LIST, () => {

                // Send updated list of games to clients
                this.io.emit(SocketEvents.LIST, this.lobby.getGameList());
            });

            socket.on(SocketEvents.GAME, (name: string, password: string) => {

                // create game
                this.lobby.createGame(name, password);

                // Send updated list of games to clients
                this.io.emit(SocketEvents.LIST, this.lobby.getGameList());
            });

            socket.on(SocketEvents.DELETE, (gameId: string, password: string) => {

                // create game
                this.lobby.deleteGame(gameId, password);

                // Send updated list of games to clients
                this.io.emit(SocketEvents.LIST, this.lobby.getGameList());
            });

            socket.on(SocketEvents.JOIN, (joiner: JoinInfo) => {

                // join game
                const result: Result = this.lobby.joinGame(joiner);

                if (result.success) {

                    const tokenInfo: TokenInfo = this.lobby.getToken(joiner.gameId, joiner.side)

                    // Send token info to client
                    socket.emit(this.getGameChannel(joiner.gameId), tokenInfo);
                    
                    // Send updated list of games to clients
                    this.io.emit(SocketEvents.LIST, this.lobby.getGameList());                    
                } else {
                    socket.emit(SocketEvents.PROBLEM, result.message);
                }
            });

            socket.on(SocketEvents.RESUME, (tokenInfo: TokenInfo) => {

                // resume game
                const result: Result = this.lobby.resumeGame(tokenInfo);

                if (result.success) {
                    // Send side to client
                    socket.emit(this.getGameChannel(tokenInfo.gameId), this.lobby.getSide(tokenInfo.gameId, tokenInfo.token));
                    
                    // Send game to client
                    socket.emit(this.getGameChannel(tokenInfo.gameId), this.lobby.getGame(tokenInfo.gameId));
                } else {
                    socket.emit(SocketEvents.PROBLEM, result.message);
                }
            });

            socket.on(SocketEvents.MOVE, (moves: MoveInfo) => {
                // get the game
                const game: Game = this.lobby.getGame(moves.gameId);

                // get side by token (addition authorization per move)
                const side: Side = this.lobby.getSide(moves.gameId, moves.token);

                // Ignore not authorized moves
                if(side !== Side.Gray) {

                    // do the move
                    if (game.next(side, moves.moves)) {
                        this.io.emit(this.getGameChannel(moves.gameId), game);
                    }
                }
            });
        });
    }
}

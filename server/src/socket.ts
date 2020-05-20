import socketIo from 'socket.io'
import http from 'http';
import JoinInfo from './modules/lobby/joininfo';
import MoveInfo from './modules/lobby/moveinfo';
import Result from './modules/lobby/result';
import Lobby from './modules/lobby/lobby';
import Game from './modules/engine/game';

enum SocketEvents {
    CONNECTION = 'connection',
    LIST = 'games',
    GAME = 'game',
    JOIN = 'join',
    RESUME = 'resume',
    MOVE = 'move',
    ERROR = 'error',
}

class Socket {
    private readonly server: http.Server;
    private readonly io: socketIo.Server;
    private lobby: Lobby;

    constructor(server: http.Server) {
        this.server = server;
        this.io = socketIo.listen(this.server, { origins: '*:*'});

        this.listen();
    }

    private getGameChannel(gameId: string): string {
        return SocketEvents.GAME + '[' + gameId + ']';
    }

    private listen(): void {
        this.lobby = new Lobby();

        this.io.on(SocketEvents.CONNECTION, (socket: Socket) => {
            console.log('connected');
        });

        this.io.on(SocketEvents.LIST, (socket: Socket) => {
            // Send updated list of games to clients
            this.io.emit(SocketEvents.LIST, this.lobby.getGameList());
        });

        this.io.on(SocketEvents.GAME, (socket: Socket, gameId: string, password: string) =>{
            // create game
            this.lobby.createGame(gameId, password);

            // Send updated list of games to clients
            this.io.emit(SocketEvents.LIST, this.lobby.getGameList());
        });

        this.io.on(SocketEvents.JOIN, (socket: Socket, joiner: JoinInfo) =>{
            // join game
            const result: Result = this.lobby.joinGame(joiner);

            if(result.success) {
                // Send game to client
                socket.io.emit(this.getGameChannel(joiner.gameId), this.lobby.getGame(joiner.gameId));
            } else {
                socket.io.emit(SocketEvents.ERROR, result.message);
            }
        });

        this.io.on(SocketEvents.RESUME, (socket: Socket, joiner: JoinInfo) =>{
            // join game
            const result: Result = this.lobby.joinGame(joiner);

            if(result.success) {
                // Send game to client
                socket.io.emit(this.getGameChannel(joiner.gameId), this.lobby.getGame(joiner.gameId));
            } else {
                socket.io.emit(SocketEvents.ERROR, result.message);
            }
        });

        this.io.on(SocketEvents.MOVE, (socket: Socket, moves: MoveInfo) => {
            // get the game
            const game: Game = this.lobby.getGame(moves.gameId);

            // TODO: get cpu moves

            // do the move
            if(game.next(moves.side, moves.moves)) {
                socket.io.emit(this.getGameChannel(moves.gameId), game);
            }
        });
    }
}

export default Socket;

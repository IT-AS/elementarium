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

        this.io.on(SocketEvents.CONNECTION, (socket: any) => {
            console.log('connected');

            socket.on(SocketEvents.LIST, () => {

                // Send updated list of games to clients
                this.io.emit(SocketEvents.LIST, this.lobby.getGameList());
            });

            socket.on(SocketEvents.GAME, (gameId: string, password: string) => {

                // create game
                this.lobby.createGame(gameId, password);

                // Send updated list of games to clients
                this.io.emit(SocketEvents.LIST, this.lobby.getGameList());
            });

            socket.on(SocketEvents.JOIN, (joiner: JoinInfo) =>{

                // join game
                const result: Result = this.lobby.joinGame(joiner);

                if(result.success) {
                    // Send game to client
                    socket.emit(this.getGameChannel(joiner.gameId), this.lobby.getGame(joiner.gameId));
                } else {
                    socket.emit(SocketEvents.ERROR, result.message);
                }
            });

            socket.on(SocketEvents.RESUME, (joiner: JoinInfo) =>{

                // join game
                const result: Result = this.lobby.joinGame(joiner);

                if(result.success) {
                    // Send game to client
                    socket.emit(this.getGameChannel(joiner.gameId), this.lobby.getGame(joiner.gameId));
                } else {
                    socket.emit(SocketEvents.ERROR, result.message);
                }
            });

            socket.on(SocketEvents.MOVE, (moves: MoveInfo) => {
                // get the game
                const game: Game = this.lobby.getGame(moves.gameId);

                // TODO: get cpu moves

                // do the move
                if(game.next(moves.side, moves.moves)) {
                    socket.emit(this.getGameChannel(moves.gameId), game);
                }
            });
        });
    }
}

export default Socket;
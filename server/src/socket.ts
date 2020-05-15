import socketIo from 'socket.io';
import http from 'http';
import App from "./app";

enum SocketEvents {
    CONNECTION = 'connection',
}

class Socket {
    private io: socketIo.Server;
    private readonly app: Partial<App>;

    constructor(app: App) {
        this.app = http.createServer(app.app);
        this.initSocket();
    }

    private initSocket(): void {
        this.io = socketIo(this.app);
        this.listen();
    }

    private listen(): void {
        this.io.on(SocketEvents.CONNECTION, (socket: Socket) => {
            console.log('connected');
        });
    }
}

export default Socket;

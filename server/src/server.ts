import express from "express";
import cors from "cors";
import * as http from "http";
import SocketIO from "socket.io";

export default class Server {
    private app: express.Application;
    private server: http.Server;
    private io: SocketIO.Server;
    private port: string | number;

    constructor(controllers, port) {
        this.createApp();
        this.config(port);
        this.createServer();
        this.initControllers(controllers);
        this.listen();
    }

    private createApp(): void {
        this.app = express();
        this.app.use(cors());
        this.app.options('*', cors());
    }

    private createServer(): void {
        this.server = http.createServer(this.app);
    }

    public initControllers(controllers) {
        controllers.forEach((controller) => {
            this.app.use("/", controller.router);
        });
    }

    private config(port): void {
        this.port = process.env.PORT || port;
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log("Running server on port %s", this.port);
        });
    }

    public get Server(): http.Server {
        return this.server;
    }
}

import Server from "./server";
import Socket from "./socket";
import PingController from "./controller/ping.controller";

const http = new Server(
    [
        new PingController(),
    ],
    4000
);

const sockets = new Socket(http.Server);
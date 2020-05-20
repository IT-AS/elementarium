import Server from "./server";
import PingController from "./controller/ping.controller";

import Socket from "./socket";

const http = new Server(
    [
        new PingController(),
    ],
    4000
);

const sockets = new Socket(http.Server);
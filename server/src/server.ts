import App from "./app";

import PingController from "./controller/ping.controller";

const app = new App(
    [
        new PingController(),
    ],
    4000
);

// TODO: define socket.io class and initialize

app.listen();

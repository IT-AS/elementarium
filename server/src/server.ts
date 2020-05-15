import App from "./app";
import PingController from "./controller/ping.controller";

import Socket from "./socket";

const app = new App(
    [
        new PingController(),
    ],
    4000
);

app.listen();

const socket = new Socket(app);

import express from "express";
const path = require('path');

class App {
    public app: express.Application;
    public port: number;

    constructor(controllers, port) {
        this.app = express();
        this.port = port;

        this.initControllers(controllers);

        this.app.use(express.static(path.join(__dirname, '../../client')));
    }

    public initControllers(controllers) {
        controllers.forEach((controller) => {
            this.app.use("/", controller.router);
        });
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App run on port: ${this.port}`);
        });
    }
}

export default App;

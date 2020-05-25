import * as express from 'express';

export default class PingController {
    public path: string = '/ping';
    public router: express.Router = express.Router();

    constructor() {
        this.initRoutes();
    }

    public initRoutes() {
        this.router.get(this.path, this.ping);
    }

    ping = (request: express.Request, response: express.Response) => {
        response.send("Im fine, bro");
    }
}

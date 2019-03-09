import * as websocket from "ws";

class Client {
    public ws: any;

    constructor() {
        this.ws = new websocket("wss://localhost:8080", {
            protocolVersion: 8,
            origin: 'https://localhost:8080',
            rejectUnauthorized: false
        });
        this.mountRoutes();
    }


    private mountRoutes(): void {
        this.ws.on('open', () => {
            this.ws.send('hello from this side');
        });

        this.ws.on('message', (msg: String) => {
            console.log({ message: msg });
        });
    }
}

export default new Client();
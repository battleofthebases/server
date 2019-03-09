import * as websocket from "ws";

class Client{
    public ws: any;

    constructor() {
        this.ws = new websocket('ws://localhost:8080');
        this.mountRoutes();
    }
    

    private mountRoutes(): void {
        this.ws.on('open', () => {
            this.ws.send('hello from this side');
          });

        this.ws.on('message', (msg:String) => {
            console.log({message:msg});
        });
    }
}

export default new Client();
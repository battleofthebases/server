const port = process.env.PORT || 8000
import * as websocket from 'ws';

class App {
    public wss: any;

    constructor() {
        this.wss = new websocket.Server({port:8080});
        this.mountRoutes();
    }
    

    private mountRoutes(): void {
        this.wss.on('connection', (ws:any) => {
            ws.on('message', (msg:String) => {
                console.log({message_received:msg});
            });

            ws.send('hello from the other side');
        });
    }
}

export default new App();

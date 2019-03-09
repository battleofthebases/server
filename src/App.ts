const port = process.env.PORT || 8080
import * as websocket from 'ws';
import * as fs from 'fs';
import * as https from 'https';

const server = https.createServer({
    cert: fs.readFileSync('certificates/server.crt', 'utf-8'),
    key: fs.readFileSync('certificates/server.key', 'utf-8'),
});

class App {
    public wss: any;

    constructor() {
        this.wss = new websocket.Server({server, rejectUnauthorized: false});
        this.mountRoutes();
        server.listen(port);
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

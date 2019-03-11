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
    private connections: [any];
    private rooms: [Room];

    constructor() {
        this.wss = new websocket.Server({ server });
        this.listener();
        server.listen(port);
    }

    private listener(): void {
        this.wss.on('connection', (ws: any) => {
            //this.findConnection(ws);
            console.log({ conn: "new conn" });
            this.connections.push(ws);
            ws.on('message', (msg: String) => {
                console.log({ message_received: msg });
            });
            ws.send('hello from the other side');
        });
    }

    private findConnection(conn: any): void {
        for (let i = 0; i < this.connections.length; i++) {
            const connection = this.connections[i];
            const next = this.connections[i + 1];
            if (connection.readyState === websocket.OPEN && next.readyState === websocket.OPEN) {
                //do something
            }
        }
    }

}

class Room {
    private player1;
    private player2;

    constructor(conn1, conn2) {
        this.player1 = conn1;
        this.player2 = conn2;
        this.handleMessage();
    }

    private handleMessage(): void {
        this.player1.on('message', (msg) => {
            this.player2.send(msg);
        });
        this.player2.on('message', (msg) => {
            this.player1.send(msg);
        });
    }
}

export default new App();

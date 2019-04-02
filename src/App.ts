const port = 8080
import * as websocket from 'ws';
import * as fs from 'fs';
import * as https from 'https';

const server = https.createServer({
    cert: fs.readFileSync('certificates/server.crt', 'utf-8'),
    key: fs.readFileSync('certificates/server.key', 'utf-8'),
});
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
            console.log({ player1: msg });
            this.player2.send(msg);
        });
        this.player2.on('message', (msg) => {
            console.log({ player2: msg });
            this.player1.send(msg);
        });
    }
}
class App {
    public wss: any;
    private connections: any[];
    private rooms: any[];

    constructor() {
        this.connections = [];
        this.rooms = [];
        this.wss = new websocket.Server({ server });
        this.listener();
        server.listen(port);
        console.log(`Listening on port: ${port}`);
    }

    private listener(): void {
        this.wss.on('connection', (ws: any) => {
            ws.id = generateID(); //assign each client an id;
            console.log({ new_conn: ws.id });
            this.findConnection(ws); //immediately start search for other player
            ws.on('close', () => {
                console.log("CLOSING SHOP");
                console.log(this.rooms.length);
                //remove room in which websocket resides
                for (let i = 0; i < this.rooms.length; i++) {
                    const player1 = this.rooms[i].player1;
                    const player2 = this.rooms[i].player2;
                    if (player1.id === ws.id || player2.id === ws.id) {
                        if(player1.readyState === websocket.OPEN) player1.send("RemovedFromRoom");
                        if(player2.readyState === websocket.OPEN) player2.send("RemovedFromRoom");
                        this.rooms.splice(i,1);
                        console.log({close: `${ws.id} disconnected, cleaning up 🍔`});
                        console.log({rooms: this.rooms.length});
                    }
                }
            });
            //if a player wants to start a new game, search for other player
            ws.on('NewGame', (ws) => {
                this.findConnection(ws);
            });
        });
    }

    private findConnection(ws: any): void {
        if (this.connections.length > 0) {
            for (let i = 0; i < this.connections.length; i++) {
                const conn = this.connections[i];
                if (conn.readyState === websocket.OPEN) {
                    console.log({ findconnection: "found connection 🍔" });
                    //remove from list of available connections
                    for (let j = 0; j < this.connections.length; j++) {
                        if (this.connections[j].id === ws.id) this.connections.splice(j, 1);
                        else if (this.connections[j].id === conn.id) this.connections.splice(j, 1);
                    }
                    //join connections together in room
                    const p = new Room(ws, conn);
                    this.rooms.push(p);
                    return;
                }
            }
        } else {
            //no available connections, wait for incoming clients
            ws.send("Waiting for players");
            this.connections.push(ws);
            console.log("Waiting for players");
        }
    }
}

function generateID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
}



export default new App();

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
            this.player2.send(msg);
        });
        this.player2.on('message', (msg) => {
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
    }

    private listener(): void {
        this.wss.on('connection', (ws: any) => {
            ws.id = generateID(); //assign each client an id;
            console.log({ new_conn: ws.id });
            this.findConnection(ws);
/*             ws.on('message', (msg: String) => {
                console.log({ message_received: msg });
                ws.send(msg);
            });
 */        });
    }

    private findConnection(conn: any): void {
        console.log("FIND CONNECTION");
        if (this.connections.length > 0) {
            for (let i = 0; i < this.connections.length; i++) {
                const conn2 = this.connections[i];
                if (conn2.readyState === websocket.OPEN) {
                    console.log({ findconnection: "found connection" });
                    //remove from list of available connections
                    for (let j = 0; j < this.connections.length; j++) {
                        if (this.connections[j].id === conn.id) this.connections.splice(j, 1);
                        else if (this.connections[j].id === conn2.id) this.connections.splice(j, 1);
                    }
                    //join connections together in room
                    const p = new Room(conn, conn2);
                    this.rooms.push(p);
                    return;
                }
            }

        }else{
            //no available connections, wait for incoming clients
            this.connections.push(conn);
            console.log({no_available_connecitons:this.connections.length});
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

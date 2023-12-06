const WebSocket = require('ws');
const ws = new WebSocket.Server({port: 8080});

ws.on('connection', (clientSocket) => {
    console.log('A client connected');

    clientSocket.on('message', (message) => {
        console.log(`Received: ${message}`);
        clientSocket.send(`You said: ${message}`);
    });

    clientSocket.on('close', () => {
        console.log('Client disconnected');
    });
});
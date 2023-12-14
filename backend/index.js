const WebSocket = require('ws');
const ws = new WebSocket.Server({port: 8080});

const LOGIN_EVENT = 'user_login';
const MESSAGE_EVENT = 'message';
const LOGOUT_EVENT = 'user_logout';
const USER_LIST_EVENT = 'user_list';
const ERROR_EVENT = 'error';

const clients = new Map();

ws.on('connection', (client) => {
    console.log('A client connected');
    client.on('message', (message) => {

        const {type, payload} = JSON.parse(message);
        switch (type) {
            case LOGIN_EVENT:
                if (clients.has(payload.username)) {
                    sendToOne(client, ERROR_EVENT, {errors: ['already exists']})
                } else {
                    clients.set(payload.username, client)
                    sendToOne(client, LOGIN_EVENT, {username: payload.username})
                    sendToAll(USER_LIST_EVENT, {users: getActiveUsers()})
                }
                break;
            case LOGOUT_EVENT:
                clients.delete(payload.username)
                sendToAll(USER_LIST_EVENT, {users: getActiveUsers()})
                break;
            case MESSAGE_EVENT:
                sendToAll(MESSAGE_EVENT, payload)
                break;
            case USER_LIST_EVENT:
                sendToOne(client, USER_LIST_EVENT, {users: getActiveUsers()})
                break;

        }


    });

    client.on('close', () => {
        console.log('Client disconnected');
    });
});

const sendToAll = (type, payload ) => {
    clients.forEach(client => {
        client.send(JSON.stringify({type, payload}));
    });
}
const sendToOne = (client, type, payload ) => {
    client.send(JSON.stringify({type, payload}));
}

const getActiveUsers = () => [...clients.keys()]

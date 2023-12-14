const WebSocket = require('ws');
const ws = new WebSocket.Server({port: 8080});
const { v4: uuidv4 } = require('uuid');

const LOGIN_EVENT = 'user_login';
const MESSAGE_EVENT = 'message';
const LOGOUT_EVENT = 'user_logout';
const USER_LIST_EVENT = 'user_list';
const ERROR_EVENT = 'error';

const activeUsers = new Map();

ws.on('connection', (client) => {
    console.log('A client connected');
    client.on('message', (message) => {
        const {type, payload} = JSON.parse(message);
        switch (type) {
            case LOGIN_EVENT:
                const uuid = uuidv4();
                if (activeUsers.has(payload.username)) {
                    sendToOne(client, ERROR_EVENT, {errors: ['username already exists']})
                } else {
                    activeUsers.set(uuid, {client, username: payload.username})
                    sendToOne(client, LOGIN_EVENT, {username: payload.username})
                    sendToAll(USER_LIST_EVENT, {users: getActiveUsers()})
                }
                break;
            case LOGOUT_EVENT:
                activeUsers.delete(getUserUId(client))
                sendToAll(USER_LIST_EVENT, {users: getActiveUsers()})
                break;
            case MESSAGE_EVENT:
                const username = getUsername(client);
                sendToAll(MESSAGE_EVENT, {content: payload.message, sender: username, ts: Date.now()})
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
    activeUsers.forEach(({client, username}) => {
        client.send(JSON.stringify({type, payload}));
    });
}
const sendToOne = (client, type, payload ) => client.send(JSON.stringify({type, payload}));

const getActiveUsers = () => [...activeUsers.values()].map(user => user.username)

const getUsername = (client) => {
    const {username} = [...activeUsers.values()].find(entry => entry.client === client)
    return username;
}

const getUserUId = (client) => [...activeUsers.keys()].find(key => activeUsers.get(key) === client);
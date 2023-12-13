const WebSocket = require('ws');
const ws = new WebSocket.Server({port: 8080});

const LOGIN_EVENT = 'user_login';
const MESSAGE_EVENT = 'message';
const LOGOUT_EVENT = 'user_logout';
const USER_LIST_EVENT = 'user_list';
const clients = {};

ws.on('connection', (client) => {
    console.log('A client connected');
    client.on('message', (message) => {

        const {type, payload}  = JSON.parse(message);
        console.log(type)
        console.log(payload);
        switch (type) {
            case LOGIN_EVENT:
                //check if not yet exist
                //generate unique id
                //send updated user list?
                clients[payload.username] = client;
                sendToAll(USER_LIST_EVENT, {users: getActiveUsers()})

                break;
            case LOGOUT_EVENT:
                delete clients[payload.username];
                sendToAll(USER_LIST_EVENT, {users: getActiveUsers()})

                //remove from clients
                //send updated user list?
                break;
            case MESSAGE_EVENT:
                sendToAll(MESSAGE_EVENT, payload)
                break;
            //add some error handling
        }


    });

    client.on('close', () => {
        console.log('Client disconnected');
    });
});

const sendToAll = (type, payload) => {
    Object.entries(clients).forEach(([username, client]) => {
        client.send(JSON.stringify({type,  payload}));
    });
}

const getActiveUsers = () =>  Object.keys(clients)

//const generate_uid = (name) => `${name}_${Date.now()}`
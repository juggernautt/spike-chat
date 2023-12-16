const WebSocket = require('ws');
require('dotenv').config();
const ws = new WebSocket.Server({port: process.env.WS_PORT});
const {getChatHistory, addMessage} = require("./database");



const INIT_EVENT = 'init_chat';
const LOGIN_EVENT = 'user_login';
const MESSAGE_EVENT = 'message';
const LOGOUT_EVENT = 'user_logout';
const USER_LIST_EVENT = 'user_list';
const ERROR_EVENT = 'error';

const activeUsers = new Map();

ws.on('connection',  (client) => {
    console.log('A client connected');
    client.on('message', async (message) => {
        const {type, payload} = JSON.parse(message);
        switch (type) {
            case INIT_EVENT:
                const chatHistory = await getChatHistory();
                sendToOne(client, INIT_EVENT, {messages: chatHistory, users: getActiveUsers()});
                break;
            case LOGIN_EVENT:
                if (userNameExist(payload.username)) {
                    sendToOne(client, ERROR_EVENT, {errors: ['username already exists']})
                } else {
                    activeUsers.set(payload.username, client)
                    sendToOne(client, LOGIN_EVENT, {username: payload.username})
                    sendToAll(USER_LIST_EVENT, {users: getActiveUsers()})
                }
                break;
            case MESSAGE_EVENT:
                const username = getUsername(client);
                const data2send = {content: payload.message, sender: username};
                sendToAll(MESSAGE_EVENT, {...data2send, ts: Date.now()})
                await addMessage(data2send)
                break;
        }
    });

    client.on('close', () => {
        activeUsers.delete(getUsername(client))
        sendToAll(USER_LIST_EVENT, {users: getActiveUsers()})
    });
});

const sendToAll = (type, payload ) => {
    activeUsers.forEach((client) => {
        client.send(JSON.stringify({type, payload}));
    });
}
const sendToOne = (client, type, payload ) => client.send(JSON.stringify({type, payload}));

const getActiveUsers = () => [...activeUsers.keys()]

const getUsername = (client) =>  [...activeUsers.keys()].find(key => activeUsers.get(key) === client);

const userNameExist = (username) => !![...activeUsers.keys()].find((name) => name === username);
const INIT_EVENT = 'init_chat';
const LOGIN_EVENT = 'user_login';
const MESSAGE_EVENT = 'message';
const USER_LIST_EVENT = 'user_list';
const ERROR_EVENT = 'error';


const ws = new WebSocket('ws://localhost:8080');

const send = (type, payload = {}) => ws.send(JSON.stringify({type, payload}))
const sendLogin = (username) => send(LOGIN_EVENT, {username})
const sendMessage = (message) => send(MESSAGE_EVENT, {message})
const initializeChat = () => send(INIT_EVENT)

ws.addEventListener('open', () => {
    initializeChat();
});

ws.addEventListener('message', (msg) => {
    const {type, payload} = JSON.parse(msg.data);
    switch (type) {
        case INIT_EVENT:
            stateProxy.users = payload.users;
            stateProxy.messages = payload.messages;
            break;
        case LOGIN_EVENT:
            stateProxy.username = payload.username;
            break;
        case USER_LIST_EVENT:
            const users = payload.users;
            stateProxy.users = users;
            break;
        case MESSAGE_EVENT:
            stateProxy.messages = [...state.messages, payload];
            break;
        case ERROR_EVENT:
            stateProxy.errors = payload.errors;
            break;
        default:
            break;
    }
});
const INIT_EVENT = 'init_chat';
const LOGIN_EVENT = 'user_login';
const MESSAGE_EVENT = 'message';
const LOGOUT_EVENT = 'user_logout';
const USER_LIST_EVENT = 'user_list';
const ERROR_EVENT = 'error';
const state = {
    username: undefined, users: [], messages: [], errors: []
};

const $ = (id) => {
    const el = document.getElementById(id);
    if (!el) {
        throw `Element ${id} not found`;
    }

    return {
        element: el,
        css: function (props) {
            Object.entries(props).forEach(([key, value]) => {
                el.style[key] = value;
            })
            return this;
        },
        html: function (html) {
            el.innerHTML = html;
            return this;
        },
        on: function (type, callback) {
            el.addEventListener(type, callback)
            return this;
        },
        scrollDown: function () {
            el.scrollTop = el.scrollHeight
            return this;
        }
    }
}

const renderUsers = (users) => {
    let html = '<ul>';
    users.forEach(user => {
        html += `<li class="user list-group-item">${user}</li>`
    })
    html += '</ul>'
    return html;
}

const timeFormat = (ts) => {
    const timestamp = new Date(ts);
    return timestamp.toLocaleTimeString();
}

const renderMessages = (messages) => {
    let html = `<div class="d-flex flex-column">`
    messages.forEach(message => {
        html += `<div class="message ${message.sender === state.username ? 'mine align-self-end' : 'other align-self-start'}">
                    <span class="sender">${message.sender}</span>
                    <span class="content">${message.content}</span>
                    <span class="timestamp">${timeFormat(message.ts)}</span>
                 </div>`
    });
    html += `</div>`
    return html;
}

const renderErrors = (errors) => {
    let html = '<ul>'
    errors.forEach(error => {
        html += `<li class="error">${error}</li>`
    })
    html += '</ul>'
    return html;
}

const handleStateChange = ({key, value}) => {
    switch (key) {
        case 'username':
            $("username").css({display: value ? "none" : "block"});
            $("new-message").css({display: value ? "block" : "none"});
            break;
        case 'messages':
            $("messages").html(renderMessages(value)).scrollDown()
            break;
        case 'users':
            $("users").html(renderUsers(value));
            break;
        case 'errors':
            $("errors").html(value.length > 0 ? renderErrors(value) : '');
            break;
    }
}


const stateProxy = new Proxy(state, {
    set: function (target, property, value) {
        target[property] = value;

        handleStateChange({key: property, value});
        return true;
    }
});


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

$("message-input").on("keydown", function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const text = event.currentTarget.value.trim();
        if (text !== '') {
            sendMessage(text)
        }
        event.currentTarget.value = '';
    }
});

$("username-input").on("input", function (event) {
    $("username-btn").element.disabled = event.currentTarget.value.trim() === '';
});


$("username-btn").on("click", function () {
    stateProxy.errors = [];
    const userInput = $("username-input").element;
    const username = userInput.value.trim();
    sendLogin(username);
    userInput.value = ''
});





const INIT_EVENT = 'init_chat';
const LOGIN_EVENT = 'user_login';
const MESSAGE_EVENT = 'message';
const LOGOUT_EVENT = 'user_logout';
const USER_LIST_EVENT = 'user_list';
const ERROR_EVENT = 'error';
const state = {
    username: undefined, users: [], messages: [], errors: []
};


const handleStateChange = ({key, value}) => {
    switch (key) {
        case 'username':
            document.getElementById("username").style.display = value ? "none" : "block";
            document.getElementById("new-message").style.display = value ? "block" : "none";
            break;
        case 'messages':
            document.getElementById('messages').innerHTML = renderMessages(value).outerHTML;
            const messagesContainer = document.getElementById("messages");
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            break;
        case 'users':
            document.getElementById('users').innerHTML = renderUsers(value).outerHTML;
            break;
        case 'errors':
            document.getElementById('errors').innerHTML = value.length > 0 ?  renderErrors(value).outerHTML : ''
            break;
    }
}


const stateProxy = new Proxy(state, {
    set: function(target, property, value) {
        target[property] = value;

        handleStateChange({key: property, value });
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


const messageInput = document.getElementById('message-input');
messageInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the newline character from being inserted
        const text = messageInput.value.trim();
        if (text !== '') sendMessage(text)
        messageInput.value = '';

    }
});

const usernameInput = document.getElementById("username-input");
const usernameBtn = document.getElementById("send-username");

usernameInput.addEventListener("input", function () {
    usernameBtn.disabled = usernameInput.value.trim() === ""
});


usernameBtn.addEventListener("click", function () {
    stateProxy.errors = [];
    const username = usernameInput.value.trim();
    sendLogin(username);
    usernameInput.value = '';
});



const createElement = function (element, attrs) {
    const el = document.createElement(element);
    for (let i in attrs) {
        el.setAttribute(i, attrs[i]);
    }
    return el;
}

const renderUsers = (users) => {
    const container = createElement('ul', {class: 'users-container list-group'});
    users.forEach(user => {
        const userItem = createElement('li', {class: 'user list-group-item'})
        userItem.textContent = user;
        container.appendChild(userItem);
    })
    return container;
}
const renderMessages = (messages) => {
    const container = createElement('div', {class: 'message-container d-flex flex-column'});
    messages.forEach(message => {
        const messageDiv = createElement('div', {class: `message ${message.sender === state.username ? 'mine align-self-end' : 'other align-self-start'}`});

        const senderSpan = createElement('span', {class: 'sender'});
        senderSpan.textContent = `${message.sender} `;
        senderSpan.style.fontWeight = 'bold';

        const contentSpan = createElement('span', {class: 'content'});
        contentSpan.textContent = message.content;


        const timestampSpan = createElement('span', {class: 'timestamp'});
        const timestamp = new Date(message.ts);
        timestampSpan.textContent = timestamp.toLocaleTimeString();

        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(contentSpan);
        messageDiv.appendChild(timestampSpan)

        container.appendChild(messageDiv);
    });

    return container;
}

const renderErrors = (errors) => {
    const list = createElement('ul', {class: 'errors-container'});
    errors.forEach(error => {
        const errorItem = createElement('li', {class: 'error'})
        errorItem.textContent = error
        list.appendChild(errorItem);
    })
    return list;
}
const LOGIN_EVENT = 'user_login';
const MESSAGE_EVENT = 'message';
const LOGOUT_EVENT = 'user_logout';
const USER_LIST_EVENT = 'user_list';
const state = {
    username: undefined, users: [], messages: []
};


const ws = new WebSocket('ws://localhost:8080');
const send = (type, payload) => ws.send(JSON.stringify({type, payload}))
const sendLogin = (username) => send(LOGIN_EVENT, {username})
const sendMessage = (message) => send(MESSAGE_EVENT, {sender: state.username, content: message, ts: Date.now()})

ws.addEventListener('open', () => {
    if (!state.username) {
        const username = prompt("What is your name?").trim();
        state.username = username;
        sendLogin(username);
    }
});


ws.addEventListener('message', (msg) => {
    const {type, payload} = JSON.parse(msg.data);
    switch (type) {
        case USER_LIST_EVENT:
            const users = payload.users;
            state.users = users;
            document.getElementById('users').innerHTML = renderUsers(state.users).outerHTML;

            break;
        case MESSAGE_EVENT:
            state.messages = [...state.messages, payload];
            document.getElementById('messages').innerHTML = renderMessages(state.messages).outerHTML;

            break;
        default:
            break;

    }
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



const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

sendButton.addEventListener('click', function () {
    const text = messageInput.value.trim();
    if (text !== '') sendMessage(text)
    messageInput.value = '';
});

messageInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the newline character from being inserted
        const text = messageInput.value.trim();
        if (text !== '') sendMessage(text)
        messageInput.value = '';
    }
});
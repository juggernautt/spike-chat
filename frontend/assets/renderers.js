// Set of functions used to render components. Each one receives data and returns html string with this data rendered

const renderUsers = (users) => {
    let html = users.map(u => `<li class="user list-group-item">${u}</li>`).join('');
    return `<ul>${html}</ul>`
}

const renderMessages = (messages) => {
    const html = messages.map(message => (
        `<div class="message ${message.sender === state.username ? 'mine align-self-end' : 'other align-self-start'}">
            <span class="sender">${message.sender}</span>
            <span class="content">${message.content}</span>
            <span class="timestamp">${timeFormat(message.ts)}</span>
        </div>`
    )).join('')
    return `<div class="d-flex flex-column">${html}</div>`
}

const renderErrors = (errors) => {
    const html = errors.map(error => `<li class="error">${error}</li>`).join('');
    return `<ul>${html}</ul>`;
}
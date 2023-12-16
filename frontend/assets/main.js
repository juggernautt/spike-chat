

const timeFormat = (ts) => {
    const timestamp = new Date(ts);
    return timestamp.toLocaleTimeString();
}


$("message-input").on("keydown", function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const $el = $(event.currentTarget);
        const text = $el.element.value.trim();
        if (text !== '') {
            sendMessage(text)
        }
        $el.value('');
    }
});

$("username-input").on("input", function (event) {
    $("username-btn").disabled(event.currentTarget.value.trim() === '');
});


$("username-btn").on("click", function () {
    stateProxy.errors = [];
    const userInput = $("username-input");
    const username = userInput.element.value.trim();
    sendLogin(username);
    userInput.value('');
});





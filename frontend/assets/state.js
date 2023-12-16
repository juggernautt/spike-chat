const state = {
    username: undefined,
    users: [],
    messages: [],
    errors: []
};


const stateProxy = new Proxy(state, {
    set: function (target, property, value) {
        target[property] = value;
        handleStateChange({key: property, value});
        return true;
    }
});


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
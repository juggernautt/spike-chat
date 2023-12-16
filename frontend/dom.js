const $ = (selector) => {
    const selectElement = (selector) => {
        // Currently only selection of single element by ID or wrapping an element itself supported
        if (typeof selector === "string") {
            return document.getElementById(selector);
        } else if (selector instanceof Element) {
            return selector;
        } else {
            throw "Invalid selector";
        }
    }

    const el = selectElement(selector)
    if (!el) {
        throw `Element not found`;
    }

    return {
        element: el,
        css: function (props) {
            for (let i in props) {
                el.style[i] = props[i];
            }
            return this;
        },
        attr: function(props) {
            for (let i in props) {
                el.setAttribute(i, props[i]);
            }
            return el;
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
        },
        disabled: function(isDisabled) {
            el.disabled = isDisabled;
            return this;
        },
        value: function (val) {
            el.value = val;
            return this
        }
    }
}

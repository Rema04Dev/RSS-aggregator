import View from "./view.js";
import isValidUrl from './validate.js';

const view = new View();
view.init();

const state = {
    form: {
        valid: false,
        errors: [],
    },
};

view.form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const url = formData.get('url');
    try {
        if (isValidUrl(url)) {
            state.form.valid = true;
            state.form.errors = [];
        } else {
            state.form.valid = false;
            state.form.errors.push('invalid url');
        }
    } catch (err) {
        console.error(err);
    }
    view.render(state);
})
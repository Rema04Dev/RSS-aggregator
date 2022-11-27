import View from "./view.js";
import isValidUrl from './validate.js';

import * as yup from "yup";
import onChange from "on-change";

const form = document.querySelector("form");
const input = form.querySelector("#url-input");
const feedbackEl = document.querySelector(".feedback");

const state = {
  urls: [],
  form: {
    valid: false,
    errors: [],
    state: null
  }
};

const mappingMessages = {
  onError: {
    "this must be a valid URL": "Ссылка должна быть валидным URL",
    "this must not be one of the following values": "RSS уже существует"
  },
  valid: 'RSS успешно загружен',
  
  invalid: 'Ссылка должна быть валидным URL',
  duplicate: 'RSS уже существует'
};

const removeClassName = (element, className) => {
    element.classList.remove(className)
}
const addClassName = (element, className) => {
    element.classList.add(className);
}
const setMessage = (element, message) => {
    element.textContent = message;
}
const setSuccessFeedback = (feedback) => {
    const formSate = state.form.state;
    setMessage(feedback, mappingMessages[formSate]);
    removeClassName(feedback, 'text-danger');
    addClassName(feedback, 'text-success');
}

const setErrorFeedback = (feedback) => {
    removeClassName(feedback, 'text-success');
    addClassName(feedback, 'text-danger');
};

const setErrorInput = (input) => {
    addClassName(input, 'is-invalid');
}

const normalizeErrorMessage = (error) => {
    const errorMessage = error.split(':')[0]
    return mappingMessages.onError[errorMessage];
}
const render = (state, form) => {
  if (state.form.valid) {
    form.reset();
    setSuccessFeedback(feedbackEl);
  }
};

const onSuccess = (url) => {
  state.form.valid = true;
  state.form.state = 'valid';
  state.urls.push(url);
  removeClassName(input, 'is-invalid');
  render(state, form);
};

const onError = (e) => {
  state.form.valid = false;
  setMessage(feedbackEl, normalizeErrorMessage(e.message));
  setErrorFeedback(feedbackEl);
  setErrorInput(input)
};

const getUrl = () => new FormData(form).get('url');

form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const url = getUrl();
  const schema = yup.string().required().url().notOneOf(state.urls);
  schema
    .validate(url)
    .then((url) => onSuccess(url))
    .catch((e) => onError(e));
});

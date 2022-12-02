import * as yup from "yup";
import onChange from "on-change";
import render, { elements } from "./view.js";
import getPosts from "./model.js";
import i18n from "i18next";
import resources from "./locales/index.js";
import { renderText } from "./view.js";

const EnBtn = document.querySelector("#en");
const RuBtn = document.querySelector("#ru");

const validate = (url, urls) =>
  yup.string().required().url().notOneOf(urls).validate(url);

export const state = {
  lng: "ru",
  form: {
    state: "filling",
    errors: []
  },
  urls: [],
  feed: {}
};

const i18next = i18n.createInstance();
i18next.init({
  lng: state.lng,
  debug: false,
  resources
});
renderText(elements, i18next);

EnBtn.addEventListener("click", () => {
  i18next.changeLanguage("en");
  renderText(elements, i18next);
});

RuBtn.addEventListener("click", () => {
  i18next.changeLanguage("ru");
  renderText(elements, i18next);
});

export default () => {
  const watchedState = onChange(state, render());
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get("url");
    const { urls } = state;

    validate(url, urls)
      .then((url) => {
        watchedState.urls.push(url);
        watchedState.form.state = "success";
        getPosts(url);
      })
      .catch((err) => {
        watchedState.form.state = "failed";
        watchedState.form.errors.push(err.type);
      });
  });
};

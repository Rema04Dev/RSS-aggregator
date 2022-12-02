import * as yup from "yup";
import onChange from "on-change";
import render, { elements } from "./view.js";
import getPosts from "./model.js";

const validate = (url, urls) =>
  yup.string().required().url().notOneOf(urls).validate(url);
export const state = {
  form: {
    state: "filling",
    errors: { url: false, notOneOf: false }
  },
  urls: [],
  feed: {}
};
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
        // const errType = err.type;
        // watchedState.form.state.errors[errType] = true;
        // console.log(watchedState.form.errors);
      });
  });
};

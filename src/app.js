import * as yup from "yup";
import onChange from "on-change";
import i18n from "i18next";
import axios from "axios";

import render from "./view";
import resources from "./locales/index";
import parseRSS from "./parseRSS";

const defaulltLng = 'ru';

const validate = (url, urls) =>
  yup.string().required().url().notOneOf(urls).validate(url);

const buildProxyURL = (url) => {
  const proxyUrl = "https://allorigins.hexlet.app/raw?url=https://";
  const parsedUrl = new URL(url);
  const { host, pathname } = parsedUrl;
  return `${proxyUrl}${host}/${pathname}`;
};

const fetchRSS = (url) => axios.get(buildProxyURL(url));

export default () => {
  const elements = {
    form: document.querySelector(".rss-form"),
    input: document.querySelector("#url-input"),
    button: document.querySelector('[aria-label="add"]'),

    feedback: document.querySelector(".feedback"),
    posts: document.querySelector(".posts"),

    modal: document.querySelector(".modal"),
    modalTitle: document.querySelector(".modal-title"),
    modalBody: document.querySelector(".modal-body"),
    modalLink: document.querySelector(".modalLink"),
    localesBtnGroup: document.querySelector(".btn-group"),
  };

  const state = {
    lng: "ru",
    form: {
      state: "filling",
      errors: "",
    },
    urls: [],
    feeds: [],
    posts: [],
    visitedPostsId: [],
    currentPost: null,
  };

  const i18next = i18n.createInstance();
  i18next.init({
    lng: defaulltLng,
    debug: false,
    resources,
  });

  const watchedState = onChange(state, render(elements, i18next));
  
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get("url");

    validate(url, watchedState.urls)
      .then((url) => {
        watchedState.urls.push(url);
        watchedState.form.errors = [];
        watchedState.form.state = "sending";
        return fetchRSS(url);
      })
      .then((RSS) => {
          const data = parseRSS(RSS);
          watchedState.feeds.unshift(data.feed);
          watchedState.posts = [...data.posts, ...watchedState.posts];
          watchedState.form.errors = [];
          watchedState.form.state = "success";
      })
      .catch((err) => {
        watchedState.form.state = "failed";
        if (err.type === "url") {
          watchedState.form.errors = "url";
        } else if (err.type === "notOneOf") {
          watchedState.form.errors = "notOneOf";
        } else if (err.code === "ERR_NETWORK") {
          watchedState.form.errors = "network";
        } else if (err.isParsingError) {
          watchedState.form.errors = "parseError";
        }
      });
  });

  elements.posts.addEventListener("click", (evt) => {
    if (
      !evt.target.hasAttribute("data-id") &&
      !evt.target.hasAttribute("data-toggle")
    ) {
      return false;
    }
    if (evt.target.hasAttribute("data-id")) {
      const currentPostId = evt.target.dataset.id;
      watchedState.visitedPostsId.push(currentPostId);
    }

    if (evt.target.hasAttribute("data-toggle")) {
      const id = evt.target.dataset.id;
      watchedState.currentPost = watchedState.posts.find(
        (post) => post.id === id
      );
    }
  });

  elements.localesBtnGroup.addEventListener('click', (evt) => {
    const language = evt.target.dataset.lng;
    watchedState.lng = language;
  })
};

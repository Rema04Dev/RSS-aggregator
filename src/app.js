import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import render, { elements, renderText } from './view';
import resources from './locales/index';
import parseRSS from './parseRSS';

const EnBtn = document.querySelector('#en');
const RuBtn = document.querySelector('#ru');

const validate = (url, urls) => yup.string().required().url().notOneOf(urls)
  .validate(url);

export const state = {
  lng: 'ru',
  form: {
    state: 'filling',
    errors: '',
  },
  urls: [],
  feeds: [],
  posts: [],
  visitedPostsId: [],
  modal: null, 
};

const i18next = i18n.createInstance();
i18next.init({
  lng: state.lng,
  debug: false,
  resources,
});
// renderText(elements, i18next);

EnBtn.addEventListener('click', () => {
  i18next.changeLanguage('en');
  renderText(elements, i18next);
});

RuBtn.addEventListener('click', () => {
  i18next.changeLanguage('ru');
  renderText(elements, i18next);
});

const buildProxyURL = (url) => {
  // const proxiedUrl = new URL('https://allorigins.hexlet.app/get');
  // proxiedUrl.searchParams.set('disableCache', 'true');
  // proxiedUrl.searchParams.set('url', url);
  // return proxiedUrl;

  const proxyUrl = 'https://allorigins.hexlet.app/raw?url=https://';
  const parsedUrl = new URL(url);
  const { host, pathname } = parsedUrl;
  return `${proxyUrl}${host}/${pathname}`;
};

const fetchRSS = (url) => axios.get(buildProxyURL(url));

export default () => {
  const watchedState = onChange(state, render(elements));
  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get('url');

    validate(url, watchedState.urls)
      .then((url) => {
        watchedState.urls.push(url);
        watchedState.form.errors = [];
        watchedState.form.state = 'sending';
        return fetchRSS(url);
      })
      .then((RSS) => {
          const data = parseRSS(RSS);
          watchedState.feeds.unshift(data.feed);
          watchedState.posts = [...data.posts, ...watchedState.posts];
          watchedState.form.errors = [];
          watchedState.form.state = 'success';
      })
      .catch((err) => {
        watchedState.form.state = 'failed';
        if (err.type === 'url') {
          watchedState.form.errors = 'url';
        } else if (err.type === 'notOneOf') {
          watchedState.form.errors = 'notOneOf';
        } else if (err.code === 'ERR_NETWORK') {
          watchedState.form.errors = 'network';
        } else if (err.isParsingError) {
          watchedState.form.errors = 'parseError'
        }
      });
  });

  elements.posts.addEventListener('click', (evt) => {
    if (!evt.target.hasAttribute('data-id') && !evt.target.hasAttribute('data-bs-toggle')) {
      return false;
    }
    if (evt.target.hasAttribute('data-id')) {
      const currentPostId = evt.target.dataset.id;
      watchedState.visitedPostsId.push(currentPostId);
      return;
    }
    if (evt.target.hasAttribute('data-bs-toggle')) {
      watchedState.currentPostId = evt.target.dataset.id;
      watchedState.modal = watchedState.posts.find(currentPostId);
    }
  });

  // data-bs-toggle="modal"
};

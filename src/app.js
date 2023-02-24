import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import watch from './view';
import resources from './locales/index';
import parseRSS from './parseRSS';

const DEFAULT_LANGUAGE = 'ru';
const DELAY = 5000;

const validate = (url, urls) => yup
  .string()
  .required()
  .url('mustBeValid')
  .notOneOf(urls, 'linkExists')
  .validate(url);

const buildProxyURL = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
  url,
)}`;

const fetchRSS = (url) => axios.get(buildProxyURL(url));

const addFeed = (url, data, state) => {
  const { feed } = data;

  feed.id = _.uniqueId();
  feed.url = url;
  state.feeds.unshift(feed);

  /* eslint-disable no-param-reassign */
  state.posts = [...data.posts, ...state.posts];
  state.posts.forEach((p) => {
    const post = p;
    post.id = _.uniqueId();
    post.feedId = data.feed.id;
  });
};

const updatePosts = (state) => {
  const urls = state.feeds.map((feed) => feed.url);
  const promises = urls.map((url) => fetchRSS(url)
    .then((response) => {
      const data = parseRSS(response.data.contents);
      const postsForFeed = state.posts.filter(
        (post) => post.feedId === data.feed.id,
      );
      const postLinksForFeed = state.posts
        .filter((post) => post.id === data.feed.id)
        .map((post) => post.link);
      const addedPosts = postsForFeed.filter(
        (post) => !postLinksForFeed.includes(post.link),
      );

      /* eslint-disable no-param-reassign */
      state.posts = addedPosts.concat(...state.posts);
      console.log(state.posts);
    })
    .catch((err) => {
      console.error(err);
    }));

  Promise.all(promises).finally(() => setTimeout(() => updatePosts(state), DELAY));
};

export default () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: DEFAULT_LANGUAGE,
    debug: false,
    resources,
  }).then(() => {
    const elements = {
      form: document.querySelector('.rss-form'),
      input: document.querySelector('#url-input'),
      button: document.querySelector('.rss-form button[type="submit"]'),

      feedback: document.querySelector('.feedback'),
      posts: document.querySelector('.posts'),

      modal: document.querySelector('.modal'),
      modalTitle: document.querySelector('.modal-title'),
      modalBody: document.querySelector('.modal-body'),
      modalLink: document.querySelector('.modal-link'),
      localesBtnGroup: document.querySelector('.btn-group'),
      feedsContainer: document.querySelector('.feeds'),
      postsContainer: document.querySelector('.posts'),

      templateFeed: document.querySelector('#template-feeds-wrapper'),
      templateFeedElement: document.querySelector('#template-feed-element'),
      templatePost: document.querySelector('#template-posts-wrapper'),
      templatePostElement: document.querySelector('#template-post-element'),
    };

    const initialState = {
      form: {
        status: 'filling',
        error: null,
      },
      loadingProcess: {
        status: 'idle',
        error: null,
      },
      lng: 'ru',
      feeds: [],
      posts: [],
      visitedPostsId: [],
      currentPostId: null,
    };

    const watchedState = watch(initialState, elements, i18nextInstance);
    elements.form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const formData = new FormData(evt.target);
      const url = formData.get('url');
      const urls = watchedState.feeds.map((feed) => feed.url);
      validate(url, urls)
        .then((urlRSS) => {
          watchedState.form.error = null;
          watchedState.form.status = 'sending';
          return urlRSS;
        })
        .then((validatedUrl) => {
          watchedState.loadingProcess.error = null;
          watchedState.loadingProcess.status = 'sending';
          return fetchRSS(validatedUrl);
        })
        .then((response) => {
          const data = parseRSS(response.data.contents);
          addFeed(url, data, watchedState);
          watchedState.form.error = '';
          watchedState.form.status = 'success';
        })
        .catch((err) => {
          switch (err.message) {
            case 'linkExists':
            case 'mustBeValid':
              watchedState.form.status = 'failed';
              watchedState.form.error = err.message;
              break;
            case 'invalidRSS':
              watchedState.loadingProcess.status = 'failed';
              watchedState.loadingProcess.error = err.message;
              break;
            case 'Network Error':
              watchedState.loadingProcess.error = 'network';
              break;
            default:
              watchedState.loadingProcess.status = 'unknown';
          }
        });
    });

    elements.posts.addEventListener('click', (evt) => {
      if (evt.target.hasAttribute('data-id')) {
        const currentPostId = evt.target.dataset.id;
        watchedState.visitedPostsId.push(currentPostId);
      }

      const { id } = evt.target.dataset;
      const currentPost = watchedState.posts.find((post) => post.id === id);
      watchedState.currentPostId = currentPost.id;
    });

    updatePosts(watchedState);
  });
};

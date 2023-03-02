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

const buildProxyURL = (url) => {
  const resultUrl = new URL('https://allorigins.hexlet.app/get');
  resultUrl.searchParams.set('disableCache', true);
  resultUrl.searchParams.set('url', url);
  return resultUrl;
};

const addFeed = (url, data, state) => {
  const { feed, posts } = data;

  feed.id = _.uniqueId();
  feed.url = url;

  posts.forEach((p) => {
    const post = p;
    post.id = _.uniqueId();
    post.feedId = data.feed.id;
  });

  state.feeds.unshift(feed);
  state.posts = [...data.posts, ...state.posts];
};

const fetchRSS = (url, state) => {
  axios.get(buildProxyURL(url))
    .then((response) => {
      const data = parseRSS(response.data.contents);
      addFeed(url, data, state);
      state.loadingProcess = { status: 'success', error: null };
    })
    .catch((err) => {
      if (err.isAxiosError) {
        state.loadingProcess.error = 'network';
      } else if (err.isParsingError) {
        state.loadingProcess.error = 'invalidRSS';
      } else {
        state.loadingProcess.error = 'unknown';
      }
      state.loadingProcess = { ...state.loadingProcess, status: 'failed' };
    });
};

const updatePosts = (state) => {
  const urls = state.feeds.map((feed) => feed.url);
  const promises = urls.map((url) => axios.get(buildProxyURL(url))
    .then((response) => {
      const data = parseRSS(response.data.contents);
      const postsForFeed = state.posts.filter(
        (post) => post.feedId === data.feed.id,
      );
      const postLinksForFeed = state.posts
        .map((post) => post.link);
      const addedPosts = postsForFeed.filter(
        (post) => !postLinksForFeed.includes(post.link),
      );

      state.posts = addedPosts.concat(...state.posts);
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
      watchedState.loadingProcess = { status: 'loading', error: null };
      validate(url, urls)
        .then(() => {
          watchedState.form = { status: 'filling', error: null };
          fetchRSS(url, watchedState);
        })
        .catch((err) => {
          watchedState.form = { status: 'failed', error: err.message };
        });
    });

    elements.posts.addEventListener('click', ({ target }) => {
      if (target.dataset.id) {
        const { id } = target.dataset;
        watchedState.currentPostId = id;
        if (!watchedState.visitedPostsId.includes(id)) {
          watchedState.visitedPostsId.push(id);
        }
      }
      return false;
    });

    updatePosts(watchedState);
  });
};

import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view';
import resources from './locales/index';
import parseRSS from './parseRSS';

const defaulltLng = 'ru';

const validate = (url, urls) => yup
  .string()
  .required()
  .url('mustBeValid')
  .notOneOf(urls, 'linkExists')
  .validate(url);

const buildProxyURL = (
  url,
) => `https://allorigins.hexlet.app/get?disableCache=true&url=
  ${encodeURIComponent(url)}`;

const fetchRSS = (url) => axios.get(buildProxyURL(url));

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('[aria-label="add"]'),

    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),

    modal: document.querySelector('.modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.modalLink'),
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
      state: 'filling',
      errors: '',
    },
    lng: 'ru',
    urls: [],
    feeds: [],
    posts: [],
    visitedPostsId: [],
    currentPost: null,
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaulltLng,
    debug: false,
    resources,
  });

  const watchedState = watch(initialState, elements, i18nextInstance);
  elements.form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const url = formData.get('url');

    validate(url, watchedState.urls)
      .then((urlRSS) => {
        watchedState.urls.push(urlRSS);
        watchedState.form.errors = '';
        watchedState.form.state = 'sending';
        return fetchRSS(urlRSS);
      })
      .then((RSS) => {
        const data = parseRSS(RSS.data.contents);
        watchedState.feeds.unshift(data.feed);
        watchedState.posts = [...data.posts, ...watchedState.posts];
        watchedState.form.errors = '';
        watchedState.form.state = 'success';
      })
      .catch((err) => {
        watchedState.form.state = 'failed';
        if (err.code === 'ERR_NETWORK') {
          watchedState.form.errors = 'network';
          return;
        }
        watchedState.form.errors = err.message;
      });
  });

  elements.posts.addEventListener('click', (evt) => {
    if (evt.target.hasAttribute('data-id')) {
      const currentPostId = evt.target.dataset.id;
      watchedState.visitedPostsId.push(currentPostId);
    }

    if (evt.target.hasAttribute('data-bs-toggle')) {
      const { id } = evt.target.dataset;
      watchedState.currentPost = watchedState.posts.find(
        (post) => post.id === id,
      );
    }
  });

  elements.localesBtnGroup.addEventListener('click', (evt) => {
    const language = evt.target.dataset.lng;
    watchedState.lng = language;
  });

  // const updatePosts = () => {
  //   console.log(watchedState.posts);
  //   const urls = watchedState.feeds.map((feed) => feed.url);
  //   const promises = urls
  //     .map((url) => fetchRSS(url)
  //       .then((updatedRSS) => {
  //         const updatedParsedContent = parseRSS(updatedRSS.data.contents);
  //         const newPosts = updatedParsedContent.posts;
  //         const addedPostsLinks = watchedState.posts.map((post) => post.link);
  //         const addedNewPosts = newPosts.filter((post) => !addedPostsLinks.includes(post.link));
  //         watchedState.posts = [addedNewPosts, ...watchedState.posts]
  //       })
  //       .catch((err) => {
  //         throw err;
  //       }));
  //   Promise.all(promises)
  //     .finally(() => setTimeout(() => updatePosts(), 2000));
  // };
  // updatePosts();
};

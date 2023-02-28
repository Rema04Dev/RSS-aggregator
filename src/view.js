import onChange from 'on-change';

const renderFeeds = (feeds, elements, i18next) => {
  const { feedsContainer, templateFeed, templateFeedElement } = elements;

  const feedsElements = feeds.map((feed) => {
    const { title, description } = feed;
    const feedElement = templateFeedElement.content.cloneNode(true);
    feedElement.querySelector('.feed-title').textContent = title;
    feedElement.querySelector('.feed-description').textContent = description;
    return feedElement;
  });

  const feedWrapper = templateFeed.content.cloneNode(true);
  const title = feedWrapper.querySelector('.card-title');
  const feedList = feedWrapper.querySelector('ul');

  title.textContent = i18next.t('feedsTitle');
  feedsContainer.innerHTML = '';

  feedList.append(...feedsElements);
  feedsContainer.append(feedWrapper);
};

const renderPosts = (state, posts, elements, i18next) => {
  const { postsContainer, templatePost, templatePostElement } = elements;

  const postsElements = posts.map((post) => {
    const { id, title, link } = post;
    const postElement = templatePostElement.content.cloneNode(true);
    const linkEl = postElement.querySelector('a');
    const buttonEl = postElement.querySelector('.btn');

    linkEl.textContent = title;
    linkEl.href = link;
    buttonEl.setAttribute('data-id', id);
    linkEl.setAttribute('data-id', id);

    if (state.visitedPostsId.includes(id)) {
      linkEl.classList.add('fw-normal', 'link-secondary');
    } else {
      linkEl.classList.add('fw-bold');
    }

    return postElement;
  });

  const postsWrapper = templatePost.content.cloneNode(true);
  const postList = postsWrapper.querySelector('ul');
  const title = postsWrapper.querySelector('.card-title');

  title.textContent = i18next.t('postsTitle');
  postsContainer.innerHTML = '';

  postList.append(...postsElements);
  postsContainer.append(postsWrapper);
};

const renderVisistedPosts = (visitedPostsId) => {
  visitedPostsId.forEach((id) => {
    const link = document.querySelector(`a[data-id="${id}"]`);
    link.classList.remove('fw-bold');
    link.classList.add('fw-normal', 'link-secondary');
  });
};

const renderModal = (state, postId) => {
  const post = state.posts.find((p) => p.id === postId);
  const {
    id, title, description, link,
  } = post;
  const modal = document.querySelector('.modal');
  const titleEl = modal.querySelector('.modal-title');
  const bodyEl = modal.querySelector('.modal-body');
  const linkEl = modal.querySelector('.modal-link');

  titleEl.textContent = title;
  bodyEl.textContent = description;

  modal.setAttribute('data-id', id);
  linkEl.setAttribute('href', link);
};

const clear = (elements) => {
  const { input, feedback, button } = elements;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.remove('text-success');
  feedback.classList.remove('text-warning');
  feedback.textContent = '';

  input.disabled = '';
  button.disabled = '';
};

const renderError = (errType, elements, i18next) => {
  const { input, feedback } = elements;
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.textContent = errType ? i18next.t(`messages.${errType}`) : '';
};

const processHandler = (state, elements, i18next) => {
  const { status, error } = state;
  const { input, button, feedback } = elements;

  switch (status) {
    case 'success':
      input.focus();
      feedback.classList.add('text-success');
      feedback.textContent = i18next.t('messages.success');
      break;
    case 'loading':
      input.disabled = true;
      button.disabled = true;
      feedback.classList.add('text-warning');
      feedback.textContent = i18next.t('messages.loading');
      break;
    case 'failed':
      renderError(error, elements, i18next);
      break;
    default:
      break;
  }
};

const formHandler = (state, elements, i18next) => {
  const { status, error } = state;
  const { form, input } = elements;

  switch (status) {
    case 'filling':
      elements.input.focus();
      break;
    case 'success':
      input.focus();
      form.reset();
      break;
    case 'failed':
      renderError(error, elements, i18next);
      break;
    default:
      break;
  }
};

const watch = (state, elements, i18nextInstance) => onChange(state, (path, value) => {
  switch (path) {
    case 'form':
      clear(elements);
      formHandler(value, elements, i18nextInstance);
      break;
    case 'loadingProcess':
      clear(elements);
      processHandler(value, elements, i18nextInstance);
      break;
    case 'feeds':
      renderFeeds(value, elements, i18nextInstance);
      break;
    case 'posts':
      renderPosts(state, value, elements, i18nextInstance);
      break;
    case 'visitedPostsId':
      renderVisistedPosts(value);
      break;
    case 'currentPostId':
      renderModal(state, value, elements);
      break;

    default:
      break;
  }
});

export default watch;

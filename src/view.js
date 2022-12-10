const feedsContainer = document.querySelector('.feeds');
const postsContainer = document.querySelector('.posts');

const templateFeed = document.querySelector('#template-feeds-wrapper');
const templateFeedElement = document.querySelector('#template-feed-element');
const templatePost = document.querySelector('#template-posts-wrapper');
const templatePostElement = document.querySelector('#template-post-element');
const templateModal = document.querySelector('#template-modal');

const createFeed = (feed) => {
  const { title, description } = feed;
  const feedElement = templateFeedElement.content.cloneNode(true);
  feedElement.querySelector('.feed-title').textContent = title;
  feedElement.querySelector('.feed-description').textContent = description;
  return feedElement;
};

const createModal = (post) => {
  const modal = templateModal.content.querySelector('.modal').cloneNode(true);
  // modal.setAttribute('id', id);
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const modalLink = modal.querySelector('a');

  // const currentPost = state.posts.find(({ id }) => id === state.currentPostId);
  modalTitle.textContent = post.title;
  modalBody.textContent = post.description;
  modalLink.setAttribute('href', link);

  return modal;
};
const createPost = (post) => {
  const { id, title, link } = post;
  const postElement = templatePostElement.content.cloneNode(true);
  const linkEl = postElement.querySelector('a');
  const buttonEl = postElement.querySelector('button');
  buttonEl.setAttribute('data-target', id);
  buttonEl.setAttribute('data-id', id);
  linkEl.textContent = title;
  linkEl.href = link;
  linkEl.setAttribute('data-id', id);
  return postElement;
};

const renderModal = (postId) => {
  console.log(postId)
};

const renderFeeds = (feeds) => {
  feedsContainer.innerHTML = '';
  const feedWrapper = templateFeed.content.cloneNode(true);
  const feedList = feedWrapper.querySelector('ul');
  const feedsElements = feeds.map(createFeed);
  feedList.append(...feedsElements);
  feedsContainer.append(feedWrapper);
};

const renderPosts = (posts) => {
  postsContainer.innerHTML = '';
  const postsWrapper = templatePost.content.cloneNode(true);
  const postList = postsWrapper.querySelector('ul');
  const postsElements = posts.map(createPost);
  postList.append(...postsElements);
  postsContainer.append(postsWrapper);
};

const renderVisistedPosts = (visitedPostsId) => {
  visitedPostsId.forEach((id) => {
    const a = document.querySelector(`a[data-id="${id}"]`);
    a.classList.remove('fw-bold');
    a.classList.add('fw-normal', 'link-secondary');
  });
};

export const elements = {
  form: document.querySelector('.rss-form'),
  input: document.getElementById('url-input'),
  button: document.querySelector('[aria-label="add"]'),
  feedback: document.querySelector('.feedback'),
  posts: document.querySelector('.posts'),
};

const messages = {
  url: 'Ссылка должна быть валидным URL',
  notOneOf: 'RSS уже существует',
  success: 'RSS успешно загружен',
  sending: 'Идёт загрузка...',
  network: 'Ресурс не содержит валидный RSS',
  // parseError: 'Ресурс не содержит валидный RSS',
};

const clear = () => {
  elements.input.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.remove('text-warning');
  elements.feedback.textContent = '';

  elements.input.disabled = '';
  elements.button.disabled = '';
};

const FormMachine = {
  filling: {
    render: () => {
      clear();
      elements.input.focus();
    },
  },
  sending: {
    render: () => {
      clear();
      elements.form.reset();
      elements.input.disabled = true;
      elements.button.disabled = true;
      elements.feedback.classList.add('text-warning');
      elements.feedback.textContent = messages.sending;
    },
  },
  success: {
    render: () => {
      clear();
      elements.input.focus();
      elements.form.reset();
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = messages.success;
    },
  },
  failed: {
    render: (err) => {
      clear();
      elements.input.classList.add('is-invalid');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = messages[err];
    },
  },
};

export const renderText = (elements, i18next) => {
  const { form, button } = elements;
  const title = document.querySelector('h2');
  title.textContent = i18next.t('title');
  const subtitle = document.querySelector('.lead');
  subtitle.textContent = i18next.t('subtitle');
  const placeholder = form.querySelector('[for="url-input"]');
  placeholder.textContent = i18next.t('placeholder');
  const example = document.querySelector('.example');
  example.textContent = i18next.t('example');
  button.textContent = i18next.t('button');
};

export default () => (path, value) => {
  switch (path) {
    case 'form.state':
      FormMachine[value].render();
      break;
    case 'form.errors':
      FormMachine.failed.render(value);
      break;
    case 'feeds':
      renderFeeds(value);
      break;
    case 'posts':
      renderPosts(value);
      break;
    case 'visitedPostsId':
      renderVisistedPosts(value);
    case 'currentPostId':
      console.log(value)
      // renderModal(value);
    default:
      break;
  }
};

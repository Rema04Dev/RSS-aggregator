import _ from "lodash";

const renderText = (elements, i18next) => {
  const { form, button } = elements;
  const title = document.querySelector(".title");
  title.textContent = i18next.t("title");
  const subtitle = document.querySelector(".lead");
  subtitle.textContent = i18next.t("subtitle");
  const placeholder = form.querySelector('[for="url-input"]');
  placeholder.textContent = i18next.t("placeholder");
  const example = document.querySelector(".example");
  example.textContent = i18next.t("example");
  button.textContent = i18next.t("button");
};

const changeLng = (elements, value, i18next) => {
  const buttons = elements.localesBtnGroup.querySelectorAll(".btn-lng");
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    const activeButton = document.querySelector(`[data-lng="${value}"]`);
    activeButton.classList.add("active");
    i18next.changeLanguage(value);
    renderText(elements, i18next)
  });
};
const feedsContainer = document.querySelector(".feeds");
const postsContainer = document.querySelector(".posts");

const templateFeed = document.querySelector("#template-feeds-wrapper");
const templateFeedElement = document.querySelector("#template-feed-element");
const templatePost = document.querySelector("#template-posts-wrapper");
const templatePostElement = document.querySelector("#template-post-element");
const templateModal = document.querySelector("#template-modal");

const createFeed = (feed) => {
  const { title, description } = feed;
  const feedElement = templateFeedElement.content.cloneNode(true);
  feedElement.querySelector(".feed-title").textContent = title;
  feedElement.querySelector(".feed-description").textContent = description;
  return feedElement;
};

const createPost = (post) => {
  const { id, title, link } = post;
  const postElement = templatePostElement.content.cloneNode(true);
  const linkEl = postElement.querySelector("a");
  const buttonEl = postElement.querySelector("button");
  buttonEl.setAttribute("data-target", `#${id}`);
  buttonEl.setAttribute("data-id", id);
  linkEl.textContent = title;
  linkEl.href = link;
  linkEl.setAttribute("data-id", id);
  return postElement;
};

const renderFeeds = (feeds, i18next) => {
  feedsContainer.innerHTML = "";
  const feedWrapper = templateFeed.content.cloneNode(true);
  const title = feedWrapper.querySelector('.card-title');
  title.textContent = i18next.t('feedsTitle');
  const feedList = feedWrapper.querySelector("ul");
  const feedsElements = feeds.map((feed) => createFeed(feed));
  feedList.append(...feedsElements);
  feedsContainer.append(feedWrapper);
};

const renderPosts = (posts, i18next) => {
  postsContainer.innerHTML = "";
  const postsWrapper = templatePost.content.cloneNode(true);
  const title = postsWrapper.querySelector('.card-title');
  title.textContent = i18next.t('postsTitle');
  const postList = postsWrapper.querySelector("ul");
  const postsElements = posts.map(createPost);
  postList.append(...postsElements);
  postsContainer.append(postsWrapper);
};

const renderVisistedPosts = (visitedPostsId) => {
  visitedPostsId.forEach((id) => {
    const link = document.querySelector(`a[data-id="${id}"]`);
    link.classList.remove("fw-bold");
    link.classList.add("fw-normal", "link-secondary");
  });
};

const createModal = (post) => {
  const { title, description, link } = post;
  elements.modalTitle.innerHTML = title;
  elements.modalBody.innerHTML = description;
  elements.modalLink.setAttribute("href", link);
};

const messages = {
  url: "Ссылка должна быть валидным URL",
  notOneOf: "RSS уже существует",
  success: "RSS успешно загружен",
  sending: "Идёт загрузка...",
  network: "Ресурс не содержит валидный RSS",
  // parseError: 'Ресурс не содержит валидный RSS',
};

const clear = (elements) => {
  console.log(elements.input);
  elements.input.classList.remove("is-invalid");
  elements.feedback.classList.remove("text-danger");
  elements.feedback.classList.remove("text-success");
  elements.feedback.classList.remove("text-warning");
  elements.feedback.textContent = "";

  elements.input.disabled = "";
  elements.button.disabled = "";
};

const FormMachine = {
  filling: (elements) => {
      clear(elements);
      elements.input.focus();
  },
  sending: (elements, i18next) => {
      clear(elements);
      elements.form.reset();
      elements.input.disabled = true;
      elements.button.disabled = true;
      elements.feedback.classList.add("text-warning");
      elements.feedback.textContent = i18next.t('messages.sending');
  },
  success: (elements, i18next) => {
      clear(elements);
      elements.input.focus();
      elements.form.reset();
      elements.feedback.classList.add("text-success");
      elements.feedback.textContent = i18next.t('messages.success');
  },
  failed: (err, elements, i18next) => {
      clear(elements);
      elements.input.classList.add("is-invalid");
      elements.feedback.classList.add("text-danger");
      elements.feedback.textContent = i18next.t(`${messages}.${err}`);
  },
};

const render = (elements, i18next) => (path, value) => {
  switch (path) {
    case "form.state":
      FormMachine[value](elements, i18next);
      break;
    case "form.errors":
      FormMachine.failed(value, elements, i18next)
      break;
    case "feeds":
      renderFeeds(value, i18next);
      break;
    case "posts":
      renderPosts(value, i18next);
      break;
    case "visitedPostsId":
      renderVisistedPosts(value);
      break;
    case "currentPost":
      createModal(value);
      break;
    case "lng":
      changeLng(elements, value, i18next);
      break;

    default:
      break;
  }
};

export default render;
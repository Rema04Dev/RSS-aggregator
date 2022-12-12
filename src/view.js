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
    renderText(elements, i18next);
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
  const buttonEl = postElement.querySelector(".btn");

  linkEl.textContent = title;
  linkEl.href = link;

  buttonEl.setAttribute("data-id", id);
  buttonEl.setAttribute('data-bs-toggle', 'modal');
  buttonEl.setAttribute("data-bs-target", '#modal');
  linkEl.setAttribute("data-id", id);

  return postElement;
};

const renderFeeds = (feeds, i18next) => {
  feedsContainer.innerHTML = "";
  const feedWrapper = templateFeed.content.cloneNode(true);
  const title = feedWrapper.querySelector(".card-title");
  title.textContent = i18next.t("feedsTitle");
  const feedList = feedWrapper.querySelector("ul");
  const feedsElements = feeds.map((feed) => createFeed(feed));
  feedList.append(...feedsElements);
  feedsContainer.append(feedWrapper);
};

const renderPosts = (posts, i18next) => {
  postsContainer.innerHTML = "";
  const postsWrapper = templatePost.content.cloneNode(true);
  const title = postsWrapper.querySelector(".card-title");
  title.textContent = i18next.t("postsTitle");
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

const renderModal = (post) => {
  const { id, title, description, link } = post;
  // const modal = templateModal.content.cloneNode(true).querySelector('.modal');
  const modal = document.querySelector('.modal');
  modal.setAttribute('id', id);
  const titleEl = modal.querySelector(".modal-title");
  const bodyEl = modal.querySelector(".modal-body");
  const linkEl = modal.querySelector(".modal-link");

  titleEl.textContent = title;
  bodyEl.textContent = description;
  linkEl.setAttribute("href", link);
  console.log(modal)
};

const clear = (elements) => {
  const { input, feedback, button } = elements;
  input.classList.remove("is-invalid");
  feedback.classList.remove("text-danger");
  feedback.classList.remove("text-success");
  feedback.classList.remove("text-warning");
  feedback.textContent = "";

  input.disabled = "";
  button.disabled = "";
};

const FormStateHandler = {
  filling: (elements) => {
    elements.input.focus();
  },
  sending: (elements, i18next) => {
    const { form, input, button, feedback } = elements;
    form.reset();
    input.disabled = true;
    button.disabled = true;
    feedback.classList.add("text-warning");
    feedback.textContent = i18next.t("messages.sending");
  },
  success: (elements, i18next) => {
    const { input, form, feedback } = elements;
    input.focus();
    form.reset();
    feedback.classList.add("text-success");
    feedback.textContent = i18next.t("messages.success");
  },
  failed: (errType, elements, i18next) => {
    const { input, feedback } = elements;
    input.classList.add("is-invalid");
    feedback.classList.add("text-danger");
    feedback.textContent = i18next.t(`messages.${errType}`);
  },
};

const render = (elements, i18next) => (path, value) => {
  switch (path) {
    case "form.state":
      clear(elements);
      FormStateHandler[value](elements, i18next);
      break;
    case "form.errors":
      clear(elements);
      FormStateHandler.failed(value, elements, i18next);
      break;
    case "feeds":
      renderFeeds(value, i18next);
      break;
    case "posts":
      renderPosts(value, i18next);
      break;
    case "lng":
      changeLng(elements, value, i18next);
      break;
    case "visitedPostsId":
      renderVisistedPosts(value);
      break;
    case "currentPost":
      renderModal(value, elements);
      break;

    default:
      console.log("Мимо всех");
      console.log(path, value);
      break;
  }
};

export default render;

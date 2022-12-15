import onChange from "on-change";

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

const renderFeeds = (feeds, elements, i18next) => {
  const { feedsContainer, templateFeed, templateFeedElement } = elements;

  const feedsElements = feeds.map((feed) => {
    const { title, description } = feed;
    const feedElement = templateFeedElement.content.cloneNode(true);
    feedElement.querySelector(".feed-title").textContent = title;
    feedElement.querySelector(".feed-description").textContent = description;
    return feedElement;
  });

  const feedWrapper = templateFeed.content.cloneNode(true);
  const title = feedWrapper.querySelector(".card-title");
  const feedList = feedWrapper.querySelector("ul");

  title.textContent = i18next.t("feedsTitle");
  feedsContainer.innerHTML = "";

  feedList.append(...feedsElements);
  feedsContainer.append(feedWrapper);
};

const renderPosts = (posts, elements, i18next) => {
  const { postsContainer, templatePost, templatePostElement } = elements;

  const postsElements = posts.map((post) => {
    const { id, title, link } = post;
    const postElement = templatePostElement.content.cloneNode(true);
    const linkEl = postElement.querySelector("a");
    const buttonEl = postElement.querySelector(".btn");

    linkEl.textContent = title;
    linkEl.href = link;
    buttonEl.setAttribute("data-id", id);
    linkEl.setAttribute("data-id", id);

    return postElement;
  });

  const postsWrapper = templatePost.content.cloneNode(true);
  const postList = postsWrapper.querySelector("ul");
  const title = postsWrapper.querySelector(".card-title");

  title.textContent = i18next.t("postsTitle");
  postsContainer.innerHTML = "";

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
  const modal = document.querySelector(".modal");
  const titleEl = modal.querySelector(".modal-title");
  const bodyEl = modal.querySelector(".modal-body");
  const linkEl = modal.querySelector(".modal-link");

  titleEl.textContent = title;
  bodyEl.textContent = description;

  // modal.setAttribute("id", id);
  linkEl.setAttribute("href", link);
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

const processHandler = (status, elements, i18next) => {
  const { form, input, button, feedback } = elements;
  switch (status) {
    case "filling":
      elements.input.focus();
      break;
    case "sending":
      form.reset();
      input.disabled = true;
      button.disabled = true;
      feedback.classList.add("text-warning");
      feedback.textContent = i18next.t("messages.sending");
      break;
    case "success":
      input.focus();
      form.reset();
      feedback.classList.add("text-success");
      feedback.textContent = i18next.t("messages.success");
      break;
    default: console.log('Мимо всех')
    break
  }
};

const renderError = (errType, elements, i18next) => {
  const { input, feedback } = elements;
  input.classList.add("is-invalid");
  feedback.classList.add("text-danger");
  feedback.textContent = i18next.t(`messages.${errType}`);
};

const watch = (state, elements, i18nextInstance) =>
  onChange(state, (path, value) => {
    switch (path) {
      case "form.state":
        clear(elements);
        processHandler(value, elements, i18nextInstance);
        break;
      case "form.errors":
        clear(elements);
        renderError(value, elements, i18nextInstance);
        break;
      case "feeds":
        renderFeeds(value, elements, i18nextInstance);
        break;
      case "posts":
        renderPosts(value, elements, i18nextInstance);
        break;
      case "lng":
        changeLng(elements, value, i18nextInstance);
        break;
      case "visitedPostsId":
        renderVisistedPosts(value);
        break;
      case "currentPost":
        renderModal(value, elements);
        break;

      default: new Error('Unknown...')
        break;
    }
  });

export default watch;

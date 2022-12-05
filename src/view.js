const feedsContainer = document.querySelector(".feeds");
const postsContainer = document.querySelector(".posts");

const templateFeed = document.querySelector("#template-feeds-wrapper");
const templateFeedElement = document.querySelector("#template-feed-element");
const templatePost = document.querySelector("#template-posts-wrapper");
const templatePostElement = document.querySelector("#template-post-element");

const getModal = (id, link) => {
  const modal = document.querySelector(".modal");
  modal.setAttribute('id', id);
  const title = modal.querySelector(".modal-title");
  const body = modal.querySelector(".modal-body");
  const modalButton = modal.querySelector('a');
  modalButton.href = link;
  return {
    title,
    body
  };
};

const createFeed = (feed) => {
  const { title, description } = feed;
  const feedElement = templateFeedElement.content.cloneNode(true);
  feedElement.querySelector(".feed-title").textContent = title;
  feedElement.querySelector(".feed-description").textContent = description;
  return feedElement;
};

const createPost = (post) => {
  const { id, title, description, link } = post;
  const postElement = templatePostElement.content.cloneNode(true);
  const linkEl = postElement.querySelector("a");
  const buttonEl = postElement.querySelector("button");
  buttonEl.addEventListener("click", () => {
    const modal = getModal(id, link);
    modal.title.textContent = title;
    modal.body.textContent = `${description}`;
  });
  linkEl.textContent = title;
  linkEl.href = link;

  return postElement;
};

const renderFeeds = (feeds) => {
  feedsContainer.innerHTML = "";
  const feedWrapper = templateFeed.content.cloneNode(true);
  const feedList = feedWrapper.querySelector("ul");
  const feedsElements = feeds.map(createFeed);
  feedList.append(...feedsElements);
  feedsContainer.append(feedWrapper);
};

const renderPosts = (posts) => {
  console.log(posts);
  postsContainer.innerHTML = "";
  const postsWrapper = templatePost.content.cloneNode(true);
  const postList = postsWrapper.querySelector("ul");
  const postsElements = posts.map(createPost);
  postList.append(...postsElements);
  postsContainer.append(postsWrapper);
};

export const elements = {
  form: document.querySelector(".rss-form"),
  input: document.getElementById("url-input"),
  button: document.querySelector('[aria-label="add"]'),
  feedback: document.querySelector(".feedback")
};

const messages = {
  url: "Ссылка должна быть валидным URL",
  notOneOf: "RSS уже существует",
  success: "RSS успешно загружен",
  sending: "Идёт загрузка..."
};

const clear = () => {
  elements.input.classList.remove("is-invalid");
  elements.feedback.classList.remove("text-danger");
  elements.feedback.classList.remove("text-success");
  elements.feedback.classList.remove("text-warning");
  elements.feedback.textContent = "";
};

const FormMachine = {
  transitions: {
    filling: {
      render: () => {
        clear();
        elements.input.focus();
      }
    },
    sending: {
      render: () => {
        clear();
        elements.form.reset();
        elements.feedback.classList.add("text-warning");
        elements.feedback.textContent = messages.sending;
      }
    },
    success: {
      render: (feeds) => {
        clear();
        elements.input.focus();
        elements.form.reset();
        elements.feedback.classList.add("text-success");
        elements.feedback.textContent = messages.success;
      }
    },
    failed: {
      render: (err) => {
        clear();
        elements.input.classList.add("is-invalid");
        elements.feedback.classList.add("text-danger");
        elements.feedback.textContent = messages[err];
      }
    }
  }
};

export const renderText = (elements, i18next) => {
  const { form, button } = elements;
  const title = document.querySelector("h2");
  title.textContent = i18next.t(`title`);
  const subtitle = document.querySelector(".lead");
  subtitle.textContent = i18next.t(`subtitle`);
  const placeholder = form.querySelector('[for="url-input"]');
  placeholder.textContent = i18next.t(`placeholder`);
  const example = document.querySelector(".example");
  example.textContent = i18next.t(`example`);
  button.textContent = i18next.t(`button`);
};

export default () => (path, value) => {
  switch (path) {
    case "form.state":
      FormMachine.transitions[value].render();
      break;
    case "form.errors":
      FormMachine.transitions.failed.render();
      break;
    case "feeds":
      renderFeeds(value);
      break;
    case "posts":
      renderPosts(value);
      break;
    default:
      break;
  }
};

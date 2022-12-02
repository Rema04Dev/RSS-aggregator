const feedsContainer = document.querySelector(".feeds");
const postsContainer = document.querySelector(".posts ul");

const templateHeader = document.querySelector("#template-header");
const templatePost = document.querySelector("#template-post");

const createHeader = (feed) => {
  const { title, description } = feed;
  const feedHeader = templateHeader.content.cloneNode(true);
  feedHeader.querySelector(".feed-title").textContent = title;
  feedHeader.querySelector(".feed-description").textContent = description;
  return feedHeader;
};
const getModal = () => {
  const modal = document.querySelector(".modal");
  const title = modal.querySelector(".modal-title");
  const body = modal.querySelector(".modal-body");
  console.log(modal);
  return {
    title,
    body
  };
};
const createPost = (post) => {
  const { id, title, description, link } = post;
  const feepPost = templatePost.content.cloneNode(true);
  const linkEl = feepPost.querySelector("a");

  const buttonEl = feepPost.querySelector("button");
  buttonEl.addEventListener("click", () => {
    const modal = getModal();
    modal.title.textContent = title;
    modal.body.textContent = description;
  });
  linkEl.textContent = title;
  linkEl.href = link;

  return feepPost;
};

export default (feed) => {
  const header = createHeader(feed);
  const postsEl = feed.items.map(createPost);
  feedsContainer.append(header);
  postsContainer.append(...postsEl);
};

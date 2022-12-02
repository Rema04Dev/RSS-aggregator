import _ from "lodash";
const parse = (xml) => {
  const parser = new DOMParser();
  return parser.parseFromString(xml, 'text/xml')
}
export default (xml) => {
  const doc = parse(xml.data);
  const feedTitle = doc.querySelector("title");
  const feedDescription = doc.querySelector("description");
  const feedItems = [...doc.querySelectorAll("item")];
  const items = feedItems.map((item) => ({
    id: _.uniqueId(),
    title: item.querySelector("title").textContent,
    description: item.querySelector("description").textContent,
    link: item.querySelector("link").textContent
  }));
  const result = {
    id: _.uniqueId(),
    title: feedTitle.textContent,
    description: feedDescription.textContent,
    items: [...items]
  };
  return result;
};

import _ from 'lodash';

export default (xml) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml.data, 'text/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    throw error;
  }
  const feedTitle = doc.querySelector('title');
  const feedDescription = doc.querySelector('description');
  const feedItems = [...doc.querySelectorAll('item')];
  const items = feedItems.map((item) => ({
    id: _.uniqueId(),
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').textContent,
  }));
  return {
    feed: {
      title: feedTitle.textContent,
      description: feedDescription.textContent,
    },
    posts: [...items],
  };
};

import _ from 'lodash';

export default (xml) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml.data, 'text/xml');
  if (doc.querySelector('parsererror')) {
    const err = new Error({
      name: 'parseError',
      message: 'Invalid RSS',
      hasError: true,
    });
    throw err;
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

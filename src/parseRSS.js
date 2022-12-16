export default (xml) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw Error('invalidRSS');
  }
  const feedTitle = doc.querySelector('title');
  const feedDescription = doc.querySelector('description');
  const feedItems = [...doc.querySelectorAll('item')];
  const items = feedItems.map((item) => ({
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

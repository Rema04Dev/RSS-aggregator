import axios from "axios";
import renderFeed from "./renderFeed.js";
import parseRSS from "./parseRSS.js";
import path from 'path';

const url = "https://ru.hexlet.io/lessons.rss";
const formatURL = (url) => {
  const proxyUrl = "https://allorigins.hexlet.app/raw?url=https://";
  const parsedUrl = new URL(url);
  const { host, pathname } = parsedUrl;
  return `${proxyUrl}${host}/${pathname}`;
};

const getPosts = (url) => {
  return axios
    .get(formatURL(url))
    .then((xml) => parseRSS(xml))
    .then((feeds) => renderFeed(feeds))
    .catch((e) => console.log(e));
};

export default getPosts;

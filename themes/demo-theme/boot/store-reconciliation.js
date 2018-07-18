// The server may have made changes to the store before rendering the initial html. It writes those changes to window.__INITIAL_STATE__. We need to set out local store to be the same as the server so vue does not throw an hydration error (server and client html out of sync)
const Vue = require("vue");
const VueStash = require("vue-stash").default;
Vue.use(VueStash);
const router = require("./router");
const config = require("config");
require('./facebook-social')
const defaultStore = config.store;

let store = defaultStore;

try {
  if (typeof window !== "undefined" && window.__INITIAL_STATE__) {
    store = window.__INITIAL_STATE__;
  }
} catch (err) {}

router.beforeEach((to, from, next) => {
  let path = to.path.replace('.html', '').replace('.htm', '')
  const found = store.files.find(post => post.url === path);
  if (!found) {
    router.replace("/404");
  } else {
    store.file = found;
    store.social_url = config.site_url + store.file.url
  }
  next();
});

router.afterEach(() => {
  if(!Vue.prototype.$isServer) {
    Vue.nextTick(() => {
      setTimeout(() => {
        /**
         * Make all links target="_blank"
         */
        const links = document.links;
        for (var i = 0, linksLength = links.length; i < linksLength; i++) {
          if (links[i].hostname != window.location.hostname) {
            links[i].target = '_blank';
          } 
        }
      }, 250);
    });
  }
});

module.exports = store;

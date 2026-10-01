const RedditApi = (() => {
  const REQUEST_GAP_MS = 1200;
  let lastSearchAt = 0;
  let activeController = null;
  const endpoints = {
    arcticPosts: username => `https://arctic-shift.photon-reddit.com/api/posts/search?author=${encodeURIComponent(username)}&limit=100&sort=desc`,
    arcticComments: username => `https://arctic-shift.photon-reddit.com/api/comments/search?author=${encodeURIComponent(username)}&limit=100&sort=desc`,
    pullpushPosts: username => `https://api.pullpush.io/reddit/search/submission/?test&author=${encodeURIComponent(username)}&limit=100&sort=desc`,
    pullpushComments: username => `https://api.pullpush.io/reddit/search/comment/?test&author=${encodeURIComponent(username)}&limit=100&sort=desc`
  };

  const payload = result => result.status === 'fulfilled' ? result.value : { data: [] };
  const dateFrom = item => new Date((item.created_utc || item.created || 0) * 1000).toISOString().slice(0, 10);
  const postRecord = (item, username, source) => ({
    type: 'post', title: item.title || '[untitled post]', body: item.selftext || 'No body text captured.',
    subreddit: item.subreddit || 'unknown', author: item.author || username, created: dateFrom(item),
    score: item.score || 0, comments: item.num_comments || 0, nsfw: Boolean(item.over_18 || item.nsfw), source,
    url: `https://www.reddit.com/comments/${item.id || ''}/`
  });
  const commentRecord = (item, username, source) => ({
    type: 'comment', title: `Re: ${item.link_title || '[deleted thread]'}`, body: item.body || '[deleted comment]',
    subreddit: item.subreddit || 'unknown', author: item.author || username, created: dateFrom(item),
    score: item.score || 0, comments: 0, nsfw: Boolean(item.over_18 || item.nsfw), source,
    id: item.id, url: `https://www.reddit.com/comments/${item.link_id?.replace('t3_', '') || ''}/`
  });

  const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
  const fetchJson = (url, signal) => fetch(url, { signal, headers: { Accept: 'application/json' } }).then(response => response.ok ? response.json() : Promise.reject(new Error(`Archive request failed: ${response.status}`)));

  async function search(username) {
    if (activeController) activeController.abort();
    const waitFor = Math.max(0, REQUEST_GAP_MS - (Date.now() - lastSearchAt));
    if (waitFor) await sleep(waitFor);
    lastSearchAt = Date.now();
    const controller = new AbortController();
    activeController = controller;
    const requests = [
      fetchJson(endpoints.arcticPosts(username), controller.signal),
      fetchJson(endpoints.arcticComments(username), controller.signal),
      fetchJson(endpoints.pullpushPosts(username), controller.signal),
      fetchJson(endpoints.pullpushComments(username), controller.signal)
    ];
    try {
      const [arcticResult, arcticCommentsResult, pullpushPostsResult, pullpushCommentsResult] = await Promise.allSettled(requests);
      const arcticPosts = (payload(arcticResult).data || []).map(item => postRecord(item, username, 'Arctic Shift'));
      const arcticComments = (payload(arcticCommentsResult).data || []).map(item => commentRecord(item, username, 'Arctic Shift'));
      const pullpushPosts = (payload(pullpushPostsResult).data || []).map(item => postRecord(item, username, 'PullPush'));
      const pullpushComments = (payload(pullpushCommentsResult).data || []).map(item => commentRecord(item, username, 'PullPush'));
      const seen = new Set();
      return [...arcticPosts, ...arcticComments, ...pullpushPosts, ...pullpushComments].filter(record => {
        if (record.created === '1970-01-01' || (record.id && seen.has(record.id))) return false;
        if (record.id) seen.add(record.id);
        return true;
      });
    } finally {
      if (activeController === controller) activeController = null;
    }
  }

  return { search };
})();

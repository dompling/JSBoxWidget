function requestFailed(resp) {
  return (
    resp == null || resp.response == null || resp.response.statusCode != 200
  );
}

function cacheRequest(key, res) {
  if (requestFailed(res)) {
    return $cache.get(key);
  }
  $cache.set(key, res);
  return res;
}

module.exports = { requestFailed, cacheRequest };

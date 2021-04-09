function requestFailed(resp) {
  return (
    resp == null ||
    !resp ||
    resp.response == null ||
    resp.response.statusCode != 200 ||
    !$device.networkType
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

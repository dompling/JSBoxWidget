function requestFailed(resp) {
  return (
    resp == null || resp.response == null || resp.response.statusCode != 200
  );
}

module.exports = { requestFailed };

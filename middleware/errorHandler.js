module.exports = (err, req, res, next) => {
  console.error(err);

  const errForClient = {
    // We specify a default status code, this will
    // be overidden if in err further up the chain passes in a status
    errorStatusCode: 500,
    errorMessage: err.message
  };

  if (err.statusCode) {
    errForClient.errorStatusCode = err.statusCode;
  }

  res.json(errForClient);
};

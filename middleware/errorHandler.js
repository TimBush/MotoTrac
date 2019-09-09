module.exports = (err, req, res, next) => {
  console.error(err);

  const errForClient = {
    errorStatus: err.statusCode,
    errorMessage: err.message
  };

  res.json(errForClient);
};

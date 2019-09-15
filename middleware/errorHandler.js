/**
 * This module is meant to be used as the main error handler
 * for routing.  If any errors are caught/thrown upstream
 * this will be the first error-handler that handles them
 * and provides a response to the client
 */

/**
 * Creates a new object with error information
 * and ends the req/res cycle by responding to
 * the client w/ JSON including an error message & status
 */
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

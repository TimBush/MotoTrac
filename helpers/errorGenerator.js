/**
 * This function creates an new Error object with the specified arguments
 * @param {number} errorStatus - The HTTP status code for the given error
 * @param {string} errorMessage - The error message for the given error
 * @returns A new error object
 */

module.exports = (errorStatus, errorMessage) => {
  const newError = new Error(errorMessage);
  newError.statusCode = errorStatus;

  return newError;
};

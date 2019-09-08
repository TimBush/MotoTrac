module.exports = (errorStatus, userMessage) => {

    const errorResponse = {
        errorStatus,
        errorMessage: ''
    }

    if (userMessage) {
        errorResponse.errorStatus = errorStatus
        errorResponse.errorMessage = userMessage

        return errorResponse
    }

    if (errorStatus === 404) {
        errorResponse.errorStatus = errorStatus
        errorResponse.errorMessage = 'The given URL was not found'

        return errorResponse
    }
}
const errorCodes = {
    "BAD_REQUEST": 400,
    "UNAUTHORIZED": 401,
    "ALREADY_EXISTS": 402,
    "FORBIDDEN": 403,
    "UNPROCESSABLE_ENTITY": 422,
    "NOT_FOUND": 404,
    "REQUEST_TIMEOUT": 408,
    "INTERNAL_SERVER_ERROR": 500,
    "NOT_IMPLEMENTED": 501,
    "CONFLICT": 409,
    "NOT_ACCEPTABLE": 406,
};

class ErrorHandler {

    handleError(res, errorObj) {
        let msg = typeof errorObj.message == 'string' ? errorObj.message : 'Internal server error';
        res.status(errorCodes[errorObj.code]).send({ status: 0, message: msg });
    }
}

module.exports = ErrorHandler;

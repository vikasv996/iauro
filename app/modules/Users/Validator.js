const _ = require('lodash');
const { validationResult } = require('express-validator');
const { body, check, query, header, param } = require('express-validator');
const exportLib = require('../../../lib/Exports');

class Validator {

    static registerValidator() {
        try {
            return [
                check('emailId').trim().toLowerCase().exists().withMessage(exportLib.ResponseEn.EMAIL_ID_REQUIRED)
                    .isEmail().withMessage(exportLib.ResponseEn.INVALID_EMAIL),
                check('password').trim()
                    .isLength({ min: 8 }).withMessage(exportLib.ResponseEn.PASSWORD_VALIDATION_LENGTH)
                    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d].*/).withMessage(exportLib.ResponseEn.PASSWORD_VALIDATION)
            ];
        } catch (error) {
            return error;
        }
    }

    static updateUserValidator() {
        try {
            return [
                check('userId').trim().exists().withMessage(exportLib.ResponseEn.USER_ID_REQUIRED)
            ];
        } catch (error) {
            return error;
        }
    }

    static detailValidator() {
        try {
            return [
                param('id').exists({ checkFalsy: true }).withMessage(exportLib.ResponseEn.INVALID_PRODUCT_ID),
                param('id').not().equals('undefined').withMessage(exportLib.ResponseEn.INVALID_PRODUCT_ID),
                param('id').not().equals('null').withMessage(exportLib.ResponseEn.INVALID_PRODUCT_ID),
                param('id').not().isEmpty().withMessage(exportLib.ResponseEn.INVALID_PRODUCT_ID)
            ];
        } catch (error) {
            return error;
        }
    }

    static validate(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return exportLib.Error.handleError(res, { code: 'UNPROCESSABLE_ENTITY', message: errors.errors[0].msg });
            }
            next();
        } catch (error) {
            return exportLib.Error.handleError(res, { status: false, code: 'INTERNAL_SERVER_ERROR', message: error });
        }
    }
}

module.exports = Validator;
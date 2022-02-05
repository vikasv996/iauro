const _ = require('lodash');
const { validationResult } = require('express-validator');
const { body, check, query, header, param } = require('express-validator');
const exportLib = require('../../../lib/Exports');

class Validator {

    static addProductValidator() {
        try {
            return [
                check('name').trim().exists().withMessage(exportLib.ResponseEn.PRODUCT_NAME_REQUIRED)
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
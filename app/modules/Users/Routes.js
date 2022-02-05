const Globals = require("../../services/Globals");
const Validator = require("./Validator");
const Controller = require("./Controller");
module.exports = (app, express) => {

    const router = express.Router();
    const Controller = require('./Controller');
    const Validator = require('./Validator');
    const config = require('../../../configs/configs');
    const Globals = require("../../services/Globals");

    router.post('/register', Validator.registerValidator(), Validator.validate, (req, res, next) => {
        const obj = new Controller().boot(req, res);
        return obj.register();
    });

    router.post('/login', Validator.registerValidator(), Validator.validate, (req, res, next) => {
        const obj = new Controller().boot(req, res);
        return obj.login();
    });

    router.put('/admin/updateUser', Globals.isAuthorised, Validator.updateUserValidator(), Validator.validate, (req, res, next) => {
        const obj = new Controller().boot(req, res);
        return obj.updateUser();
    });

    router.delete('/admin/deleteUser/:id', Globals.isAuthorised, Validator.detailValidator(), Validator.validate, (req, res, next) => {
        const obj = new Controller().boot(req, res);
        return obj.deleteUser();
    });

    app.use(config.baseApiUrl, router);
}
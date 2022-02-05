module.exports = (app, express) => {

    const router = express.Router();
    const Controller = require('./Controller');
    const Validator = require('./Validator');
    const config = require('../../../configs/configs');
    const Globals = require("../../services/Globals");

    router.post('/user/createProduct', Globals.isAuthorised, Validator.addProductValidator(), Validator.validate, (req, res, next) => {
        const obj = new Controller().boot(req, res);
        return obj.createProduct();
    });

    router.put('/admin/updateProduct/:id', Globals.isAuthorised, Validator.detailValidator(), Validator.validate, (req, res, next) => {
        const obj = new Controller().boot(req, res);
        return obj.updateProduct();
    });

    router.get('/listProducts', Globals.isAuthorised, (req, res, next) => {
        const obj = new Controller().boot(req, res);
        return obj.list();
    });

    router.delete('/admin/deleteProduct/:id', Globals.isAuthorised, Validator.detailValidator(), Validator.validate, (req, res, next) => {
        const obj = new Controller().boot(req, res);
        return obj.deleteProduct();
    });

    app.use(config.baseApiUrl, router);
}
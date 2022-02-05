const _ = require("lodash");
const Controller = require("../Base/Controller");
const exportLib = require("../../../lib/Exports");
const { Users } = require("./Schema");
const { Product } = require("../Products/Schema");
const Globals = require("../../services/Globals");
const { AuthTokens } = require("../Authentication/Schema");

class UserController extends Controller {

    constructor() {
        super();
    }

    async register() {
        try {
            let reqBody = this.req.body;

            let user = await Users.findOne({ emailId: reqBody.emailId });
            if (!_.isEmpty(user)) {
                return exportLib.Error.handleError(this.res, {
                    code: 'ALREADY_EXISTS',
                    message: exportLib.ResponseEn.USER_EXIST
                });
            }

            if (reqBody.isSuperAdmin) {
                let userSuperAdmin = await Users.findOne({ isSuperAdmin: true });
                if (!_.isEmpty(userSuperAdmin)) {
                    return exportLib.Error.handleError(this.res, {
                        code: 'ALREADY_EXISTS',
                        message: exportLib.ResponseEn.SUPER_ADMIN_EXISTS
                    });
                }
            }

            let userAdded = await Users.create(reqBody);
            if (_.isEmpty(userAdded)) {
                return exportLib.Error.handleError(this.res, {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: exportLib.ResponseEn.USER_NOT_REGISTERED
                });
            }

            return exportLib.Response.handleResponse(this.res, {
                code: 'SUCCESS',
                data: {
                    userId: userAdded._id
                },
                message: exportLib.ResponseEn.USER_SAVED
            })

        } catch (error) {
            console.log("register-error", error);
            return exportLib.Error.handleError(this.res, {
                code: 'INTERNAL_SERVER_ERROR',
                message: error
            });
        }
    }

    async login() {
        try {
            let reqBody = this.req.body;
            let user = await Users.findOne({ emailId: reqBody.emailId }).lean();
            if (_.isEmpty(user)) {
                return exportLib.Error.handleError(this.res, {
                    code: 'NOT_FOUND',
                    message: exportLib.ResponseEn.USER_NOT_EXIST
                });
            }

            if (reqBody.password !== user.password) {
                return exportLib.Error.handleError(this.res, {
                    code: 'UNAUTHORIZED',
                    message: exportLib.ResponseEn.INVALID_PASSWORD
                });
            }

            let tokenObject = { id: user._id };
            let token = await new Globals().generateToken(tokenObject);

            return exportLib.Response.handleResponse(this.res, {
                code: "SUCCESS",
                message: exportLib.ResponseEn.LOGIN_SUCCESS,
                data: {
                    accessToken: token,
                    isSuperAdmin: user.isSuperAdmin
                }
            })
        } catch (error) {
            console.log("login-error", error);
            return exportLib.Error.handleError(this.res, {
                code: 'INTERNAL_SERVER_ERROR',
                message: error
            });
        }
    }

    async updateUser() {
        try {
            let currentUser = this.req.currentUser;
            let data = this.req.body;
            if (!currentUser.isSuperAdmin) {
                return exportLib.Error.handleError(this.res, {
                    code: 'FORBIDDEN',
                    message: exportLib.ResponseEn.UPDATE_USER_FAILED
                });
            }

            if (!(data.emailId || data.password)) {
                return exportLib.Error.handleError(this.res, {
                    code: 'BAD_REQUEST',
                    message: exportLib.ResponseEn.CANNOT_UPDATE_USER
                });
            }

            let userPresent = await Users.findById(data.userId).lean();
            if (_.isEmpty(userPresent)) {
                return exportLib.Error.handleError(this.res, {
                    code: 'NOT_FOUND',
                    message: exportLib.ResponseEn.USER_NOT_EXIST
                });
            }

            if (data.emailId === currentUser.emailId) {
                return exportLib.Error.handleError(this.res, {
                    code: 'NOT_ACCEPTABLE',
                    message: exportLib.ResponseEn.CANNOT_UPDATE_EMAIL
                });
            }

            if (data.emailId) {
                let user = await Users.findOne({ emailId: data.emailId, _id: { $ne: data.userId } } );
                if (!_.isEmpty(user)) {
                    return exportLib.Error.handleError(this.res, {
                        code: 'ALREADY_EXISTS',
                        message: exportLib.ResponseEn.USER_EXIST
                    });
                }
            }

            let updateUser = await Users.findByIdAndUpdate(data.userId, { $set: data });
            if (_.isEmpty(updateUser)) {
                return exportLib.Error.handleError(this.res, {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: exportLib.ResponseEn.USER_NOT_UPDATED
                });
            }

            exportLib.Response.handleResponse(this.res, {
                code: 'SUCCESS',
                message: exportLib.ResponseEn.USER_UPDATED
            })

            await AuthTokens.updateMany({ userId: data.userId }, { $set: { token: null } });
        } catch (error) {
            console.log("updateUser-error", error);
            return exportLib.Error.handleError(this.res, {
                code: 'INTERNAL_SERVER_ERROR',
                message: error
            });
        }
    }

    async deleteUser() {
        try {
            let currentUser = this.req.currentUser;
            let reqParams = this.req.params;
            if (!currentUser.isSuperAdmin) {
                return exportLib.Error.handleError(this.res, {
                    code: 'FORBIDDEN',
                    message: exportLib.ResponseEn.UPDATE_USER_FAILED
                });
            }

            let userPresent = await Users.findById(reqParams.id).lean();
            if (_.isEmpty(userPresent)) {
                return exportLib.Error.handleError(this.res, {
                    code: 'NOT_FOUND',
                    message: exportLib.ResponseEn.USER_NOT_EXIST
                });
            }

            let userDeleted = await Users.deleteById(reqParams.id);
            if (_.isEmpty(userDeleted)) {
                return exportLib.Error.handleError(this.res, {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: exportLib.ResponseEn.USER_NOT_DELETED
                });
            }

            exportLib.Response.handleResponse(this.res, {
                code: 'SUCCESS',
                message: exportLib.ResponseEn.USER_DELETED
            })

            await AuthTokens.deleteMany({ userId: reqParams.id });
            await Product.delete({ addedBy: reqParams.id });

        } catch (error) {
            console.log("deleteUsers-error", error);
            return exportLib.Error.handleError(this.res, {
                code: 'INTERNAL_SERVER_ERROR',
                message: error
            });
        }
    }

}

module.exports = UserController;
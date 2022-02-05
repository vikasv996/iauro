const _ = require("lodash");
const Controller = require("../Base/Controller");
const exportLib = require("../../../lib/Exports");
const { Users, Product } = require("./Schema");
const Globals = require("../../services/Globals");

class ProductController extends Controller {

    constructor() {
        super();
    }

    /**
     * User can add a product using this endpoint
     * @returns product
     */
    async createProduct() {
        try {
            let currentUser = this.req.currentUser;
            let data = this.req.body;

            if (currentUser.isSuperAdmin) {
                return exportLib.Error.handleError(this.res, {
                    code: 'FORBIDDEN',
                    message: exportLib.ResponseEn.SUPER_ADMIN_ADD_PRODUCT_ERROR
                });
            }

            data.addedBy = currentUser._id;

            let productPresent = await Product.findOne({ name: { $regex: `^${data.name}$`, $options: 'i' } } );
            if (!_.isEmpty(productPresent)) {
                return exportLib.Error.handleError(this.res, {
                    code: 'ALREADY_EXISTS',
                    message: exportLib.ResponseEn.PRODUCT_EXIST
                });
            }

            let product = await Product.create(data);
            if (_.isEmpty(product)) {
                return exportLib.Error.handleError(this.res, {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: exportLib.ResponseEn.PRODUCT_NOT_ADDED
                });
            }

            return exportLib.Response.handleResponse(this.res, {
                code: 'SUCCESS',
                data: { product },
                message: exportLib.ResponseEn.PRODUCT_SAVED
            })
        } catch (error) {
            console.log("createProduct-error", error);
            return exportLib.Error.handleError(this.res, {
                status: false,
                code: 'INTERNAL_SERVER_ERROR',
                message: error
            });
        }
    }

    /**
     * Super admin can update product details using this endpoint
     * @returns product
     */
    async updateProduct() {
        try {
            let currentUser = this.req.currentUser;
            let data = this.req.body;
            let reqParams = this.req.params;

            if (!currentUser.isSuperAdmin) {
                return exportLib.Error.handleError(this.res, {
                    code: 'FORBIDDEN',
                    message: exportLib.ResponseEn.USER_UPDATE_PRODUCT_ERROR
                });
            }

            if (!(data.name || data.status !== null)) {
                return exportLib.Error.handleError(this.res, {
                    code: 'BAD_REQUEST',
                    message: exportLib.ResponseEn.CANNOT_UPDATE_PRODUCT
                });
            }

            if (data.name) {
                let productPresent = await Product.findOne({ name: { $regex: `^${data.name}$`, $options: 'i' }, _id: { $ne: reqParams.id } } );
                if (!_.isEmpty(productPresent)) {
                    return exportLib.Error.handleError(this.res, {
                        code: 'ALREADY_EXISTS',
                        message: exportLib.ResponseEn.PRODUCT_EXIST
                    });
                }
            }

            if (data.status && !_.isBoolean(data.status)) {
                return exportLib.Error.handleError(this.res, {
                    code: 'BAD_REQUEST',
                    message: exportLib.ResponseEn.PRODUCT_STATUS_NOT_BOOLEAN
                });
            }

            let updated = await Product.findByIdAndUpdate(reqParams.id, { $set: data });
            console.log("updated")
            console.log(updated)
            if (_.isEmpty(updated)) {
                return exportLib.Error.handleError(this.res, {
                    code: 'FORBIDDEN',
                    message: exportLib.ResponseEn.PRODUCT_NOT_UPDATED
                });
            }

            return exportLib.Response.handleResponse(this.res, {
                code: 'SUCCESS',
                message: exportLib.ResponseEn.PRODUCT_UPDATED
            })

        } catch (error) {
            console.log("updateProduct-error", error);
            return exportLib.Error.handleError(this.res, {
                status: false,
                code: 'INTERNAL_SERVER_ERROR',
                message: error
            });
        }
    }

    async list() {
        try {
            let reqQuery = this.req.query;
            reqQuery.page = reqQuery.page && parseInt(reqQuery.page) > 0 ? parseInt(reqQuery.page) : 1;
            let perPage = reqQuery.perPage && parseInt(reqQuery.perPage) > 0 ? parseInt(reqQuery.perPage) : 10;
            let skip = (reqQuery.page - 1) * (perPage);
            let sortBy = { name: 1 };

            let filter = { status: true };
            let projection = 'name createdAt';
            let result = await Product.find(filter).sort(sortBy).skip(skip).limit(perPage).select(projection).lean();
            let totalCount = await Product.count(filter);

            return exportLib.Response.handleListingResponse(this.res, {
                code: 'SUCCESS',
                data: result,
                page: reqQuery.page,
                perPage,
                total: totalCount
            })

        } catch (error) {
            console.log("listProducts-error", error);
            return exportLib.Error.handleError(this.res, {
                status: false,
                code: 'INTERNAL_SERVER_ERROR',
                message: error
            });
        }
    }

    async deleteProduct() {
        try {
            let currentUser = this.req.currentUser;
            let reqParams = this.req.params;
            if (!currentUser.isSuperAdmin) {
                return exportLib.Error.handleError(this.res, {
                    code: 'FORBIDDEN',
                    message: exportLib.ResponseEn.USER_UPDATE_PRODUCT_ERROR
                });
            }

            let productExist = await Product.findById(reqParams.id).select('_id').lean();
            if (_.isEmpty(productExist)) {
                return exportLib.Error.handleError(this.res, {
                    code: 'NOT_FOUND',
                    message: exportLib.ResponseEn.PRODUCT_NOT_FOUND
                });
            }

            await Product.deleteById(reqParams.id);
            return exportLib.Response.handleResponse(this.res, {
                code: 'SUCCESS',
                message: exportLib.ResponseEn.PRODUCT_DELETED
            })

        } catch (error) {
            console.log("deleteProduct-error", error);
            return exportLib.Error.handleError(this.res, {
                status: false,
                code: 'INTERNAL_SERVER_ERROR',
                message: error
            });
        }
    }

}

module.exports = ProductController;

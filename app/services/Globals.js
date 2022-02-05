/****************************
 SECURITY TOKEN HANDLING
 ****************************/
const _ = require('lodash');
let jwt = require('jsonwebtoken')
const config = require('../../configs/configs');
const { AuthTokens } = require('../modules/Authentication/Schema');
const { Users } = require('../modules/Users/Schema');
const exportLib = require('../../lib/Exports');

class Globals {

    generateToken(params) {
        return new Promise(async (resolve, reject) => {
            try {
                let expiryTime = 361440 // 1 day
                let token = jwt.sign({
                    id: params.id,
                    algorithm: "HS256",
                    exp: Math.floor(Date.now() / 1000) + expiryTime
                }, config.access_token_secret);

                params.token = token;
                params.userId = params.id;
                const auth = await AuthTokens.findOne({ userId: params.id }).select('_id').lean();
                delete params.id;
                if (_.isEmpty(auth)) {
                    await AuthTokens.create(params);
                } else {
                    await AuthTokens.findByIdAndUpdate(auth._id, { $set: params });
                }

                return resolve(token);
            } catch (err) {
                console.log("Get token", err);
                return reject({ message: err, status: 0 });
            }
        });
    }

    static async isAuthorised(req, res, next) {
        try {
            const token = req.headers.authorization;
            if (!token)
                return exportLib.Error.handleError(res, {
                    code: 'UNAUTHORIZED',
                    message: exportLib.ResponseEn.TOKEN_WITH_API
                })

            const authenticate = new Globals();

            const tokenCheck = await authenticate.checkTokenInDB(token);
            if (!tokenCheck)
                return exportLib.Error.handleError(res, {
                    code: 'UNAUTHORIZED',
                    message: exportLib.ResponseEn.INVALID_TOKEN
                })

            const userExist = await authenticate.checkUserInDB(token);
            if (!userExist)
                return exportLib.Error.handleError(res, {
                    code: 'UNAUTHORIZED',
                    message: exportLib.ResponseEn.USER_NOT_EXIST
                })

            req.currentUser = userExist;
            next();
        } catch (err) {
            console.log("Token authentication", err);
            return res.send({ status: 0, message: err });
        }
    }

    checkTokenInDB(token) {
        return new Promise(async (resolve, reject) => {
            try {
                let decoded = jwt.verify(token, config.access_token_secret, { ignoreExpiration: true });
                if (_.isEmpty(decoded)) {
                    return resolve(false);
                }
                const authenticate = await AuthTokens.findOne({ token });
                if (authenticate) return resolve(true);
                return resolve(false);
            } catch (err) {
                return resolve({ message: err, status: 0 });
            }
        })
    }

    checkUserInDB(token) {
        return new Promise(async (resolve, reject) => {
            try {
                // Initialisation of variables
                let decoded = jwt.decode(token);
                if (!decoded) { return resolve(false); }
                let userId = decoded.id

                const user = await Users.findById(userId);
                if (user) return resolve(user);
                return resolve(false);

            } catch (err) {
                console.log("Check user in db")
                return reject({ message: err, status: 0 });
            }

        })
    }

}

module.exports = Globals;

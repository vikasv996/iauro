let Schema = require('mongoose').Schema;
let mongoose = require('mongoose');

let userAuthentication = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Users' },
    token: { type: String }
}, {
    timestamps: true
});

let AuthTokens = mongoose.model('authentication', userAuthentication);

module.exports = {
    AuthTokens
}

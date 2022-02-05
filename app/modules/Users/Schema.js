let mongoose = require('mongoose');
let mongoose_delete = require('mongoose-delete');
let { Schema } = mongoose;

let userSchema = new Schema({
    emailId: { type: String, default: '' },
    password: { type: String, default: '' },
    isSuperAdmin: { type: Boolean, default: false }
}, {
    timestamps: true
});


userSchema.plugin(mongoose_delete, { deletedAt: true, validateBeforeDelete: false, indexFields: ['deleted'], overrideMethods: true });

let Users = mongoose.model('users', userSchema);

module.exports = {
    Users
}

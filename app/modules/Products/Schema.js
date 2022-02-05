let mongoose = require('mongoose');
let mongoose_delete = require('mongoose-delete');
let { Schema } = mongoose;

let productSchema = new Schema({
    name: { type: String, default: '' },
    status: { type: Boolean, default: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'Users' }
}, {
    timestamps: true
});


productSchema.plugin(mongoose_delete, { deletedAt: true, validateBeforeDelete: false, indexFields: ['deleted'], overrideMethods: true });

let Product = mongoose.model('products', productSchema);

module.exports = {
    Product
}

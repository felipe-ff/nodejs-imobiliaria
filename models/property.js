
const mongoose = require('mongoose');
//import mongoosePaginate from 'mongoose-paginate';
//import DeleteEntityError from '../errors/httpErrors';

const propertySchema = new mongoose.Schema({
  dorm: Number,
  bathroom: Number,
  garage: Number,
  kitchen: Number,
  livingRoom: Number,
  price: Number,
  purpose: String,
  type: Number,
  city: String,
  district: String,
  imageUrl: [String]
}
//, { timestamps: true }
);

//deviceSchema.plugin(mongoosePaginate);

/* deviceSchema.pre('remove', function save(next) {
  const device = this;
  Gateway.update(
    {},
    { $pull: { devices: { _device: device._id } } },
    { multi: true },
  )
    .then(() => next())
    .catch(() => next(new DeleteEntityError()));
}); */

module.exports = {
  propertySchema: mongoose.model('Property', propertySchema),
};

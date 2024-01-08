import { Schema, model } from 'mongoose'
import { uniqueValidator } from 'mongoose-unique-validator'

const schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 5,
  },
  phone: {
    type: String,
    minlength: 10,
  },
  street: {
    type: String,
    required: true,
    minlength: 5,
  },
  city: {
    type: String,
    required: true,
    minlength: 5,
  },
})

// better error messages for unique validation
schema.plugin(uniqueValidator)

export default model('Person', schema)

// type Person {
//     name: String!
//     phone: String
//     id: ID!
//     address: Address!
// }

// type Address {
//     street: String!
//     city: String!
// }

import { Schema, model } from 'mongoose'

const schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  friendList: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Person',
    },
  ],
  token: String,
})

export default model('User', schema)

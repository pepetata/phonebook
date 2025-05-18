const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
console.log('connecting to', url)
mongoose.set('strictQuery', false)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'Name must be at least 3 characters long'],
    required: [true, 'Name is required'],
    unique: [true, 'Name must be unique'],
  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        // Regular expression to match the valid formats
        return /^(0[1-9]-\d{7}|0\d{2}-\d{8})$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number. Valid formats are: 09-1234556 or 040-22334455`
    }
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Person', personSchema)
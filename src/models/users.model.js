const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    minLength: 5,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
})

const saltRounds = 10
userSchema.pre('save', function (next) {
  let user = this
  if (user.isModified('password')) {
    // 비밀번호가 변경될 때만
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) return next(err)
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return next(err)
        user.password = hash
        next()
      })
    })
  }
})

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err)
    cb(null, isMatch)
  })
}

const User = mongoose.model('User', userSchema)

module.exports = User

const express = require('express')
const usersRouter = express.Router()
const { checkAuthenticated, checkNotAuthenticated } = require('../middleware/auth')
const passport = require('passport')
const User = require('../models/users.model')

usersRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err)
    if (!user) return res.json({ msg: info })
    req.login(user, (err) => {
      if (err) return next(err)
      res.redirect('/products')
    })
  })(req, res, next)
})

usersRouter.post('/logout', (req, res, next) => {
  req.logOut(function (err) {
    if (err) return next(err)
    res.redirect('/login')
  })
})

usersRouter.post('/signup', async (req, res) => {
  // user 객체 생성
  const user = new User(req.body)
  try {
    await user.save()
    res.redirect('/login')
  } catch (error) {
    console.error(error)
  }
})

module.exports = usersRouter

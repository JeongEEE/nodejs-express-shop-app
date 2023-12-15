const express = require('express')
const { default: mongoose } = require('mongoose')
const { join } = require('path')
const User = require('./models/users.model')
const passport = require('passport')
const app = express()
require('dotenv').config()
const cookieSession = require('cookie-session')
const { checkAuthenticated, checkNotAuthenticated } = require('./middlewares/auth')

const cookieEncryptionKey = process.env.COOKIE_ENCRYPTION_KEY
app.use(
  cookieSession({
    name: 'cookie-session-name',
    keys: [cookieEncryptionKey],
  }),
)

app.use((request, response, next) => {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb()
    }
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb()
    }
  }
  next()
})

app.use(passport.initialize())
app.use(passport.session())
require('./config/passport')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// view engine setup
app.set('views', join(__dirname, 'views'))
app.set('view engine', 'ejs')

mongoose.set('strictQuery', false)
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('MongoDB Connected!')
  })
  .catch((err) => {
    console.log(err)
  })

app.use('/static', express.static(join(__dirname, 'public')))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index')
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login')
})

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err)
    if (!user) return res.json({ msg: info })
    req.login(user, (err) => {
      if (err) return next(err)
      res.redirect('/')
    })
  })(req, res, next)
})

app.post('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) return next(err)
    res.redirect('/login')
  })
})

app.get('/signup', checkNotAuthenticated, (req, res) => {
  res.render('signup')
})

app.post('/signup', async (req, res) => {
  // user 객체 생성
  const user = new User(req.body)
  try {
    await user.save()
    return res.status(200).json({
      success: true,
    })
  } catch (error) {
    console.error(error)
  }
})

const port = 4000
app.listen(port, () => {
  console.log('Server Start - Port =', port)
})

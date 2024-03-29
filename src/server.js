const express = require('express')
const { default: mongoose } = require('mongoose')
const { join } = require('path')
const User = require('./models/users.model')
const passport = require('passport')
const app = express()
require('dotenv').config()
const cookieSession = require('cookie-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const fileUpload = require('express-fileupload')
const config = require('config')
const serverConfig = config.get('server')
const mainRouter = require('./routes/main.router')
const usersRouter = require('./routes/users.router')
const productsRouter = require('./routes/products.router')
const cartRouter = require('./routes/cart.router')
const adminCategoryRouter = require('./routes/admin-categories.router')
const adminProductsRouter = require('./routes/admin-products.router')
const port = 4000

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

app.use(flash())
app.use(methodOverride('_method'))
app.use(fileUpload())

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

app.use(express.static(join(__dirname, 'public')))

app.use((req, res, next) => {
  res.locals.cart = req.session.cart
  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')
  res.locals.currentUser = req.user
  next()
})

app.use('/', mainRouter)
app.use('/auth', usersRouter)
app.use('/admin/categories', adminCategoryRouter)
app.use('/admin/products', adminProductsRouter)
app.use('/products', productsRouter)
app.use('/cart', cartRouter)

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send(err.message || '에러가 났습니다.')
})

app.listen(port, () => {
  console.log('Server Start - Port =', port)
})

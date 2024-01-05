const express = require('express')
const { default: mongoose } = require('mongoose')
const { join } = require('path')
const User = require('./models/users.model')
const passport = require('passport')
const app = express()
require('dotenv').config()
const cookieSession = require('cookie-session')
const config = require('config')
const serverConfig = config.get('server')
const mainRouter = require('./routes/main.router')
const usersRouter = require('./routes/users.router')
const productsRouter = require('./routes/products.router')
const cartRouter = require('./routes/cart.router')
const adminCategoryRouter = require('./routes/admin-categories.router')
const adminProductsRouter = require('./routes/admin-products.router')

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

app.use('/', mainRouter)
app.use('/auth', usersRouter)
app.use('/admin/categories', adminCategoryRouter)
app.use('/admin/products', adminProductsRouter)
app.use('/products', productsRouter)
app.use('/cart', cartRouter)

const port = 4000
app.listen(port, () => {
  console.log('Server Start - Port =', port)
})

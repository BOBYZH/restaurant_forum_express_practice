const express = require('express')
const handlebars = require('express-handlebars')
// const bodyParser = require('body-parser')
const db = require('./models')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')
const methodOverride = require('method-override')

const app = express()
const port = process.env.PORT || 3000

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

app.engine('handlebars', handlebars({
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers')
}))
app.set('view engine', 'handlebars')

// app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.urlencoded({ extended: true }))

app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user
  next()
})

app.use(methodOverride('_method'))

app.use('/upload', express.static(__dirname + '/upload'))

app.listen(port, () => {
  console.log(`Example app is listening on port ${port}!`)
  console.log('Enter http://localhost:3000/ if you run this app on your local computer.')
})

// 路由用到的都要寫在後面括號，因為路由分了兩層，所以 index.js 不需要用到 passport 了
require('./routes')(app)

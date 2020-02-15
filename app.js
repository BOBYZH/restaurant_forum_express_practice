const express = require('express')
const handlebars = require('express-handlebars')
// const bodyParser = require('body-parser')
const db = require('./models')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')

const app = express()
const port = 3000

app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
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
  next()
})

app.listen(port, () => {
  console.log(`Example app is listening on port ${port}!`)
})

// 路由用到的都要寫在後面括號
require('./routes')(app, passport)

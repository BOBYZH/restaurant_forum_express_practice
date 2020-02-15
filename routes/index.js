const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
// test
const db = require('../models')
const Test = db.Test

module.exports = app => {
  app.get('/', (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', restController.getRestaurants)
  app.get('/admin', (req, res) => res.redirect('/admin/restaurants'))
  app.get('/admin/restaurants', adminController.getRestaurants)
  // test
  app.get('/test', (req, res) => {
    Test.findAll().then(tests => {
      console.log(tests)
    })
  })
}

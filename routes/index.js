const routes = require('./routes')
const apis = require('./apis')

const restController = require('../controllers/restController.js')

module.exports = (app) => {
  app.use('/', routes)
  app.use('/api', apis)
  app.all('*', restController.redirectInvalidUrl)
}

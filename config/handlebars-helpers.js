const moment = require('moment')

module.exports = {
  moment: function (a) {
    return moment(a).fromNow()
  },

  ifCond: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    return options.inverse(this)
  }
}

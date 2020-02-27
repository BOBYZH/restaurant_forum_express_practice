const restService = require('../services/restService.js')

const restController = {
  redirectInvalidUrl: (req, res) => { // 防止亂打網址
    // req.flash('error_messages', "this page didn't exist!") // 有時會莫名出現...
    res.redirect('back')
  },

  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, (data) => {
      if (data.length === 0) { // 沒功能？
        req.flash('error_messages', "this category didn't exist!")
        res.redirect('/restaurants')
      } else {
        return res.render('restaurants', JSON.parse(JSON.stringify(data)))
      }
    })
  },

  getRestaurant: (req, res) => {
    restService.getRestaurant(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        res.redirect('/restaurants')
      } else {
        return res.render('restaurant', JSON.parse(JSON.stringify(data)))
      }
    })
  },

  getFeeds: (req, res) => { // 前十新的餐廳與評論
    restService.getFeeds(req, res, (data) => {
      return res.render('feeds', JSON.parse(JSON.stringify(data)))
    })
  },

  getDashboard: (req, res) => {
    restService.getDashboard(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        res.redirect('/restaurants')
      } else {
        return res.render('dashboard', JSON.parse(JSON.stringify(data)))
      }
    })
  },

  getTopRestaurants: (req, res) => {
    restService.getTopRestaurants(req, res, (data) => {
      return res.render('topRestaurants', JSON.parse(JSON.stringify(data)))
    })
  }
}
module.exports = restController

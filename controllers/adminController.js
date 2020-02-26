const adminService = require('../services/adminService.js')
const db = require('../models')
const Category = db.Category
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', JSON.parse(JSON.stringify(data)))
    })
  },

  createRestaurant: (req, res) => {
    // 查詢並傳入類別資料
    Category.findAll().then(categories => {
      return res.render('admin/create', JSON.parse(JSON.stringify({
        categories: categories
      })))
    })
  },

  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
      req.flash('success_messages', data.message)
      res.redirect('/admin/restaurants')
    })
  },

  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      console.log('test', data)
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        res.redirect('/admin/restaurants')
      } else {
        req.flash('success_messages', data.message)
        return res.render('admin/restaurant', JSON.parse(JSON.stringify(data)))
      }
    })
  },

  editRestaurant: (req, res) => {
    Category.findAll().then(categories => {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        if (!restaurant) {
          req.flash('error_messages', "restaurant didn't exist")
          res.redirect('/admin/restaurants')
        } else {
          return res.render('admin/create', JSON.parse(JSON.stringify({
            categories: categories,
            restaurant: restaurant
          })))
        }
      })
    })
  },

  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
      req.flash('success_messages', data.message)
      res.redirect('/admin/restaurants')
    })
  },

  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data.status === 'success') { // API成功刪除資料
        return res.redirect('/admin/restaurants')
      }
    })
  },

  getUsers: (req, res) => {
    adminService.getUsers(req, res, (data) => {
      return res.render('admin/users', JSON.parse(JSON.stringify(data)))
    })
  },

  putUsers: (req, res) => {
    adminService.putUsers(req, res, (data) => {
      req.flash('success_messages', data.message)
      return res.redirect('/admin/users')
    })
  }
}
module.exports = adminController

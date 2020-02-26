const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = require('../services/adminService.js')
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
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },

  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/restaurant', JSON.parse(JSON.stringify(data)))
    })
  },

  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      Category.findAll().then(categories => {
        return res.render('admin/create', JSON.parse(JSON.stringify({
          categories: categories,
          restaurant: restaurant
        })))
      })
    })
  },

  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },

  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data['status'] === 'success') { // API成功刪除資料
        return res.redirect('/admin/restaurants')
      }
    })
  },

  getUsers: (req, res) => {
    return User.findAll().then(users => {
      return res.render(
        'admin/users',
        JSON.parse(JSON.stringify({ users: users }))
      )
    })
  },

  putUsers: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      user.update({
        isAdmin: !user.isAdmin
      })
        .then(user => {
          let status = ''
          if (user.isAdmin) {
            status = 'admin'
          } else {
            status = 'user'
          }
          req.flash(
            'success_messages',
            // 'The admin status was successfully to update'
            `The role of account "${user.email}" is "${status}" now!`
          )
          res.redirect('/admin/users')
        })
    })
  }
}
module.exports = adminController

const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ include: [Category] }).then(restaurants => { // include用於載入其他資料表
      // console.log(restaurants) // 顯示資料結構用
      callback({ restaurants: restaurants })
    })
  },
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] }).then(restaurant => {
      if (restaurant === null) {
        return callback({ status: 'error', message: "restaurant didn't exist" })
      } else {
        return callback({ restaurant: restaurant })
      }
    })
  },
  postRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
    }
    const { file } = req // equal to const file = req.file
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        }).then((restaurant) => {
          callback({ status: 'success', message: 'restaurant was successfully created' })
        })
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        CategoryId: req.body.categoryId
      })
        .then((restaurant) => {
          callback({ status: 'success', message: 'restaurant was successfully created' })
        })
    }
  },
  putRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            if (!restaurant) {
              return callback({ status: 'error', message: "restaurant didn't exist" })
            } else {
              restaurant.update({
                name: req.body.name,
                tel: req.body.tel,
                address: req.body.address,
                opening_hours: req.body.opening_hours,
                description: req.body.description,
                image: file ? img.data.link : restaurant.image,
                CategoryId: req.body.categoryId
              }).then((restaurant) => {
                return callback({ status: 'success', message: 'restaurant was successfully to update' })
              })
            }
          })
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          if (!restaurant) {
            return callback({ status: 'error', message: "restaurant didn't exist" })
          } else {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: restaurant.image,
              CategoryId: req.body.categoryId
            }).then((restaurant) => {
              callback({ status: 'success', message: 'restaurant was successfully to update' })
            })
          }
        })
    }
  },
  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        if (restaurant === null) {
          return callback({ status: 'error', message: "restaurant didn't exist" })
        } else {
          restaurant.destroy()
            .then((restaurant) => {
              callback({ status: 'success', message: '' })
            })
        }
      })
  },
  getUsers: (req, res, callback) => {
    return User.findAll().then(users => {
      callback({ users: users })
    })
  },
  putUsers: (req, res, callback) => {
    return User.findByPk(req.params.id)
      .then((user) => {
        user.update({
          // isAdmin: req.body.isAdmin === 'true'
          isAdmin: !user.isAdmin // 由於新版只能刪除管理員權限，故改回舊版，不懂新版程式碼的功能？
        })
          .then((restaurant) => {
            let status = ''
            if (user.isAdmin) {
              status = 'admin'
            } else {
              status = 'user'
            }
            callback({
              status: 'success',
              // message: 'user was successfully to update'
              message: `The role of ${user.name} is "${status}" now!`
            })
          })
      })
  }
}
module.exports = adminService

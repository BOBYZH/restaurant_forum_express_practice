const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll().then(restaurants => {
      return res.render('admin/restaurants', JSON.parse(JSON.stringify({ restaurants: restaurants })))
    })
  },

  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },

  // 本地上傳圖片
  // postRestaurant: (req, res) => {
  //   if (!req.body.name) {
  //     req.flash('error_messages', "name didn't exist")
  //     return res.redirect('back')
  //   }

  //   const { file } = req // equal to const file = req.file
  //   if (file) {
  //     fs.readFile(file.path, (err, data) => {
  //       if (err) console.log('Error: ', err)
  //       fs.writeFile(`upload/${file.originalname}`, data, () => {
  //         return Restaurant.create({
  //           name: req.body.name,
  //           tel: req.body.tel,
  //           address: req.body.address,
  //           opening_hours: req.body.opening_hours,
  //           description: req.body.description,
  //           image: file ? `/upload/${file.originalname}` : null
  //         }).then((restaurant) => {
  //           req.flash('success_messages', 'restaurant was successfully created')
  //           return res.redirect('/admin/restaurants')
  //         })
  //       })
  //     })
  //   } else {
  //     return Restaurant.create({
  //       name: req.body.name,
  //       tel: req.body.tel,
  //       address: req.body.address,
  //       opening_hours: req.body.opening_hours,
  //       description: req.body.description,
  //       image: null
  //     }).then((restaurant) => {
  //       req.flash('success_messages', 'restaurant was successfully created')
  //       return res.redirect('/admin/restaurants')
  //     })
  //   }
  // },

  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null
        }).then((restaurant) => {
          req.flash('success_messages', 'restaurant was successfully created')
          return res.redirect('/admin/restaurants')
        })
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null
      }).then((restaurant) => {
        req.flash('success_messages', 'restaurant was successfully created')
        return res.redirect('/admin/restaurants')
      })
    }
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      return res.render('admin/restaurant', JSON.parse(JSON.stringify({ restaurant: restaurant })))
    })
  },

  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      return res.render('admin/create', JSON.parse(JSON.stringify({ restaurant: restaurant })))
    })
  },

  // 本地上傳圖片
  // putRestaurant: (req, res) => {
  //   if (!req.body.name) {
  //     req.flash('error_messages', "name didn't exist")
  //     return res.redirect('back')
  //   }

  //   const { file } = req
  //   if (file) {
  //     fs.readFile(file.path, (err, data) => {
  //       if (err) console.log('Error: ', err)
  //       fs.writeFile(`upload/${file.originalname}`, data, () => {
  //         return Restaurant.findByPk(req.params.id)
  //           .then((restaurant) => {
  //             restaurant.update({
  //               name: req.body.name,
  //               tel: req.body.tel,
  //               address: req.body.address,
  //               opening_hours: req.body.opening_hours,
  //               description: req.body.description,
  //               image: file ? `/upload/${file.originalname}` : restaurant.image
  //             }).then((restaurant) => {
  //               req.flash('success_messages', 'restaurant was successfully to update')
  //               res.redirect('/admin/restaurants')
  //             })
  //           })
  //       })
  //     })
  //   } else {
  //     return Restaurant.findByPk(req.params.id)
  //       .then((restaurant) => {
  //         restaurant.update({
  //           name: req.body.name,
  //           tel: req.body.tel,
  //           address: req.body.address,
  //           opening_hours: req.body.opening_hours,
  //           description: req.body.description,
  //           image: restaurant.image
  //         }).then((restaurant) => {
  //           req.flash('success_messages', 'restaurant was successfully to update')
  //           res.redirect('/admin/restaurants')
  //         })
  //       })
  //   }
  // },

  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image
            })
              .then((restaurant) => {
                req.flash('success_messages', 'restaurant was successfully to update')
                res.redirect('/admin/restaurants')
              })
          })
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image
          })
            .then((restaurant) => {
              req.flash('success_messages', 'restaurant was successfully to update')
              res.redirect('/admin/restaurants')
            })
        })
    }
  },

  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            res.redirect('/admin/restaurants')
          })
      })
  }
}
module.exports = adminController

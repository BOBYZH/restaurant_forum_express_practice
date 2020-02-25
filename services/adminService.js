const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ include: [Category] }).then(restaurants => { // include用於載入其他資料表
      // console.log(restaurants) // 顯示資料結構用
      callback({ restaurants: restaurants })
    })
  }
}
module.exports = adminService

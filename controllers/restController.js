const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const restController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll({ include: Category }).then(restaurants => {
      const data = restaurants.map(r => ({
        /* 原本寫法：
          r.description = r.description.substring(0, 50)
          return r
        底下改用展開運算子 (spread operator) */
        ...r.dataValues, // 想用展開整個實例物件時，如果直接展開第一層是不對的，需要展開的是第二層 dataValues
        description: r.dataValues.description.substring(0, 50)
      }))
      return res.render('restaurants', {
        restaurants: data
      })
    })
  }
}
module.exports = restController

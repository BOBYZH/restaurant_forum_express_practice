const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const restController = {
  getRestaurants: (req, res) => {
    const whereQuery = {}
    let categoryId = ''
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }
    Restaurant.findAll(({ include: Category, where: whereQuery })).then(restaurants => {
      const data = restaurants.map(r => ({
        /* 原本寫法：
          r.description = r.description.substring(0, 50)
          return r
        底下改用展開運算子 (spread operator) */
        ...r.dataValues, // 想用展開整個實例物件時，如果直接展開第一層是不對的，需要展開的是第二層 dataValues
        description: r.dataValues.description.substring(0, 50)
      }))
      Category.findAll().then(categories => { // 取出 categories
        return res.render('restaurants', JSON.parse(JSON.stringify({
          restaurants: data,
          categories: categories,
          categoryId: categoryId
        })))
      })
    })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category
    }).then(restaurant => {
      return res.render('restaurant', JSON.parse(JSON.stringify({
        restaurant: restaurant
      })))
    })
  }
}
module.exports = restController

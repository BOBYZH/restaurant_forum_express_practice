const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    let offset = 0
    const whereQuery = {}
    let categoryId = ''
    // 網頁上沒有帶任何參數時(通常就是第一次進入首頁時) ，req.query.page 會回傳 undefined，所以要確定有參數時才開始運算
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.categoryId = categoryId
    }
    Restaurant.findAndCountAll(({ include: Category, where: whereQuery, offset: offset, limit: pageLimit }))
      .then(result => {
        const page = Number(req.query.page) || 1 // 當前頁數，預設在第一頁
        const pages = Math.ceil(result.count / pageLimit) // 總共頁數
        // 運用 Array.from({length: pages}) 做出長度符合的陣列，然後再用 map 把真正的數字帶進去
        const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
        //  handlebars裡面沒辦法放表達式，因此數字要盡量在後端整理好，再傳給 view 去顯示，這裡用三元運算子讓邏輯保持在一行以內
        // 問號前：條件；冒號前後：肯定與否定的結果
        const prev = page - 1 < 1 ? 1 : page - 1
        const next = page + 1 > pages ? pages : page + 1
        const data = result.rows.map(r => ({
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
            categoryId: categoryId,
            page: page,
            totalPage: totalPage,
            prev: prev,
            next: next
          })))
        })
      })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      // include: [Category, Comment] // 不全版
      include: [
        Category,
        { model: Comment, include: [User] } // 預先加載( eager loading)載入不同資料來源的寫法
      ]
    })
      // .then(console.log(restaurant.Comments[0].dataValues))
      // .then(
      //   console.log(restaurant.Comments[0].dataValues))
      .then(restaurant => {
        // res.render('restaurant', JSON.parse(JSON.stringify({
        //   restaurant: restaurant
        // })))
        // return console.log(restaurant.Comments[0].dataValues)

        return res.render('restaurant', JSON.parse(JSON.stringify({
          restaurant: restaurant
        })))
      })
  },

  getFeeds: (req, res) => { // 前十新的餐廳與評論
    return Restaurant.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']], // 前後優先順序的排序條件
      include: [Category]
    }).then(restaurants => {
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      }).then(comments => {
        return res.render('feeds', JSON.parse(JSON.stringify({
          restaurants: restaurants,
          comments: comments
        })))
      })
    })
  }
}
module.exports = restController

const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10

const restController = {
  redirectInvalidUrl: (req, res) => { // 防止亂打網址
    req.flash('error_messages', "this page didn't exist!")
    res.redirect('/restaurants')
  },

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
          description: r.dataValues.description.substring(0, 50),
          isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
          isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id) // map 成 id 清單，之後用 Array 的 includes 方法進行比對，最後會回傳布林值
        }))
        Category.findAll().then(categories => { // 取出 categories
          // console.log('cards', data.length)
          if (data.length === 0) {
            req.flash('error_messages', "this category didn't exist!")
            res.redirect('/restaurants')
          } else {
            return res.render('restaurants', JSON.parse(JSON.stringify({
              restaurants: data,
              categories: categories,
              categoryId: categoryId,
              page: page,
              totalPage: totalPage,
              prev: prev,
              next: next
            })))
          }
        })
      })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      // include: [Category, Comment] // 不全版
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
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
        if (restaurant === null) {
          req.flash('error_messages', "this restaurant didn't exist!")
          res.redirect('/restaurants')
        } else {
          const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
          const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
          restaurant.viewCounts += 1 // 此動作代表該餐廳被點擊一次時，計次加一
          restaurant.save() // 儲存有更新的數值
            .then(restaurant => {
              return res.render('restaurant', JSON.parse(JSON.stringify({
                restaurant, isFavorited, isLiked // 前後端名稱相同時可省略其一
              })))
            })
            .catch((restaurant) => {
              req.flash('error_messages', "this restaurant didn't exist!")
              res.redirect('/restaurants')
            })
        }
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
  },

  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      if (restaurant === null) {
        req.flash('error_messages', "this restaurant didn't exist!")
        res.redirect('/restaurants')
      } else {
        return res.render('dashboard', JSON.parse(JSON.stringify({ restaurant: restaurant })))
      }
    })
  },

  getTopRestaurants: (req, res) => {
    return Restaurant.findAll({
      include: [
        { model: User, as: 'FavoritedUsers' }
      ]
    }).then(restaurants => {
      // console.log(restaurants)
      restaurants = restaurants.map(r => ({
        ...r.dataValues,
        description: r.description.substring(0, 50),
        FavoritedCount: r.FavoritedUsers.length,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id)
      }))
      restaurants = restaurants.sort((a, b) => b.FavoritedCount - a.FavoritedCount).slice(0, 10)
      restaurants = restaurants.filter(restaurant => restaurant.FavoritedCount > 0) // 只看到真的有人收藏的餐廳，不看到 0 人收藏的
      return res.render('topRestaurants', { restaurants })
    })
  }
}
module.exports = restController

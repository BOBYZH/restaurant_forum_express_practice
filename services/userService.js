const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant
const Comment = db.Comment
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

function getUnique (arr, comp) { // https://reactgo.com/removeduplicateobjects/，去除陣列中重複的物件
  const unique = arr
    .map(e => e[comp])

    // store the keys of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the dead keys & store unique objects
    .filter(e => arr[e]).map(e => arr[e])

  return unique
}

const userService = {
  getUser: (req, res, callback) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [Restaurant] },
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    }).then(user => {
      user = JSON.parse(JSON.stringify(user))
      let commentedRestaurants = []
      user.Comments.map(comment => {
        commentedRestaurants.push(comment.Restaurant)
      })
      // console.log('Original', commentedRestaurants)
      commentedRestaurants = getUnique(commentedRestaurants, 'id') // 顯示的餐廳不重複，見上方函式
      // console.log('Altered', commentedRestaurants)
      // console.log('test', user)
      const isFollowed = req.user.Followings.map(d => d.id).includes(user.id)
      callback({ profile: user, commentedRestaurants, isFollowed })
    })
      .catch(user => {
        return callback({ status: 'error', message: "user didn't exist!" })
      })
  },

  putUser: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
    } else if (Number(req.params.id) !== req.user.id) { // 防止用 POSTMAN 發送 PutUser 的 HTTP請求，這樣還是可以改到別人的資料
      return callback({ status: 'error', message: 'permission denied' })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id).then(user => {
          user.update({
            name: req.body.name,
            image: file ? img.data.link : user.image
          })
            .then((user) => {
              return callback({ status: 'success', message: 'updated successfully' })
            })
            .catch((user) => {
              return callback({ status: 'error', message: 'unexpected error, try later...' })
            })
        })
      })
    } else {
      return User.findByPk(req.params.id).then(user => {
        user.update({
          name: req.body.name,
          image: user.image
        })
          .then((user) => {
            return callback({ status: 'success', message: 'updated successfully' })
          })
          .catch((user) => {
            return callback({ status: 'error', message: 'unexpected error, try later...' })
          })
      })
    }
  },

  addFavorite: (req, res, callback) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return callback({ status: 'success', message: '' })
      })
  },

  removeFavorite: (req, res, callback) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            return callback({ status: 'success', message: '' })
          })
      })
  },

  addLike: (req, res, callback) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      return callback({ status: 'success', message: '' })
    })
  },

  removeLike: (req, res, callback) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(Like => {
      Like.destroy().then(restaurant => {
        return callback({ status: 'success', message: '' })
      })
    })
  },

  getTopUser: (req, res, callback) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      // 整理 users 資料
      users = users.map(user => ({
        ...user.dataValues,
        // 計算追蹤者人數
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      // 依追蹤者人數排序清單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount) // sort預設以文字排序，需函式指定排序演算法，b - a代表b得比較大才能往後排
      callback({ users: users })
    })
  },

  addFollowing: (req, res, callback) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        return callback({ status: 'success', message: '' })
      })
  },

  removeFollowing: (req, res, callback) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return callback({ status: 'success', message: '' })
          })
      })
  }
}

module.exports = userService

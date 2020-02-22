const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant
const Comment = db.Comment
const Favorite = db.Favorite

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

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', 'Different passwords!')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', 'The email is already used! ')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', 'Successfully register an account!')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', 'Login successfully')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', 'Logout successfully')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [Restaurant] }
      ]
    }).then(user => {
      user = JSON.parse(JSON.stringify(user))
      let commentedRestaurants = []
      user.Comments.map(comment => {
        commentedRestaurants.push(comment.Restaurant)
      })
      console.log('Original', commentedRestaurants)
      commentedRestaurants = getUnique(commentedRestaurants, 'id') // 顯示的餐廳不重複
      console.log('Altered', commentedRestaurants)
      return res.render('profile', JSON.parse(JSON.stringify({ profile: user, commentedRestaurants })))
    })
      .catch((user) => {
        req.flash('error_messages', "this user didn't exist!")
        res.redirect('/restaurants')
      })
  },

  editUser: (req, res) => {
    if (Number(req.params.id) !== req.user.id) { // 防止進入他人修改頁面偷改資料，參考Steph的作業修的漏洞，想說只有這個一定要限制
      req.flash('error_messages', '只能改自己的頁面！')
      res.redirect(`/users/${req.user.id}/edit`)
    } else {
      return User.findByPk(req.params.id).then(user => {
        return res.render('editProfile', JSON.parse(JSON.stringify({ user: user })))
      })
    }
  },

  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    } else if (Number(req.params.id) !== req.user.id) { // 防止用 POSTMAN 發送 PutUser 的 HTTP請求，這樣還是可以改到別人的資料
      req.flash('error_messages', '只能改自己的頁面！')
      res.redirect(`/users/${req.user.id}/edit`)
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id).then(user => {
          user
            .update({
              name: req.body.name,
              image: file ? img.data.link : user.image
            })
            .then((user) => {
              req.flash(
                'success_messages',
                'Your profile was successfully to update'
              )
              res.redirect(`/users/${user.id}`)
            })
            .catch((user) => {
              req.flash('error_messages', 'unexpected error, try later...')
            })
        })
      })
    } else {
      return User.findByPk(req.params.id).then(user => {
        user
          .update({
            name: req.body.name,
            image: user.image
          })
          .then((user) => {
            req.flash(
              'success_messages',
              'Your profile was successfully to update'
            )
            res.redirect(`/users/${user.id}`)
          })
          .catch((user) => {
            req.flash('error_messages', 'unexpected error, try later...')
          })
      })
    }
  },

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return res.redirect('back')
      })
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            return res.redirect('back')
          })
      })
  }
}

module.exports = userController

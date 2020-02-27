const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

const userService = require('../services/userService.js')

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
    userService.getUser(req, res, (data) => {
      if (data === null) {
        return res.redirect('/')
      } else {
        return res.render('profile', data)
      }
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
    userService.putUser(req, res, (data) => {
      if (data.status === 'success') {
        req.flash('success_messages', data.message)
      } else {
        req.flash('error_messages', data.message)
      }
      return res.redirect(`/users/${req.params.id}`)
    })
  },

  addFavorite: (req, res) => {
    userService.addFavorite(req, res, (data) => {
      return res.redirect('back')
    })
  },
  removeFavorite: (req, res) => {
    userService.removeFavorite(req, res, (data) => {
      return res.redirect('back')
    })
  },

  addLike: (req, res) => {
    userService.addLike(req, res, (data) => {
      return res.redirect('back')
    })
  },
  removeLike: (req, res) => {
    userService.removeLike(req, res, (data) => {
      return res.redirect('back')
    })
  },

  getTopUser: (req, res) => {
    userService.getTopUser(req, res, (data) => {
      return res.render('topUser', data)
    })
  },

  addFollowing: (req, res) => {
    userService.addFollowing(req, res, (data) => {
      return res.redirect('back')
    })
  },
  removeFollowing: (req, res) => {
    userService.removeFollowing(req, res, (data) => {
      return res.redirect('back')
    })
  }
}

module.exports = userController

const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

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
    return User.findByPk(req.params.id).then(user => {
      return res.render('profile', JSON.parse(JSON.stringify({ profile: user })))
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
  }
}

module.exports = userController

const db = require('../models')
const Category = db.Category

const categoryService = {
  getCategories: (req, res, callback) => {
    return Category.findAll().then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id)
          .then((category) => {
            // console.log('test', category)
            if (category === null) {
              req.flash('error_messages', "category didn't exist")
              res.redirect('/admin/categories')
            } else {
              return res.render('admin/categories', JSON.parse(JSON.stringify({ categories: categories, category: category })))
            }
          })
      } else {
        callback({ categories: categories })
      }
    })
  },
  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: 'name didn\'t exist' })
    } else {
      return Category.create({
        name: req.body.name
      })
        .then((category) => {
          callback({ status: 'success', message: 'category was successfully created' })
        })
    }
  },
  putCategory: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: 'name didn\'t exist' })
    } else {
      return Category.findByPk(req.params.id)
        .then((category) => {
          if (!category) {
            return callback({ status: 'error', message: "category didn't exist" })
          } else {
            category.update(req.body)
              .then((category) => {
                callback({ status: 'success', message: 'category was successfully updated' })
              })
          }
        })
    }
  },
  deleteCategory: (req, res, callback) => {
    return Category.findByPk(req.params.id)
      .then((category) => {
        if (!category) {
          return callback({ status: 'error', message: "category didn't exist" })
        } else {
          category.destroy()
            .then((category) => {
              callback({ status: 'success', message: '' })
            })
        }
      })
  }
}
module.exports = categoryService

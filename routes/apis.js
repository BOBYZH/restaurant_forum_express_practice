const express = require('express')
const router = express.Router()

const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const passport = require('../config/passport')

const authenticated = passport.authenticate('jwt', { session: false })

const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) { return next() }
    return res.json({ status: 'error', message: 'permission denied' })
  } else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}

// const restController = require('../controllers/restController.js')
const adminController = require('../controllers/api/adminController.js')
const userController = require('../controllers/api/userController.js')
const categoryController = require('../controllers/api/categoryController.js')
// const commentController = require('../controllers/commentController.js')

// router.get('/restaurants', authenticated, restController.getRestaurants)

// // 放在後面會被視為id而無效
// router.get('/restaurants/feeds', authenticated, restController.getFeeds)
// router.get('/restaurants/top', authenticated, restController.getTopRestaurants)

// router.get('/restaurants/:id', authenticated, restController.getRestaurant)
// router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)

router.get('/admin/restaurants', authenticated, authenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.getRestaurant)
router.post('/admin/restaurants', authenticated, authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.put('/admin/restaurants/:id', authenticated, authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.deleteRestaurant)

// router.get('/admin/users', authenticatedAdmin, adminController.getUsers)

router.get('/admin/categories', authenticated, authenticatedAdmin, categoryController.getCategories)
router.post('/admin/categories', authenticated, authenticatedAdmin, categoryController.postCategory)
router.put('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.deleteCategory)

// JWT sign
router.post('/signup', userController.signUp)
router.post('/signin', userController.signIn)

// router.get('/users/top', authenticated, userController.getTopUser) // 放在後面會被視為id而無效

// router.get('/users/:id', authenticated, userController.getUser)

module.exports = router

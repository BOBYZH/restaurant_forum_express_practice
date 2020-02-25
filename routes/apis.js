const express = require('express')
const router = express.Router()

// const restController = require('../controllers/restController.js')
const adminController = require('../controllers/api/adminController.js')
// const userController = require('../controllers/userController.js')
const categoryController = require('../controllers/api/categoryController.js')
// const commentController = require('../controllers/commentController.js')

// router.get('/restaurants', authenticated, restController.getRestaurants)

// // 放在後面會被視為id而無效
// router.get('/restaurants/feeds', authenticated, restController.getFeeds)
// router.get('/restaurants/top', authenticated, restController.getTopRestaurants)

// router.get('/restaurants/:id', authenticated, restController.getRestaurant)
// router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)

router.get('/admin/restaurants', adminController.getRestaurants)
router.get('/admin/restaurants/:id', adminController.getRestaurant)

// router.get('/admin/users', authenticatedAdmin, adminController.getUsers)

router.get('/admin/categories', categoryController.getCategories)

// router.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)

// router.get('/users/top', authenticated, userController.getTopUser) // 放在後面會被視為id而無效

// router.get('/users/:id', authenticated, userController.getUser)

module.exports = router

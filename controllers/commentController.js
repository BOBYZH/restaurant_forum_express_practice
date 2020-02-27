const commentService = require('../services/commentService.js')

const commentController = {
  postComment: (req, res) => {
    commentService.postComment(req, res, (data) => {
      console.log('test', data)
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
      }
      return res.redirect('back')
    })
  },

  deleteComment: (req, res) => {
    commentService.deleteComment(req, res, (data) => {
      return res.redirect('back')
    })
  }
}
module.exports = commentController

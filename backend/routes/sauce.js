const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

const userCtrl = require('../controllers/sauce')

router.post('', auth, multer, userCtrl.addSauce)
router.put('/:id', auth, multer, userCtrl.updateSauceById)
router.delete('/:id', auth, userCtrl.deleteSauceById)
router.post('/:id/like', auth, userCtrl.likeSauceById)
router.get('', auth, userCtrl.getSauces)
router.get('/:id', auth, userCtrl.getSauceById)

module.exports = router
const express = require('express');
const router = express.Router();
let AuthController = require ('../controllers/AuthController');
AuthController = new AuthController();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);


module.exports = router;
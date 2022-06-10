const express = require('express');
const router = express.Router();
const AuthJwtMiddleware = require('../middlewares/AuthJwtMiddleware');
let MulterMiddleware = require('../middlewares/MulterMiddleware');
MulterMiddleware = new MulterMiddleware();

let SaucesController = require ('../controllers/SaucesController');
SaucesController = new SaucesController();

router.get('/', AuthJwtMiddleware, SaucesController.index);
router.get('/:id', AuthJwtMiddleware, SaucesController.show);
router.post('/', AuthJwtMiddleware, MulterMiddleware.create(), SaucesController.create);
router.put('/:id', AuthJwtMiddleware, MulterMiddleware.create(), SaucesController.update);
router.delete('/:id', AuthJwtMiddleware, SaucesController.destroy);
router.post('/:id/like', AuthJwtMiddleware, SaucesController.rate);


module.exports = router;
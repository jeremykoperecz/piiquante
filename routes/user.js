const express = require('express');
const router = express.Router();


const userCtrl = require('../controllers/user');
const passwordCtrl = require('../middleware/password-validator');
const emailCtrl = require('../middleware/email-validator');

router.post('/signup', passwordCtrl, emailCtrl, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;
const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { auth } = require('../middlewares/auth');
const {
  getAllUsers,
  getUserById,
  updateMyProfile,
  updateMyAvatar,
  getMyInfo,
} = require('../controllers/users');
const urlRegex = require('../utils/regex');

userRouter.get('/', auth, getAllUsers);

userRouter.get('/me', auth, getMyInfo);

userRouter.get('/:userId', auth, celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().hex().length(24),
  }).unknown(true),
}), getUserById);

userRouter.patch('/me', auth, celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateMyProfile);

userRouter.patch('/me/avatar', auth, celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(new RegExp(urlRegex)),
  }),
}), updateMyAvatar);

module.exports = userRouter;

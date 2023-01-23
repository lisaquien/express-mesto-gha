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

userRouter.get('/', auth, getAllUsers);

userRouter.get('/me', auth, getMyInfo);

userRouter.get('/:userId', auth, getUserById);

userRouter.patch('/me', auth, celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).default('Жак-Ив Кусто'),
    about: Joi.string().min(2).max(30).default('Исследователь'),
  }),
}), updateMyProfile);

userRouter.patch('/me/avatar', auth, celebrate({
  body: Joi.object().keys({
    avatar: Joi.string(),
  }),
}), updateMyAvatar);

module.exports = userRouter;

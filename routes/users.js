const userRouter = require('express').Router();
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

userRouter.patch('/me', auth, updateMyProfile);

userRouter.patch('/me/avatar', auth, updateMyAvatar);

module.exports = userRouter;

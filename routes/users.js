const userRouter = require('express').Router();
const { getAllUsers, getUserById, createUser, updateMyProfile, updateMyAvatar } = require('../controllers/users');

userRouter.get('/', getAllUsers);

userRouter.get('/:userId', getUserById);

userRouter.post('/', createUser);

userRouter.patch('/me', updateMyProfile);

userRouter.patch('/me/avatar', updateMyAvatar);

module.exports = userRouter;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ServerError = require('../errors/ServerError');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ConflictError = require('../errors/ConflictError');
const User = require('../models/user');
const {
  OK_CODE,
  CREATED_CODE,
} = require('../constants');

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((newUser) => res.status(CREATED_CODE).send({
      _id: newUser._id,
      name: newUser.name,
      about: newUser.about,
      avatar: newUser.avatar,
      email: newUser.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Данные вводятся некорректно'));
      } else if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким e-mail уже существует, воспользуйтесь другим'));
      } else {
        next(new ServerError('Внутренняя ошибка сервера'));
      }
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'keep-me-safe',
        { expiresIn: '7d' },
      );
      return res.send({ token });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким e-mail уже существует, воспользуйтесь другим'));
      } else {
        next(new UnauthorizedError('Почта или пароль введены некорректно'));
      }
      next(err);
    });
};

module.exports.getAllUsers = (req, res, next) => {
  User.find({}).select('+password')
    .then((allUsers) => {
      const usersList = [];
      for (let i = 0; i < allUsers.length; i += 1) {
        const {
          _id, name, about, avatar, email,
        } = allUsers[i];

        usersList[i] = {
          _id, name, about, avatar, email,
        };
      }
      res.status(OK_CODE).send({ usersList });
    })
    .catch((err) => {
      next(new ServerError('Внутренняя ошибка сервера'));
    });
};

module.exports.getMyInfo = (req, res, next) => {
  const ownerId = req.user._id;

  User.findOne({ _id: ownerId }).select('+password')
    .orFail(new Error())
    .then((myInfo) => res.status(OK_CODE).send({
      _id: myInfo._id,
      name: myInfo.name,
      about: myInfo.about,
      avatar: myInfo.avatar,
      email: myInfo.email,
    }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Данные вводятся некорректно'));
      } else if (err.name === 'Error') {
        next(new NotFoundError('Запрашиваемый пользователь не найден'));
      } else {
        next(new ServerError('Внутренняя ошибка сервера'));
      }
      next(err);
    });
};

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findById({ _id: userId }).select('+password')
    .orFail(new Error())
    .then((user) => res.status(OK_CODE).send({
      _id: user._id,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Данные вводятся некорректно'));
      } else if (err.name === 'Error') {
        next(new NotFoundError('Запрашиваемый пользователь не найден'));
      } else {
        next(new ServerError('Внутренняя ошибка сервера'));
      }
      next(err);
    });
};

module.exports.updateMyProfile = (req, res, next) => {
  const { name, about } = req.body;
  const ownerId = req.user._id;

  User.findByIdAndUpdate(
    { _id: ownerId },
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  ).select('+password')
    .then((updUser) => res.status(OK_CODE).send({
      _id: updUser._id,
      name: updUser.name,
      about: updUser.about,
      avatar: updUser.avatar,
      email: updUser.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Данные вводятся некорректно'));
      } else {
        next(new ServerError('Внутренняя ошибка сервера'));
      }
      next(err);
    });
};

module.exports.updateMyAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const ownerId = req.user._id;

  User.findByIdAndUpdate(
    { _id: ownerId },
    { avatar },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  ).select('+password')
    .then((updAvatar) => res.status(OK_CODE).send({
      _id: updAvatar._id,
      name: updAvatar.name,
      about: updAvatar.about,
      avatar: updAvatar.avatar,
      email: updAvatar.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Данные вводятся некорректно'));
      } else {
        next(new ServerError('Внутренняя ошибка сервера'));
      }
      next(err);
    });
};

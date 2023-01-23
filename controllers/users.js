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
    .then((newUser) => res.status(CREATED_CODE).send({ newUser }))
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
        next(new BadRequestError('Почта или пароль введены некорректно'));
      }
      next(err);
    });
};

module.exports.getAllUsers = (req, res, next) => {
  User.find({}).select('+password')
    .then((users) => res.send({ users }))
    .catch((err) => {
      next(new ServerError('Внутренняя ошибка сервера'));
    });
};

module.exports.getMyInfo = (req, res, next) => {
  const ownerId = req.user._id;

  User.findOne({ _id: ownerId }).select('+password')
    .orFail(new Error())
    .then((myInfo) => res.status(OK_CODE).send({ myInfo }))
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
    .then((user) => res.send({ user }))
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
    .then((updUser) => res.status(OK_CODE).send({ updUser }))
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
    .then((updAvatar) => res.status(OK_CODE).send({ updAvatar }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Данные вводятся некорректно'));
      } else {
        next(new ServerError('Внутренняя ошибка сервера'));
      }

      next(err);
    });
};

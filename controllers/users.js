const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  OK_CODE,
  CREATED_CODE,
  INCORRECT_DATA_ERROR_CODE,
  NOT_FOUND_ERROR_CODE,
  INTERNAL_ERROR_CODE,
} = require('../constants');

module.exports.getAllUsers = (req, res, next) => {
  User.find({}).select('+password')
    .then((users) => res.send({ users }))
    .catch((err) => res.status(INTERNAL_ERROR_CODE).send({ message: 'Внутренняя ошибка сервера' }));
};

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findById({ _id: userId }).select('+password')
    .orFail(new Error())
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: err.message });
      } else if (err.name === 'Error') {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      } else {
        res.status(INTERNAL_ERROR_CODE).send({ message: 'Внутренняя ошибка сервера' });
      }
    });
};

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
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Данные вводятся некорректно' });
      } else {
        res.status(INTERNAL_ERROR_CODE).send({ message: 'Внутренняя ошибка сервера' });
      }
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
    .then((updUser) => res.status(OK_CODE).send({ data: updUser }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Данные вводятся некорректно' });
      } else {
        res.status(INTERNAL_ERROR_CODE).send({ message: 'Внутренняя ошибка сервера' });
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
  )
    .then((updAvatar) => res.status(OK_CODE).send({ data: updAvatar }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Данные вводятся некорректно' });
      } else {
        res.status(INTERNAL_ERROR_CODE).send({ message: 'Внутренняя ошибка сервера' });
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
      res.status(401).send({ message: 'Запрашиваемый пользователь не найден' });
    });
};

module.exports.getMyInfo = (req, res, next) => {
  const ownerId = req.user._id;

  User.findOne({ _id: ownerId }).select('+password')
    .orFail(new Error())
    .then((myInfo) => res.status(OK_CODE).send({ myInfo }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Данные вводятся некорректно' });
      } else if (err.name === 'Error') {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      } else {
        res.status(INTERNAL_ERROR_CODE).send({ message: 'Внутренняя ошибка сервера' });
      }
      next(err);
    });
};

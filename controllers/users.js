const User = require('../models/user');
const {
  OK_CODE,
  CREATED_CODE,
  INCORRECT_DATA_ERROR_CODE,
  NOT_FOUND_ERROR_CODE,
  INTERNAL_ERROR_CODE,
} = require('../constants');

module.exports.getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch((err) => res.status(INTERNAL_ERROR_CODE).send({ message: 'Внутренняя ошибка сервера' }));
};

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findById({ _id: userId })
    .orFail(new Error())
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Данные вводятся некорректно' });
      } else if (err.name === 'Error') {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      } else {
        res.status(INTERNAL_ERROR_CODE).send({ message: 'Внутренняя ошибка сервера' });
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
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
  )
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

const Card = require('../models/card');
const {
  OK_CODE,
  CREATED_CODE,
  INCORRECT_DATA_ERROR_CODE,
  NOT_FOUND_ERROR_CODE,
  INTERNAL_ERROR_CODE,
} = require('../constants');

module.exports.getAllCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => res.status(INTERNAL_ERROR_CODE).send({ message: 'Внутренняя ошибка сервера' }));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((newCard) => res.status(CREATED_CODE).send({ data: newCard }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Данные вводятся некорректно' });
      } else {
        res.status(INTERNAL_ERROR_CODE).send({ message: 'Внутренняя ошибка сервера' });
      }
    });
};

module.exports.deleteCardById = (req, res, next) => {
  const { cardId } = req.params;
  const ownerId = req.user._id;

  Card.findById({ _id: cardId })
    .then((data) => {
      if (String(data.owner) !== ownerId) {
        res.status(404).send({ message: 'get your hands off' });
      } else {
        Card.findByIdAndRemove({ _id: cardId })
          .orFail(new Error())
          .then((deletedCard) => res.status(OK_CODE).send({ deletedCard }))
          .catch((err) => {
            if (err.name === 'CastError') {
              res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Данные вводятся некорректно' });
            } else if (err.name === 'Error') {
              res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Запрашиваемая карточка не найдена' });
            } else {
              res.status(INTERNAL_ERROR_CODE).send({ message: 'Внутренняя ошибка сервера' });
            }
          });
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;
  const ownerId = req.user._id;

  Card.findByIdAndUpdate(
    { _id: cardId },
    { $addToSet: { likes: ownerId } },
    { new: true },
  )
    .populate({
      path: 'likes',
      select: 'name about avatar',
    })
    .orFail(new Error())
    .then((likedCard) => res.status(OK_CODE).send({ likedCard }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Данные вводятся некорректно' });
      } else if (err.name === 'Error') {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Запрашиваемая карточка не найдена' });
      } else {
        res.status(INTERNAL_ERROR_CODE).send({ message: 'Внутренняя ошибка сервера' });
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  const ownerId = req.user._id;

  Card.findByIdAndUpdate(
    { _id: cardId },
    { $pull: { likes: ownerId } },
    { new: true },
  )
    .populate({
      path: 'likes',
      select: 'name about avatar',
    })
    .orFail(new Error())
    .then((cardLikes) => res.status(OK_CODE).send({ data: cardLikes }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Данные вводятся некорректно' });
      } else if (err.name === 'Error') {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Запрашиваемая карточка не найдена' });
      } else {
        res.status(INTERNAL_ERROR_CODE).send({ message: 'Внутренняя ошибка сервера' });
      }
    });
};

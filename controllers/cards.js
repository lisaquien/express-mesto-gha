const Card = require('../models/card');
const ServerError = require('../errors/ServerError');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');
const {
  OK_CODE,
  CREATED_CODE,
} = require('../constants');

module.exports.getAllCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    .catch((err) => {
      next(new ServerError('Внутренняя ошибка сервера'));
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((newCard) => res.status(CREATED_CODE).send({ newCard }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Данные вводятся некорректно'));
      } else {
        next(new ServerError('Внутренняя ошибка сервера'));
      }
      next(err);
    });
};

module.exports.deleteCardById = (req, res, next) => {
  const { cardId } = req.params;
  const ownerId = req.user._id;

  Card.findById({ _id: cardId })
    .then((data) => {
      if (!data) {
        next(new NotFoundError('Запрашиваемая карточка не найдена'));
      } else if (String(data.owner) !== ownerId) {
        next(new ForbiddenError('Невозможно удалить карточку другого пользователя'));
      } else {
        Card.findByIdAndRemove({ _id: cardId })
          .orFail(new Error())
          .then((deletedCard) => res.status(OK_CODE).send({ deletedCard }))
          .catch((err) => {
            if (err.name === 'CastError') {
              next(new BadRequestError('Данные вводятся некорректно'));
            } else if (err.name === 'Error') {
              next(new NotFoundError('Запрашиваемая карточка не найдена'));
            } else {
              next(new ServerError('Внутренняя ошибка сервера'));
            }
            next(err);
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
        next(new BadRequestError('Данные вводятся некорректно'));
      } else if (err.name === 'Error') {
        next(new NotFoundError('Запрашиваемая карточка не найдена'));
      } else {
        next(new ServerError('Внутренняя ошибка сервера'));
      }
      next(err);
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
    .then((dislikedCard) => res.status(OK_CODE).send({ dislikedCard }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Данные вводятся некорректно'));
      } else if (err.name === 'Error') {
        next(new NotFoundError('Запрашиваемая карточка не найдена'));
      } else {
        next(new ServerError('Внутренняя ошибка сервера'));
      }
      next(err);
    });
};

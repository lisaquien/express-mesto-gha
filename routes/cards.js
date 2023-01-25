const cardRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { auth } = require('../middlewares/auth');
const {
  getAllCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');
const urlRegex = require('../utils/regex');

cardRouter.get('/', auth, getAllCards);

cardRouter.post('/', auth, celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(new RegExp(urlRegex)),
  }),
}), createCard);

cardRouter.delete('/:cardId', auth, celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().hex().length(24),
  }).unknown(true),
}), deleteCardById);

cardRouter.put('/:cardId/likes', auth, celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().hex().length(24),
  }).unknown(true),
}), likeCard);

cardRouter.delete('/:cardId/likes', auth, celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().hex().length(24),
  }).unknown(true),
}), dislikeCard);

module.exports = cardRouter;

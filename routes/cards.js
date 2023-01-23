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

cardRouter.get('/', auth, getAllCards);

cardRouter.post('/', auth, celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required(),
  }),
}), createCard);

cardRouter.delete('/:cardId', auth, deleteCardById);

cardRouter.put('/:cardId/likes', auth, likeCard);

cardRouter.delete('/:cardId/likes', auth, dislikeCard);

module.exports = cardRouter;

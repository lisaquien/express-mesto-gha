const cardRouter = require('express').Router();
const { auth } = require('../middlewares/auth');
const {
  getAllCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

cardRouter.get('/', auth, getAllCards);

cardRouter.post('/', auth, createCard);

cardRouter.delete('/:cardId', auth, deleteCardById);

cardRouter.put('/:cardId/likes', auth, likeCard);

cardRouter.delete('/:cardId/likes', auth, dislikeCard);

module.exports = cardRouter;

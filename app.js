const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const { createUser, login } = require('./controllers/users');
const urlRegex = require('./utils/regex');
const wrongRoute = require('./middlewares/wrongRoute');
const errorHandler = require('./middlewares/errorHandler');

const { PORT = 3000 } = process.env;

const app = express();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 150,
  message: 'Количество запросов превышено, попробуйте повторить запрос позднее',
});

app.use(limiter);
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb');

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(new RegExp(urlRegex)),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);
app.use('/users', userRouter);
app.use('/cards', cardRouter);

app.use(wrongRoute);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`апп слушает на порту ${PORT}`);
});

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const { createUser, login } = require('./controllers/users');

const { PORT = 3000 } = process.env;

const app = express();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  message: 'Количество запросов превышено, попробуйте повторить запрос позднее',
});

app.use(limiter);
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb');

app.post('/signin', login);
app.post('/signup', createUser);
app.use('/users', userRouter);
app.use('/cards', cardRouter);

app.use((err, req, res, next) => {
  res.status(404).send({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`апп слушает на порту ${PORT}`);
});

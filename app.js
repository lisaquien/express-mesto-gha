const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use((req, res, next) => {
  req.user = {
    _id: '63a44a95492110b597e368cb'
  };

  next();
});
app.use('/users', userRouter);
app.use('/cards', cardRouter);

app.listen(PORT, () => {
  console.log(`апп слушает на порту ${PORT}`);
});
const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');

const urlRegex = /https?\:\/\/(www\.)?[\w\-\.\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]($\#)?/;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    validate: {
      validator: urlRegex,
      message: 'URL ссылки имеет некорректный формат',
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: isEmail,
      message: 'E-mail имеет некорректный формат',
    },
  },
  password: {
    type: String,
    required: true,
    select: true,
  },
}, { versionKey: false });

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Почта или пароль введены некорректно'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Почта или пароль введены некорректно'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);

const NotFoundError = require('../errors/NotFoundError');

const wrongRoute = (req, res, next) => {
  next(new NotFoundError('Страницы с таким адресом не существует'));
};

module.exports = wrongRoute;

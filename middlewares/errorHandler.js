const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    message: statusCode === 500
      ? 'Произошла внутренняя ошибка сервера, запрос не может быть выполнен'
      : message,
  });
};

module.exports = errorHandler;

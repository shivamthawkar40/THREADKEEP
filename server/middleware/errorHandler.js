const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err.message || err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  if (err.message === 'CORS origin not allowed') {
    statusCode = 403;
    message = 'Origin not allowed.';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered.';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && err.message !== 'CORS origin not allowed' ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;

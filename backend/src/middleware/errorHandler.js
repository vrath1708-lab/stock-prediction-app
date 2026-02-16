const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);
  
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(status).json({
    error: {
      status,
      message,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = errorHandler;

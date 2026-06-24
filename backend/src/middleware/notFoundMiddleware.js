export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - Request path ${req.originalUrl} does not exist`);
  res.status(404);
  next(error);
};

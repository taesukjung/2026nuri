module.exports = {
  isAuthenticated: function (req, res, next) {
    if (req.session && req.session.isAdmin) {
      return next();
    }
    res.status(401).send('Unauthorized');
  }
};

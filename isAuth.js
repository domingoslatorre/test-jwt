const jwt = require('express-jwt');

const getTokenFromHeader = function(req) {
  const { authorization } = req.headers;

  if(authorization && authorization.includes('Bearer ')) {
    const [_, token] = authorization.split(' ');
    return token;
  }

}

module.exports = jwt({
  secret: 'MyS1gntUr3_@@@1',
  userProperty: 'token',
  getToken: getTokenFromHeader,
});
const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const isAuth = require('./isAuth');

const app = express();


app.get('/', function(req, res) {
  res.json({ ok: true });
});


//$argon2i$v=19$m=4096,t=3,p=1$sO52p+wKLd3R1+10h6PN6A$zdSfZz8KrLq2yClpH4ZOgciTqlzSJfLX51uT6Z+pW6A
//$argon2i$v=19$m=4096,t=3,p=1$pwytr/MbdXlE2PTQtVh8dw$x3l8FAlrNPAShtK/ZJZZrbYCeO+dbIlMNFtS+ACtedU
//$argon2i$v=19$m=4096,t=3,p=1$056pM8mswXkV+NaipnNI1Q$MVE/UGncGI/mu0Bnvm552KNjWrXhNibIH1JVSUrJcIA
app.get('/argon2', async function(req, res){
  const hash = await argon2.hash('password'); 
  res.json({ hash: hash });
});

app.get('/argon2/teste', async function(req, res) {
  const match = await argon2.verify(
    '$argon2i$v=19$m=4096,t=3,p=1$056pM8mswXkV+NaipnNI1Q$MVE/UGncGI/mu0Bnvm552KNjWrXhNibIH1JVSUrJcIA',
    'password'
  );
  res.json({ res: match });
});

/*
- jwt.sign(payload, secretOrPrivateKey, [options, callback])
  Asynchronous: If a callback is supplied, the callback is called with the err or the JWT.
  Synchronous: Returns the JsonWebToken as string

  payload could be an object literal, buffer or string representing valid JSON.

*/

app.get('/jwt', function(req, res) {
  const data = {
    id: 1,
    nome: 'João da Silva',
    email: 'joao@gmail.com',
  }
  const assinatura = 'MyS1gntUr3_@@@1';
  
  //3000 segundos
  const expiracao = 3000;
  //const expiracao = '6h';

  const token = jwt.sign({ data, }, assinatura, { expiresIn: expiracao } );
  res.send(token);

});



//Inserir um Header no Postman
//Key:   Authorization
//Value: Bearer toke_aqui
app.post('/jwt', function(req, res) {

  const { authorization } = req.headers;

  if(!authorization) {
    return res.status(400).send({ error: 'Token de autorização ausente'});
  }
  
  if(!authorization.includes('Bearer ')) {
    return res.status(400).send({ error: `Token de autorização inválido. Use: 'Bearer token'`});
  }

  const [_, token] = authorization.split(' ');

  const assinatura = 'MyS1gntUr3_@@@1';

  try {
    const tokenDecodificado = jwt.verify(token, assinatura);

    //Não precisa verificar, verify já faz a verificação de exp
    //const { exp } = tokenDecodificado;
    //if(exp < Date.now() * 1000)
    //tokenDecodificado.now = Date.now();

    res.json({ token: token, tokenDecodificado: tokenDecodificado });
  } catch(err) {
    return res.status(401).send({ error: err })
  }

});

function carregarUsuario(req, res, next) {
  //Carregar dados do usuário na request
  const email = req.token.data.email;
  req.email = email;
  return next();
}

app.post('/isAuth01', isAuth, carregarUsuario, function(req, res) {
  res.json({ token: req.token, email: req.email });
});

app.listen(3000);
const path = require('path');

//import css
const fastify = require('fastify')({
    logger: true
  })
  fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'Style'),
    prefix: '/Style/', // optional: default '/'
});

//create and connect db
fastify.decorate('esterno', require('./db')());
const cod = require('./cod')

//import or export date
fastify.register(require('fastify-formbody'));

//views file.ejs
fastify.register(require('point-of-view'), {
    engine: {
      ejs: require('ejs')
    },
    root: path.join(__dirname, 'Views')
});

//login
fastify.get('/', async (req, reply) => {
    return reply.view('login.ejs', {loginError : 'undefined'});
});

fastify.post('/login', async (req, reply) => {
  const data = req.body;
  const username = data.username;
  const password = data.password;

  const result = await fastify.esterno.login(username, password);
  if(result){
    return reply.view('login.ejs', {loginError : false});
  }
  else
    return reply.view('login.ejs', {loginError : true});
});

//registration
fastify.get('/registration', async (req, reply) => {
  return reply.view('registration.ejs');
});

fastify.post('/registration', async (req, reply) => {
  const data = req.body;
  //email
  if(data['email_cod'].length < 1)
  {
    console.log("errore email");
    return;
  }
  //password
  if(data['password_cod'].length < 1)
  {
    console.log("errore password_cod");
    return;
  }
  if(data['password'].length < 1)
  {
    console.log("errore password");
    return;
  }

  //testing connection
  const login = await cod.verifyLogin(data['email_cod'],data['password_cod']);
  if(login === 'success')
  {
    const uno = await cod.getUno();
    fastify.esterno.registration(uno, data['password'],data['email_cod'],data['password_cod']);
  }
  });
fastify.listen(3000, (err, address) => {
  if (err) throw err
  fastify.log.info(`server listening on ${address}`)
})
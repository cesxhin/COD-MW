const path = require('path');

//security
const sha256 = require("sha256");
const Cryptr = require('cryptr');

//import css
const fastify = require('fastify')({
    logger: true
  })
  fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'Style'),
    prefix: '/Style/', // optional: default '/'
});

//create and connect db
fastify.decorate('dal', require('./db')());
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

//cookie
fastify.register(require('fastify-cookie'));
/*fastify.addHook('onRequest', (req, reply) => {
  if(req.cookies.login) {
    return reply.redirect('/home');
  }
  return reply.redirect('/login');
});*/

fastify.get('/', async (req, reply) => {
  return reply.view('login.ejs');
});

//login
fastify.get('/login', async (req, reply) => {
  return reply.view('login.ejs',{loginError : false});
});
fastify.post('/login', async (req, reply) => {
  const data = req.body;
  const email = data.email;
  const password = sha256(data.password);
  const result = await fastify.dal.login(email, password);
  if(result){
    reply.setCookie('login', true);
    reply.setCookie('admin', result.admin);
    reply.setCookie('email_cod', result.email_cod);
    reply.setCookie('password', result.password);
    reply.setCookie('password_cod', result.password_cod);
    return reply.redirect('/home');
  }
  else
    return reply.view('login.ejs', {loginError : true});
});

//registration
fastify.get('/registration', async (req, reply) => {
  return reply.view('registration.ejs', {registrationError : ""});
});

fastify.post('/registration', async (req, reply) => {
  const data = req.body;
  //email
  if(data['email_cod'].length < 1)
  {
    reply.view('registration.ejs', {registrationError : "email"});
    return;
  }
  //password
  if(data['password_cod'].length < 1)
  {
    reply.view('registration.ejs', {registrationError : "password_cod"});
    return;
  }
  if(data['password'].length < 1)
  {
    reply.view('registration.ejs', {registrationError : "password"});
    return;
  }
  //verify email
  if(fastify.dal.verifyEmail(data['email_cod']))
  {
    reply.view('registration.ejs', {registrationError : "exits_email"});
    return;
  }
  //testing connection
  const login = await cod.verifyLogin(data['email_cod'],data['password_cod']);
  if(login === 'success')
  {
    const uno = await cod.getUno();
    const psw_sha256 = sha256(data['password'])
    const crypt = new Cryptr(psw_sha256);
    const psw_cod_aes = crypt.encrypt(data['password_cod']);
    const result = await fastify.dal.registration(uno, psw_sha256, data['email_cod'], psw_cod_aes);
    
    return result ? reply.redirect('/') : reply.view('registration.ejs', {registrationError : "generic"});
  }else
  {
    reply.view('registration.ejs', {registrationError : "failed"});
  }
});

//home
fastify.get('/home', async (req, reply) => {
  return reply.view('home.ejs');
});

fastify.listen(3000, (err, address) => {
  if (err) throw err
  fastify.log.info(`server listening on ${address}`)
})
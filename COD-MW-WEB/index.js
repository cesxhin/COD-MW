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
  return reply.view('login.ejs', {loginError : false});
});

//login
fastify.get('/login', async (req, reply) => {
  return reply.view('login.ejs', {loginError : false});
});

fastify.post('/login', async (req, reply) => {
  const data = req.body;
  const email = data.email;
  const password = sha256(data.password);
  const result = await fastify.dal.login(email, password);
  if(result){
    if(data.remember_me)
    {
      reply.setCookie('remember_me', true);
    }else
    {
      reply.setCookie('remember_me', false);
    }
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
  if(await fastify.dal.verifyEmail(data['email_cod']))
  {
    reply.view('registration.ejs', {registrationError : "exists_email"});
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
  return reply.view('home.ejs', {cookie: req.cookies});
});

//management
fastify.get('/management', async (req, reply) => {
  const schemas = await fastify.dal.getRankingSchemas();
  const tournament = await fastify.dal.getTournaments();
  return reply.view('management.ejs', {schemas, tournament});
});

//create tournament 
fastify.get('/tournament', async (req, reply) => {
  const schemas = await fastify.dal.getRankingSchemas();
  return reply.view('createTournament.ejs', {rows: schemas});
});
fastify.post('/tournament', async (req, reply) => {
  const data = req.body;
  const result = await fastify.dal.createTournament(data);
  if(result)
  {
    return reply.redirect("/management");
  }else
  {
    reply.send({
      error : 'Operazione di creazione fallita'
    });
  }
});
//update tournament
fastify.get('/updateTournament/:id', async (req, reply) => {
  const id = req.params.id;
  const result = await fastify.dal.getTournamentsById(id);
  const schemas = await fastify.dal.getRankingSchemas();
  reply.view("updateTournament.ejs", {rows: schemas, tournament: result});
});
fastify.post('/updateTournament', async (req, reply) => {
  const data = req.body;
  const result = await fastify.dal.updateTournaments(data);
  if(!result) {
    reply.view({error : 'Operazione di creazione fallita'});
  } else {
    reply.redirect('/management');
  }
});
//delete tournament
fastify.get('/deleteTournament/:id', async (req, reply) => {
  const id = req.params.id;
  const result = await fastify.dal.deleteTournaments(id);
  if(result === 'generic')
  {
    return  "Errore generico";
  }else
  {
    reply.redirect('/management');
  }
});

//ranking schema create
fastify.get('/rankingSchema', async (req, reply) => {
  return reply.view('createRankingSchema.ejs');
});

fastify.post('/rankingSchema', async (req, reply) => {
  const data = req.body;

  const result = await fastify.dal.addRankingSchema(data);

  if(!result) {
    reply.view({error : 'Operazione di creazione fallita'});
  } else {
    reply.redirect('/management');
  }

});

//delete ranking schema
fastify.get('/deleteRankingSchema/:id', async (req, reply) => {
  const id = req.params.id;
  const result = await fastify.dal.deleteRankingSchema(id);
  if(result === 'violates')
  {
    return 'Non puoi eliminare questo schema, è già in uso in un altro torneo';
  }else if(result === 'generic')
  {
    return  "Errore generico";
  }else
  {
    reply.redirect('/management');
  }
});

//update ranking schema
fastify.get('/updateRankingSchema/:id', async (req, reply) => {
  const id = req.params.id;
  const result = await fastify.dal.getRankingSchemaById(id);
  reply.view("updateRankingSchema.ejs", {schemas: result});
});
fastify.post('/updateRankingSchema', async (req, reply) => {
  const data = req.body;
  const result = await fastify.dal.updateRankingSchema(data);
  if(!result) {
    reply.view({error : 'Operazione di creazione fallita'});
  } else {
    reply.redirect('/management');
  }
});

fastify.listen(3000, (err, address) => {
  if (err) throw err
  fastify.log.info(`server listening on ${address}`)
})
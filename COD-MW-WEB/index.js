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
fastify.decorate('cod', require('./cod')());
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
  fastify.get('/', async (request, reply) => {
    return reply.view('login.ejs');
  });
  fastify.post('/login', async (request, reply) => {
    return reply.view('login.ejs');
  });
  //registration
  fastify.get('/registration', async (request, reply) => {
    return reply.view('registration.ejs');
  });
  fastify.post('/registration', async (request, reply) => {
    const data = request.body;
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
    const uno = fastify.cod.getUno(data['email_cod'],data['password_cod']);
    if(uno != null && uno != 'failed')
    {
      const a = fastify.esterno.verifyLogin(data['email_cod'],data['password_cod']);
      console.log(a);
      //fastify.esterno.registration(uno, data['password'],data['email_cod'],data['password_cod']);
    }
  });
  fastify.listen(3000, (err, address) => {
    if (err) throw err
    fastify.log.info(`server listening on ${address}`)
  })
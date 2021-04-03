const path = require('path');

//security
const sha256 = require("sha256");
const Cryptr = require('cryptr');

//import css
const fastify = require('fastify')({
    logger: true
  })
  fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'Public'),
    prefix: '/Public/', // optional: default '/'
});

//create and connect db
//fastify.decorate('dal', require('./DbAccess/db')());
fastify.decorate('dalRankingSchema', require('./DbAccess/RankingSchemaRepository')());
fastify.decorate('dalTournament', require('./DbAccess/TournamentRepository')());
fastify.decorate('dalTeam', require('./DbAccess/TeamRepository')());
fastify.decorate('dalGeneric', require('./DbAccess/GenericRepository')());
const cod = require('./cod');
const { triggerAsyncId } = require('async_hooks');

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
  return reply.view('./Generic/login.ejs', {loginError : false});
});

//login
fastify.get('/login', async (req, reply) => {
  return reply.view('./Generic/login.ejs', {loginError : false});
});

fastify.post('/login', async (req, reply) => {
  const data = req.body;
  const email = data.email;
  const password = sha256(data.password);
  const result = await fastify.dalGeneric.login(email, password);
  if(result){
    if(data.remember_me)
    {
      reply.setCookie('remember_me', true);
    }else
    {
      reply.setCookie('remember_me', false);
    }
    reply.setCookie('admin', result.admin);
    /*reply.setCookie('email_cod', result.email_cod);
    reply.setCookie('password', result.password);
    reply.setCookie('password_cod', result.password_cod);*/
    reply.setCookie('tag_username', result.tag_username);
    return reply.redirect('/home');
  }
  else
    return reply.view('./Generic/login.ejs', {loginError : true});
});

//registration
fastify.get('/registration', async (req, reply) => {
  return reply.view('./Generic/registration.ejs', {registrationError : ""});
});

fastify.post('/registration', async (req, reply) => {
  const data = req.body;
  //email
  if(data['email_cod'].length < 1)
  {
    reply.view('./Generic/registration.ejs', {registrationError : "email"});
    return;
  }
  //password
  if(data['password_cod'].length < 1)
  {
    reply.view('./Generic/registration.ejs', {registrationError : "password_cod"});
    return;
  }
  if(data['password'].length < 1)
  {
    reply.view('./Generic/registration.ejs', {registrationError : "password"});
    return;
  }
  //verify email
  if(await fastify.dalGeneric.verifyEmail(data['email_cod']))
  {
    reply.view('./Generic/registration.ejs', {registrationError : "exists_email"});
    return;
  }
  //testing connection
  const login = await cod.verifyLogin(data['email_cod'],data['password_cod']);
  if(login === 'success')
  {
    const uno = await cod.getUno();
    const tag_username = await cod.getTagUsername(data['platform']);
    const psw_sha256 = sha256(data['password'])
    const crypt = new Cryptr(psw_sha256);
    const psw_cod_aes = crypt.encrypt(data['password_cod']);

    var account = {
      uno,
      password : psw_sha256,
      emailCod : data.email_cod.toLowerCase(),
      passwordCod : psw_cod_aes,
    }

    var player = {
      tag_username,
      platform : data.platform, 
      uno
    }

    const result = await fastify.dalGeneric.registration(account, player);
    
    return result ? reply.redirect('/') : reply.view('./Generic/registration.ejs', {registrationError : "generic"});
  }else
  {
    reply.view('./Generic/registration.ejs', {registrationError : "failed"});
  }
});

//home
fastify.get('/home', async (req, reply) => {
  //tag
  const foundTeam = await fastify.dalTeam.checkPlayerIntoTeamBy(req.cookies.tag_username);
  return reply.view('./Generic/home.ejs', {cookie: req.cookies, foundTeam});
});

//management
fastify.get('/management', async (req, reply) => {
  const schemas = await fastify.dalRankingSchema.getRankingSchemas();
  const tournament = await fastify.dalTournament.getTournaments();
  return reply.view('./Generic/management.ejs', {schemas, tournament});
});

//create tournament 
fastify.get('/tournament', async (req, reply) => {
  const schemas = await fastify.dalRankingSchema.getRankingSchemas();
  return reply.view('./Tournament/createTournament.ejs', {rows: schemas});
});
fastify.post('/tournament', async (req, reply) => {
  const data = req.body;
  const result = await fastify.dalTournament.createTournament(data);
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
  const result = await fastify.dalTournament.getTournamentsById(id);
  const schemas = await fastify.dalRankingSchema.getRankingSchemas();
  reply.view("./Tournament/updateTournament.ejs", {rows: schemas, tournament: result});
});
fastify.post('/updateTournament', async (req, reply) => {
  const data = req.body;
  const result = await fastify.dalTournament.updateTournaments(data);
  if(!result) {
    reply.view({error : 'Operazione di creazione fallita'});
  } else {
    reply.redirect('/management');
  }
});
//delete tournament
fastify.get('/deleteTournament/:id', async (req, reply) => {
  const id = req.params.id;
  const result = await fastify.dalTournament.deleteTournaments(id);
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
  return reply.view('./RankingSchema/createRankingSchema.ejs');
});

fastify.post('/rankingSchema', async (req, reply) => {
  const data = req.body;

  const result = await fastify.dalRankingSchema.addRankingSchema(data);

  if(!result) {
    reply.view({error : 'Operazione di creazione fallita'});
  } else {
    reply.redirect('/management');
  }

});

//delete ranking schema
fastify.get('/deleteRankingSchema/:id', async (req, reply) => {
  const id = req.params.id;
  const result = await fastify.dalRankingSchema.deleteRankingSchema(id);
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
  const result = await fastify.dalRankingSchema.getRankingSchemaById(id);
  return reply.view("./RankingSchema/updateRankingSchema.ejs", {schemas: result});
});

fastify.post('/updateRankingSchema', async (req, reply) => {
  const data = req.body;
  
  const result = await fastify.dalRankingSchema.updateRankingSchema(data);
  if(!result) {
    reply.view({error : 'Operazione di creazione fallita'});
  } else {
    reply.redirect('/management');
  }
});

//createTeam
fastify.get('/createTeam', async (req, reply) => {
  return reply.view("./Team/createTeam.ejs", {tag_username: req.cookies.tag_username , error : false});
});
fastify.post('/createTeam', async (req, reply) => {
  const data = req.body;
  const tag_username = data.player1;
  let jsonPlayers = [];
  jsonPlayers.push({player : data.player1});

  //search if player exists 
  if(data.player2 != '')
  {
    let exists = await fastify.dalGeneric.checkTagUsername(data.player2);
    if(!exists)
    {
      return reply.view('./Team/createTeam.ejs',{error : 'Player '+ data.player2 + ' non esiste', tag_username});
    }else
    {
      jsonPlayers.push({player: data.player2});
    }
  }
  if(data.player3 != '')
  {
    let exists = await fastify.dalGeneric.checkTagUsername(data.player3);
    if(!exists)
    {
      return reply.view('./Team/createTeam.ejs', {error : 'Player '+ data.player3 + ' non esiste', tag_username})
    }else
    {
      jsonPlayers.push({player: data.player3});
    }
  }
  if(data.player4 != '')
  {
    let exists = await fastify.dalGeneric.checkTagUsername(data.player4);
    if(!exists)
    {
      return reply.view('./Team/createTeam.ejs', {error : 'Player '+ data.player4 + ' non esiste', tag_username})
    }else
    {
      jsonPlayers.push({player: data.player4});
    }
  }

  //search if players are already in a team
  const result = await fastify.dalTeam.checkPlayersIntoTeam(jsonPlayers);
  if(result)
  {
    return reply.view('./Team/createTeam.ejs', {error : 'Il Player '+result+' esiste già in un altro team' , tag_username});
  } else
  {
    const team = await fastify.dalTeam.createTeam(data.teamName, jsonPlayers);
    if(team === 'error')
      return reply.view('./Team/createTeam.ejs', {error : 'Esiste già un team con questo nome', tag_username})
    else if(team == null)
      return reply.view('./Team/createTeam.ejs', {error : 'Inserimento fallito', tag_username});
    reply.redirect('/home');
  }
});
//View Team
fastify.get('/viewTeam/:foundTeam', async (req, reply) => {
  const jsonPlayer = await fastify.dalTeam.getTeam(req.params.foundTeam);
  let boss = false;
  if(jsonPlayer.players.find(p => p.player === req.cookies.tag_username))
  {
    boss = true;
  }
  reply.view('./Team/viewTeam.ejs', {boss, jsonPlayer, error: false, nameTeam: req.params.foundTeam});
})
fastify.post('/viewTeam', (req, reply) => {
  reply.view('./Generic/globalRankings.ejs', {rankings : null});
})
//addPlayer
fastify.get('/addPlayer/:foundTeam', async (req, reply) => {
  reply.view('./Team/addPlayer.ejs', {error: false, nameTeam: req.params.foundTeam});
})
fastify.post('/addPlayer', async (req, reply) => {
  const data = req.body;
   //check username
  if(!await fastify.dalGeneric.checkTagUsername(data.player))
  {
    return reply.view('./Team/addPlayer.ejs', {error : 'player non esiste', nameTeam: data.nameTeam})
  }
  //check player into other team
  const result = await fastify.dalTeam.checkPlayersIntoTeam([{player: data.player}]);
  if(result)
  {
    return reply.view('./Team/addPlayer.ejs', {error : 'il player '+result+' esiste già in un altro team', nameTeam: data.nameTeam});
  } else
  {
    const jsonPlayers = await fastify.dalTeam.getTeam(data.nameTeam);
    //add player into new team
    jsonPlayers.players.push({player: data.player});
    const team = await fastify.dalTeam.updatePlayer(data.nameTeam, jsonPlayers.players);
    if(!team)
    {
      return reply.view('./Team/addPlayer.ejs', {error : 'Non è stato possibile aggiungere, riprova di nuovo!', nameTeam: data.nameTeam});
    }
    reply.redirect('/viewTeam/'+data.nameTeam);
  }
  reply.view('./Generic/globalRankings.ejs', {rankings : null});
})
//delete player
fastify.get('/removePlayer/:nameTeam/:player', async (req, reply) => {
  const team = await fastify.dalTeam.getTeam(req.params.nameTeam);
  if(team.players[0].player === req.cookies.tag_username)
  {
    let players = [], k=0;
    while (k < team.players.length)
    {
      if(!(team.players[k].player === req.params.player))
      {
        players.push(team.players[k]);
      }
      ++k;
    }
    //da pensare per gestire gli errori
    await fastify.dalTeam.updatePlayer(req.params.nameTeam, players);
    reply.redirect('/viewTeam/'+req.params.nameTeam);
  }else
  {
    reply.view('./Team/viewTeam.ejs', {error: 'NON SEI AUTORIZZATO'});
  }
})
//deleteTeam
fastify.get('/deleteTeam/:nameTeam', async (req, reply) => {
  const team = await fastify.dalTeam.getTeam(req.params.nameTeam);
  if(team.players[0].player === req.cookies.tag_username)
  {
    await fastify.dalTeam.deleteTeam(req.params.nameTeam);
    reply.redirect('/home');
  }else
  {
    reply.view('./Team/viewTeam.ejs', {error: 'NON SEI AUTORIZZATO'});
  }
})
//View Global Rankings By Date
fastify.get('/globalRankings', (req, reply) => {
  reply.view('./Generic/globalRankings.ejs', {rankings : null});
})

fastify.post('/globalRankings', async(req, reply) => {
  const date = req.body.tournamentDate;

  const rankings = await fastify.dalGeneric.getGlobalRankings(date);

  //manca calcolo punti e visualizzazione players
  if(!rankings) {
    return reply.view('./Generic/globalRankings.ejs', {rankings : null});
  } else {
    return reply.view('./Generic/globalRankings.ejs', {rankings});
  }

})

fastify.listen(3000, (err, address) => {
  if (err) throw err
  fastify.log.info(`server listening on ${address}`)
})
//variable global
const path = require('path');
const fs = require('fs');
//uuid for authToken 
const uuid = require('uuid');

//security
const sha256 = require("sha256");
const Cryptr = require('cryptr');
//password
const key = "yMtgjZ70*IQm%r@iv2S@$YOr";
//import css
const fastify = require('fastify')({
  logger: {
    level : 'info',
    patch : 'DataLog.log'
  }/*,
  http2: true,
  https: {
    allowHTTP1: true,
    key: fs.readFileSync(path.join(__dirname, '', 'https', 'private.key')),
    cert: fs.readFileSync(path.join(__dirname, '', 'https', 'certificate.cert'))
  }*/
});
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
fastify.decorate('dalRegistration', require('./DbAccess/RegistrationRepository')());
fastify.decorate('dalRegistrationTournaments', require('./DbAccess/RegistrationTournamentsRepository')());
fastify.decorate('dalGlobalRankings', require('./DbAccess/GlobalRankingsRepository')());
fastify.decorate('dalTeamRankings', require('./DbAccess/TeamRankingsRepository')());
fastify.decorate('Email', require('./Email/EmailRepository')());
//COD WZ API
fastify.decorate('cod', require('./APICaller/CodService')());

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
fastify.register(require('fastify-cookie'), {
  secret : 'mySecret'
});
fastify.addHook('onRequest', async (req, reply) => {
  req.log.info(Date.now() + 'richiesta');
  if(req.url === '/login' || req.url.startsWith('/requestResetPassword') || req.url.startsWith('/Public') || req.url === '/registration' || req.url.startsWith('/.well-known/pki-validation/')) 
    return;
  //if browser is in incognito it would be better to not edit user authToken in db
  if(req.cookies.authToken) {
    const user = await fastify.dalGeneric.getUserByToken(req.cookies.authToken);
    //if admin
    if(user)
    {
      if(user.admin == true)
      {
        if(req.url.startsWith('/'))
          return;
      }else
      {
        if(req.url.startsWith('/management') || req.url.startsWith('/tournament') || req.url.startsWith('/updateTournament') || req.url.startsWith('/deleteTournament') || req.url.startsWith('/rankingSchema') || req.url.startsWith('/deleteRankingSchema') || req.url.startsWith('/updateRankingSchema') || req.url.startsWith('/closeRegistrations') || req.url.startsWith('/endTournament'))
        {
          return reply.view('/CodeRequests/pages-401.ejs');
        }
        return;
      }
    }
  }
  return reply.redirect('/login');
});

fastify.get('/', async (req, reply) => {
  // if(req.cookies.authToken) {
  //   const user = await fastify.dalGeneric.getUserByToken(req.cookies.authToken);
  //   if(user)
  //     return;
  // }
  // return reply.view('./Generic/login.ejs', {loginError : false});
  return reply.redirect('/home');
});

//login
fastify.get('/login', async (req, reply) => {
  return reply.view('./Generic/login.ejs', {loginError : false});
});
//login
fastify.get('/logout', async (req, reply) => {
  reply.setCookie('authToken', {maxAge: 0});
  return reply.redirect("/");
});
fastify.post('/login', async (req, reply) => {
  const data = req.body;
  const email = data.email;
  const password = sha256(data.password);
  const result = await fastify.dalGeneric.login(email, password);
  let _MAXAGE = null;
  if(result){
    if(data.remember_me)
    {
      _MAXAGE = 60 * 60 * 1000;
    }
    reply.setCookie('admin', result.admin, 
    {
      maxAge: _MAXAGE
    });
    reply.setCookie('tag_username', result.tag_username,
    {
      maxAge: _MAXAGE
    });
    const authToken = uuid.v4();
    await fastify.dalGeneric.addToken(result.uno, authToken);
    reply.setCookie('authToken', authToken, {
      maxAge : _MAXAGE
    });
    req.log.info(`Logged ${result.tag_username}` );
    return reply.redirect('/home');
  }
  else{
    req.log.error(`${req.ip} tried to login`);
    return reply.view('./Generic/login.ejs', {loginError : true});
  }
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
  if(data['password'] !== data['password2'])
  {
    reply.view('./Generic/registration.ejs', {registrationError : "equalPassword"});
    return;
  }
  if(data['agree'] !== 'on')
  {
    reply.view('./Generic/registration.ejs', {registrationError : "agree"});
    return;
  }
  //verify email
  if(await fastify.dalGeneric.verifyEmail(data['email_cod']))
  {
    reply.view('./Generic/registration.ejs', {registrationError : "exists_email"});
    return;
  }
  //testing connection
  const login = await fastify.cod.verifyLogin(data['email_cod'],data['password_cod']);
  if(login === 'success')
  {
    const uno = await fastify.cod.getUno();
    const tag_username = await fastify.cod.getGamerTag(data['platform']);
    const psw_sha256 = sha256(data['password'])
    const crypt = new Cryptr(key);
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
  
  let registrated = false;
  let checkBoss = false;
  if(foundTeam)
  {
    registrated = await fastify.dalTeam.checkTeamRegistration(foundTeam);
  
    reply.setCookie('teamName', foundTeam);
    checkBoss = await fastify.dalTeam.checkIfBoss(foundTeam, req.cookies.tag_username);
  }
  return reply.view('./Generic/home.ejs', {boss : checkBoss, cookie: req.cookies, foundTeam, registrated});
});

//management
fastify.get('/management', async (req, reply) => {
  const schemas = await fastify.dalRankingSchema.getRankingSchemas();
  const tournaments = await fastify.dalTournament.getTournaments();

  if(!tournaments)
    return reply.view('./Generic/management.ejs', {schemas, tournament : null, cookies : req.cookies, closed : false});
  let tournamentsClosedOrNot = await Promise.all(tournaments.map(async t => {
    t.start_date = new Date(t.start_date).toISOString().split('T')[0];
    t.closed = await fastify.dalGeneric.checkRegistrations(t.id);
    return t;
  }));
  
  return reply.view('./Generic/management.ejs', {schemas, tournament : tournamentsClosedOrNot, cookies : req.cookies, closed : false});
});

//view registration
fastify.get('/management/:id', async (req, reply) => {
  const registratedTeamsID = await fastify.dalRegistrationTournaments.getRegistrationById(req.params.id);
  const teams = [];
  for(let pos in registratedTeamsID)
  {
    let jsonPlayers = await fastify.dalTeam.getTeam(registratedTeamsID[pos].teamid);
    let boss = jsonPlayers.players[0].player;
    teams.push({
      name : registratedTeamsID[pos].teamid,
      boss
    });
  }
  /*
  registratedTeamsID.forEach(async r => {
    let jsonPlayers = await fastify.dalTeam.getTeam(r.teamid);
    let boss = jsonPlayers.players[0].player;
    teams.push({
      name : r.teamid,
      boss
    });
  })*/
  return reply.view('./Registration/registrationViewTeams.ejs', {teams});
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
  }
  //check exits teams
  const check = await fastify.dalTeam.getTeam(data.teamName);
  if(!check)
  {
    await fastify.dalTeam.createTeam(data.teamName, jsonPlayers);
    return reply.redirect('/viewTeam/'+data.teamName);
  }else
  {
    return reply.view('./Team/createTeam.ejs', {error : 'Esiste già un team con questo nome', tag_username})
  }
});
//View Team
fastify.get('/viewTeam/:foundTeam', async (req, reply) => {
  const jsonPlayer = await fastify.dalTeam.getTeam(req.params.foundTeam);
  let boss = false;
  //fine player in team
  if(jsonPlayer.players.find(p => p.player === req.cookies.tag_username))
  {
    //find boss
    if(jsonPlayer.players[0].player === req.cookies.tag_username)
    {
      boss = true;
    }
    reply.view('./Team/viewTeam.ejs', {boss, jsonPlayer, error: false, nameTeam: req.params.foundTeam});
  }else
  {
    reply.view('./Team/viewTeam.ejs', {error: "NON SEI AUTORIZZATO"});
  }
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
//leave team
fastify.get('/leavePlayer/:nameTeam', async (req, reply) => {
  const team = await fastify.dalTeam.getTeam(req.params.nameTeam);
  if(team.players.find(p => p.player === req.cookies.tag_username))
  {
    let players = [], k=0;
    while (k < team.players.length)
    {
      if(!(team.players[k].player === req.cookies.tag_username))
      {
        players.push(team.players[k]);
      }
      ++k;
    }
    //da pensare per gestire gli errori
    await fastify.dalTeam.updatePlayer(req.params.nameTeam, players);
    reply.redirect('/home');
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
    reply.setCookie('teamName', {maxAge: 0});
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
  const rankings = await fastify.dalGlobalRankings.getGlobalRankings(date);
  //manca calcolo punti e visualizzazione players
  if(!rankings) {
    return reply.view('./Generic/globalRankings.ejs', {rankings : null});
  } else {
    return reply.view('./Generic/globalRankings.ejs', {rankings});
  }

})


//Registration
fastify.get('/registrateTeam', async(req, reply) => {
  const teamName = req.cookies.teamName;
  if(!teamName) {
    return reply.view('./Generic/home.ejs', {foundTeam : false, cookie : req.cookies, registrated : false});
  }

  let checkRegistration = await fastify.dalTeam.checkTeamRegistration(teamName);
  if(checkRegistration) {
    return reply.view('./Registration/registrateTeam.ejs', {error : 'Il team è già registrato ad un altro torneo!', teamName, tournaments: null})
  }

  const team = await fastify.dalTeam.getTeam(teamName);

  let count = team.players.length;
  let mode = null;
  if(count == 1)
    mode = 'uno';
  else if(count == 2)
    mode = 'duo';
  else if(count == 3)
    mode = 'trio';
  else
    mode = 'quad';
  

  const tournaments = await fastify.dalTournament.getActiveTournaments(mode);
  if(!tournaments)
    return reply.view('./Registration/registrateTeam.ejs', {error : null, teamName, tournaments});
  
  return reply.view('./Registration/registrateTeam.ejs', {error : null, teamName, tournaments});
})

fastify.post('/registrateTeam', async (req, reply) => {
  const teamName = req.body.teamName;
  const tournamentID = req.body.tournaments;
  
  const success = await fastify.dalRegistration.registrateTeam(teamName, tournamentID);

  if(success)
    reply.redirect('/home');
  
  const tournaments = await fastify.dalTournament.getActiveTournaments();
  return reply.view('./Registration/registrateTeam.ejs' , {error : 'Registrazione non riuscita, riprova' , teamName, tournaments })

})

fastify.get('/closeRegistrations/:id', async(req, reply) => {
  const tournamentID = req.params.id;

  const success = await fastify.dalRegistration.closeRegistrations(tournamentID);
  
  if(success)
    reply.redirect('/management');
  return `Errore nello svolgimento dell'operazione`;
})

fastify.get('/endTournament/:id', async(req, reply) => {
  const tournamentID = req.params.id;
  //get teams registrated to this tournament
  const registratedTeams = await fastify.dalRegistration.getRegistrations(tournamentID);
  const tournament = await fastify.dalTournament.getTournamentsById(tournamentID);
  const rankingSchema = await fastify.dalRankingSchema.getRankingSchemaById(tournament.id_schema)

  if(!registratedTeams)
    reply.redirect('/management');

    let teamResultsGlobal = {teams:[]};
    let teamResultsPrivate = {teams:[]};
    //temporany
    let jsonTeam = [];
  //calculate team rankings foreach team
  for (let i = 0; i < registratedTeams.length; i++) {
    //json
    teamResultsGlobal.teams.push({
      teamName : registratedTeams[0].teamid,
      totalPoints : null,
      tournamentPlace : null,
      matches:[]
    });
    //get players
    let team = await fastify.dalTeam.getTeam(registratedTeams[i].teamid);
    //put into for verify players
    jsonTeam.push({name: registratedTeams[0].teamid, players: team.players});
    //
    let players = team.players;
    //insert json
    for (let x = 0; x < players.length; x++) {
      let username = players[x].player;

      //get credentials
      let encryptedCredentials = await fastify.dalGeneric.getPlayerCredentials(username);
      const crypt = new Cryptr(key);
      const email = encryptedCredentials.codemail;
      const uno = encryptedCredentials.uno;
      const plainCodPsw = crypt.decrypt(encryptedCredentials.codpsw);
      req.log.info(email)
      //login with credentials
      let result = await fastify.cod.getMatches(email ,plainCodPsw, uno);
      if(!result || result.matches === undefined)
        continue; //error, reopen tournament or retry
      if(teamResultsGlobal.teams[teamResultsGlobal.teams.length -1].matches.length > 0)
      {
        for(let z=0; z<teamResultsGlobal.teams[teamResultsGlobal.teams.length -1].matches.length; z++)
        {
          //matching
          for (let k = 0; k < result.matches.length; k++) 
          {
            let matchResults = {};
            if(teamResultsGlobal.teams[teamResultsGlobal.teams.length -1].matches[z].matchID === result.matches[k].matchID){
                //check gulag
                if(rankingSchema.gulag)
                {
                  matchResults = {
                    username : username,
                    kills : result.matches[k].playerStats.kills,
                    killPoints: (result.matches[k].playerStats.kills * rankingSchema.kill),
                    //details: result.matches[k]
                  }
                }else
                {
                  matchResults = {
                      username : username,
                      kills : result.matches[k].playerStats.kills - result.matches[k].playerStats.gulagKills,
                      killPoints: result.matches[k].playerStats.kills * rankingSchema.kill,
                      //details: result.matches[k]
                    }
                }
                let players = {
                  username : username, 
                  details: result.matches[k]
                }
                teamResultsPrivate.teams[teamResultsGlobal.teams.length -1].matches[z].players.push(players);
                //insert teamRankings
                teamResultsGlobal.teams[teamResultsGlobal.teams.length -1].matches[z].players.push(matchResults);
                teamResultsGlobal.teams[teamResultsGlobal.teams.length -1].matches[z].totalPointsMatch = (teamResultsGlobal.teams[teamResultsGlobal.teams.length -1].matches[z].totalPointsMatch + matchResults.killPoints);
            }
          }
        }
      }else
      {
        teamResultsPrivate.teams[teamResultsGlobal.teams.length -1] = {nameTeam: registratedTeams[i].teamid, matches: []}
        //matching
        for (let k = 0; k < result.matches.length; k++) 
        {
          let matchResults = {};
          var timeMatch = new Date(result.matches[k].utcStartSeconds * 1000).toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome' });
          var dateMatch = new Date(result.matches[k].utcStartSeconds * 1000).toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' });
          var startTimeTournament = tournament.start_time;
          var endTimeTournament = tournament.end_time;
          var dateTournament = new Date(tournament.start_date).toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' });

          req.log.info("dateMatch: "+dateMatch);
          req.log.info("dateTournament: "+dateTournament);
          
          req.log.info("TimeMatch: "+timeMatch);
          req.log.info("TimeTournament: "+startTimeTournament+" - "+endTimeTournament);

          req.log.info("true o false-includes: "+result.matches[k].mode.includes(tournament.mode));
          if(dateMatch === dateTournament){
            if(Date.parse('01/01/2011 ' + timeMatch) >= Date.parse('01/01/2011 ' + startTimeTournament) && Date.parse('01/01/2011 ' + timeMatch) <= Date.parse('01/01/2011 ' + endTimeTournament) && result.matches[k].mode.includes(tournament.mode)){
              //check gulag
              if(rankingSchema.gulag)
              {
                matchResults = {
                  username : username,
                  kills : result.matches[k].playerStats.kills,
                  killPoints: (result.matches[k].playerStats.kills * rankingSchema.kill),
                  //details: result.matches[k]
                }
              }else
              {
                matchResults = {
                    username : username,
                    kills : result.matches[k].playerStats.kills - result.matches[k].playerStats.gulagKills,
                    killPoints: result.matches[k].playerStats.kills * rankingSchema.kill,
                    //details: result.matches[k]
                  }
              }
              let players = {
                username : username, 
                details: result.matches[k]
              }
              teamResultsPrivate.teams[teamResultsGlobal.teams.length -1].matches.push({
                matchID: result.matches[k].matchID,
                players: [players]});
              //ranking points
              let bonus = 0;
              if(result.matches[k].playerStats.teamPlacement == 1)
              {
                bonus = rankingSchema.points_top1;
              }else if(result.matches[k].playerStats.teamPlacement == 2)
              {
                bonus = rankingSchema.points_top2;
              }else if(result.matches[k].playerStats.teamPlacement == 3)
              {
                bonus = rankingSchema.points_top3;
              }else if(result.matches[k].playerStats.teamPlacement > 3 && result.matches[k].playerStats.teamPlacement <= 5)
              {
                bonus = rankingSchema.points_top5;
              }else if(result.matches[k].playerStats.teamPlacement > 5 && result.matches[k].playerStats.teamPlacement <= 10)
              {
                bonus = rankingSchema.points_top10;
              }else if(result.matches[k].playerStats.teamPlacement > 10 && result.matches[k].playerStats.teamPlacement <= 15)
              {
                bonus = rankingSchema.points_top15;
              }else if(result.matches[k].playerStats.teamPlacement > 15 && result.matches[k].playerStats.teamPlacement <= 20)
              {
                bonus = rankingSchema.points_top20;
              }
              //insert teamRankings
              teamResultsGlobal.teams[teamResultsGlobal.teams.length -1].matches.push({
                teamPlacement: result.matches[k].playerStats.teamPlacement,
                bonus: bonus,
                matchID: result.matches[k].matchID,
                players: [matchResults],
                totalPointsMatch: (matchResults.killPoints +  bonus)
              });
            }
          }
        }
      }
      req.log.info(teamResultsGlobal);
      req.log.info(teamResultsPrivate);
    }
  }
  //END
  req.log.info(teamResultsGlobal);
  req.log.info(teamResultsPrivate);
  let tournamentPlace = [];
  //select only 3 match and ranking
  for (let i = 0; i < registratedTeams.length; i++) {
    let maxArray = []
    for (let k = 0; k < teamResultsGlobal.teams[i].matches.length; k++) {
      if(maxArray.length < 3)
      {
        maxArray.push({
          matchID: teamResultsGlobal.teams[i].matches[k].matchID,
          totalPointsMatch: teamResultsGlobal.teams[i].matches[k].totalPointsMatch
        });
      }else
      {
        let min = -1;
        for(let z=0; z<maxArray.length; z++)
        {
          if((teamResultsGlobal.teams[i].matches[k].totalPointsMatch > maxArray[z].totalPointsMatch && min == -1) || (min != -1 && maxArray[min].totalPointsMatch > maxArray[z].totalPointsMatch))
          {
            min = z;
          }
        }
        if(min != -1)
        {
          maxArray[min] = {
            matchID: teamResultsGlobal.teams[i].matches[k].matchID,
            totalPointsMatch: teamResultsGlobal.teams[i].matches[k].totalPointsMatch
          };
        }
      }
    }
    req.log.info(maxArray);
    //delete team by Results global if they don't 3 matchs
    if(maxArray.length < 3)
    {
      teamResultsGlobal.teams.splice(i,1);
      continue;
    }
    //remove match
    for (let k = 0; k < teamResultsGlobal.teams[i].matches.length; k++) {
      let remove = true;
      for(let z=0; z<maxArray.length; z++)
      {
        if(maxArray[z].matchID === teamResultsGlobal.teams[i].matches[k].matchID)
        {
          teamResultsGlobal.teams[i].totalPoints += teamResultsGlobal.teams[i].matches[k].totalPointsMatch
          remove = false;
        }
      }
      if(remove)
      {
        teamResultsGlobal.teams[i].matches.splice(k,1);
        k=-1;
      }
    }
    //tournamentPlace only insert
    tournamentPlace.push({teamName: teamResultsGlobal.teams[i].teamName, totalPoints: teamResultsGlobal.teams[i].totalPoints});
  }
  //tournamentPlace.push({teamName: "a", totalPoints: 10});
  //tournamentPlace.push({teamName: "b", totalPoints: 12});
  //tournamentPlace order and set position in rainking
  tournamentPlace.sort(function(a,b)
  {
    return b.totalPoints - a.totalPoints;
  });
  for(let i=0; i<teamResultsGlobal.teams.length; i++)
  {
    for(let k=0; k<tournamentPlace.length; k++)
    {
      if(teamResultsGlobal.teams[i].teamName === tournamentPlace[k].teamName)
      {
        teamResultsGlobal.teams[i].tournamentPlace = k+1;
      }
    }
  }
  req.log.info(teamResultsGlobal);
  req.log.info(teamResultsPrivate);
  //close tournament
  const closed = await fastify.dalTournament.closeTournament(tournamentID);
  if(!closed)
    reply.redirect('/management');
  //insert into db
  const rs = await fastify.dalGlobalRankings.insertGlobalRankings(teamResultsGlobal, tournamentID);
  req.log.info("insertGlobalRankings: "+rs);
  for(let i=0; i<teamResultsPrivate.teams.length; i++)
  {
    const result = await fastify.dalTeamRankings.insertTeamRankings(teamResultsPrivate.teams[i].nameTeam, teamResultsPrivate.teams[i], tournamentID);
    req.log.info("insertTeamRankings: "+result);
  }
  reply.redirect('/management');
})

/*function findNameIntoTeam(jsonTeam, teams)
{  
  for(let x=0; x<jsonTeam.length; x++)
  {
    if(jsonTeam[x].name === teams.teamName)
    {
      let count = 0, pos=0;
      for(let k=0; k<jsonTeam[x].players.length; k++)
      {
        pos = k;
        for(let i=0; i<teams.players.length; i++)
        {
          if(jsonTeam[x].players[k] === teams.players[i])
          {
            ++count;
          }
        }
      }
      if(teams.players.length === pos)
      {
        return true;
      }else
      {
        return false;
      }
    }
  }
}*/

//View Global Rankings By Date
fastify.get('/requestResetPassword', (req, reply) => {
  reply.view('./ResetPassword/RequestResetPassword.ejs');
})
fastify.post('/requestResetPassword', async (req, reply) => {
  const data = req.body;
  const authTokenResetPassword = uuid.v4();
  const rs = await fastify.dalGeneric.addTokenResetPassword(data['email'], authTokenResetPassword);
  if(rs)
  {
    await fastify.Email.sendMail(data['email'], authTokenResetPassword);
  }
  reply.redirect("/home");
})
fastify.get('/requestResetPassword/:token', async (req, reply) => {
  const authTokenResetPassword = req.params.token;
  const rs = await fastify.dalGeneric.ValidTokenResetPassword(authTokenResetPassword);
  if(rs)
  {
    return reply.view('./ResetPassword/ResetPassword.ejs', {error: "", authTokenResetPassword, uno: rs.uno});
  }
  return reply.view('./ResetPassword/ResetPassword.ejs', {error: "401", authTokenResetPassword: "", uno: ""});
})
fastify.post('/requestResetPassword/:token', async (req, reply) => {
  const authTokenResetPassword = req.params.token;
  const data = req.body;
  try {
    if(data['password'] === data['password2'])
    {
      const psw_sha256 = sha256(data['password']);
      const rs = await fastify.dalGeneric.changePassword(psw_sha256, data['uno']);
      const success = await fastify.dalGeneric.deleteResetToken(data['uno']);
      reply.redirect("/home");
    }
    return reply.view('./ResetPassword/ResetPassword.ejs', {error: "password", authTokenResetPassword, uno: data['uno']});
  } catch (err) {
    fastify.log.error(err);
    return reply.view('./ResetPassword/ResetPassword.ejs', {error: "generic", authTokenResetPassword: "", uno: ""});
  }
  
})
//certificate
fastify.get('/.well-known/pki-validation/FACEDD5B1AC62B51ABC2851AFAB1FD9A.txt', async (req, reply) => {
  return reply.view('FACEDD5B1AC62B51ABC2851AFAB1FD9A.txt');
})
fastify.listen(80, '0.0.0.0', (err, address) => {
  if (err) throw err
  fastify.log.info(`server listening on ${address}`)
})
const ConnectionClient = require('./connection');

const dalTeam = () =>
{
    //check if player already has a team
    const checkPlayerIntoTeamBy = async(tagUsername) => {
      const client = new ConnectionClient();
      const result = await client.query('SELECT * FROM teams');
      for(let k in result.rows) {
        if(result.rows[k].players.find(p => p.player === tagUsername))
            return result.rows[k].name;
          
        }
      return false;
    }

    //check if  players are into team
    const checkPlayersIntoTeam = async(jsonPlayers) => {
      const client = new ConnectionClient();

      try {
        const result = await client.query('SELECT * FROM teams');
      //Funzionante
      for (let z in jsonPlayers)
      {
        for(let k in result.rows) {
          if(result.rows[k].players.find(p => p.player === jsonPlayers[z].player))
              return jsonPlayers[z].player;
          }
      }
      return false;
      } catch (error) {
        
      }
      finally {
        client.end();
      }
      
    }

    //check if a team already participates
    const checkTeamRegistration = async(teamName) => {
      const client = new ConnectionClient();
      const result = await client.query(`SELECT * FROM registrations WHERE teamid = $1`, [teamName]);
      client.end();
      return result.rowCount > 0 ? true : null;
    }

    //check if  players are into team
    const getTeam = async(name) => {
      const client = new ConnectionClient();
      const result = await client.query('SELECT players FROM teams WHERE name = $1',[name]);
      client.end();
      return result.rowCount > 0 ? result.rows[0] : null;
      /*//Funzionante
      if(result.rows[0].players.find(p => p.player === player))
          return true;
      return false;*/
    }

    const checkIfBoss = async(teamName, playerTag) => {
      const jsonPlayers = await getTeam(teamName);
      const bossTag = jsonPlayers.players[0].player;
      
      return bossTag === playerTag ? true : false;
    }

    //create team
    const createTeam = async(teamName, jsonPlayers) => {
      const client = new ConnectionClient();
      try {
          const result = await client.query('INSERT INTO teams VALUES ($1, $2) RETURNING *', [teamName, JSON.stringify(jsonPlayers)]);
          return result.rowCount > 0 ? result.rows[0] : null;
      } catch (error) {
        return 'error';
      } finally {
        client.end();
      }
    }
    //create team
    const updatePlayer = async(teamName, jsonPlayers) => {
      const client = new ConnectionClient();
      try {
          const result = await client.query('UPDATE teams SET players = $1 WHERE name = $2 RETURNING *', [JSON.stringify(jsonPlayers), teamName]);
          return result.rowCount > 0 ? result.rows[0] : null;
      } catch (error) {
        return 'error';
      } finally {
        client.end();
      }
    }
    //create team
    const deleteTeam = async(teamName) => {
      const client = new ConnectionClient();
      try {
          const result = await client.query('DELETE FROM teams WHERE name = $1 RETURNING *', [teamName]);
          return result.rowCount > 0 ? result.rows[0] : null;
      } catch (error) {
        return 'error';
      } finally {
        client.end();
      }
    }
    return{
      checkPlayerIntoTeamBy,
      checkPlayersIntoTeam,
      checkTeamRegistration,
      checkIfBoss,
      getTeam,
      updatePlayer,
      createTeam,
      deleteTeam
    }
}

module.exports = dalTeam;
const ConnectionClient = require('./connection');

const dalTeamRankings = () => 
{
      //insert globalRankings
    const insertTeamRankings = async (teamid, teamresults, idTournament) => {
        try
        {
          const client = new ConnectionClient();
          const result = await client.query('INSERT INTO teamrankings (id, teamid, teamresults) values ($1, $2, $3) RETURNING *', [idTournament, teamid, teamresults]);
          return result.rows.length > 0 ? result.rows : null;
        }catch(error)
        {
          console.log(error);
        }finally
        {
          client.end();
        }
      }
    return{
        insertTeamRankings
    }
}
module.exports = dalTeamRankings;
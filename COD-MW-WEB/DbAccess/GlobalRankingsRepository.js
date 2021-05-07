const ConnectionClient = require('./connection');

const dalGlobalRankings = () =>
{
    //insert globalRankings
    const insertGlobalRankings = async (jsonTeams, idTournament) => {
      const client = new ConnectionClient();
        try
        {
          const result = await client.query('INSERT INTO globalrankings (id, teams) values ($1, $2) RETURNING *', [idTournament, jsonTeams]);
          return result.rows.length > 0 ? result.rows : null;
        }catch(error)
        {
          console.log(error);
        }finally
        {
          client.end();
        }
      }
    //get global ranking by date
    const getGlobalRankings = async(startDate) => {
      const client = new ConnectionClient();
        try
        {
          const result = await client.query('SELECT * from globalrankings g JOIN tournaments t ON (t.id = g.id) WHERE t.start_date = $1 AND finished = true', [startDate]);
          return result.rowCount > 0 ? result.rows[0] : null;
        }catch(error)
        {
          console.log(error);
        }finally
        {
          client.end();
        }
      
      }
    return{
        insertGlobalRankings,
        getGlobalRankings
    }
}

module.exports = dalGlobalRankings;
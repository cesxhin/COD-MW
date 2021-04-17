const ConnectionClient = require('./connection');

const dalTeamRankings = () => 
{
      //insert globalRankings
    const insertTeamRankings = async (teamid, teamresults, idTournament) => {
        const client = new ConnectionClient();
        const result = await client.query('INSERT INTO teamrankings (id, teamid, teamresults) values ($1, $2, $3) RETURNING *', [idTournament, teamid, teamresults]);
        client.end();
        return result.rows.length > 0 ? result.rows : null;
      }
    return{
        insertTeamRankings
    }
}
module.exports = dalTeamRankings;
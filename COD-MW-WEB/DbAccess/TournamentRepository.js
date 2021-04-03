const ConnectionClient = require('./connection');
const dalTournament = () =>
{
    //create tournament
    const createTournament = async (tournaments) => {
      const client = new ConnectionClient();
      const result = await client.query('INSERT INTO tournaments (start_date, start_time, number_matches, id_schema) values ($1, $2, $3, $4)  RETURNING *', [tournaments.start_date, tournaments.start_time, tournaments.number_matches, tournaments.id_schema]);
      client.end();
      return result.rows.length > 0 ? result.rows[0] : null;
    }

    //get tournaments
    const getTournaments = async () => {
      const client = new ConnectionClient();
      const result = await client.query('SELECT * FROM tournaments ORDER BY id ASC');
      client.end();
      return result.rows.length > 0 ? result.rows : null;
    }
    //get by id tournaments
    const getTournamentsById = async (id) => {
      const client = new ConnectionClient();
      const result = await client.query('SELECT * FROM tournaments WHERE id = $1', [id]);
      client.end();
      return result.rows.length > 0 ? result.rows[0] : null;
    }
    //update tournaments
    const updateTournaments = async (tournaments) => {
      const client = new ConnectionClient();
      const result = await client.query('UPDATE tournaments SET start_date=$1, start_time=$2, number_matches=$3, id_schema=$4 WHERE id = $5 RETURNING *',[tournaments.start_date, tournaments.start_time, tournaments.number_matches, tournaments.id_schema, tournaments.id]);
      client.end();
      return result.rows.length > 0 ? result.rows[0] : null;
    }
    //delete tournaments
    const deleteTournaments = async (id) => {
      const client = new ConnectionClient();
      try
      {
        await client.query('DELETE FROM tournaments WHERE id = $1', [id]);
        client.end();
        return;
      }catch
      {
        return 'generic'
      }
    }

    return{      
      createTournament,
      getTournaments,
      getTournamentsById,
      deleteTournaments,
      updateTournaments
    }
}

module.exports = dalTournament;
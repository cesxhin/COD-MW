const ConnectionClient = require('./connection');
const dalTournament = () =>
{
    //create tournament
    const createTournament = async (tournament) => {
      const client = new ConnectionClient();
      const modeNumbers = await client.query('SELECT playersNumber FROM rankingSchemas WHERE id = $1', [tournament.id_schema]);
      let mode = null;
      switch (modeNumbers.rows[0].playersnumber) {
        case 1:
          mode = 'uno';
          break;
        case 2:
          mode = 'duo';
          break;
        case 3:
          mode = 'trio';
          break;
        case 4:
          mode = 'quad';
          break;
        default:
          break;
      }
      const result = await client.query('INSERT INTO tournaments (start_date, start_time, end_time, id_schema, mode) values ($1, $2, $3, $4, $5) RETURNING *', [tournament.start_date, tournament.start_time, tournament.end_time, tournament.id_schema, mode]);
      client.end();
      return result.rows.length > 0 ? result.rows[0] : null;
    }

    //get tournaments
    const getTournaments = async () => {
      const client = new ConnectionClient();
      const result = await client.query('SELECT * FROM tournaments WHERE finished = false ORDER BY id ASC');
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

    //get active tournaments by mode (duo, trio, quad)
    const getActiveTournaments = async(mode) => {
      const client = new ConnectionClient();
      const result = await client.query(`SELECT * FROM tournaments WHERE finished = false AND mode = $1`, [mode]);
      client.end();
      //dovrebbe essere uno solo in teoria quindi sarebbe più corretto ritornare result.rows[0]
      return result.rowCount > 0 ? result.rows[0] : null;
    }
    //update tournaments
    const updateTournaments = async (tournaments) => {
      const client = new ConnectionClient();
      const result = await client.query('UPDATE tournaments SET start_date=$1, start_time=$2, end_time=$3, id_schema=$4 WHERE id = $5 RETURNING *',[tournaments.start_date, tournaments.start_time, tournaments.end_time, tournaments.id_schema, tournaments.id]);
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

    //close tournament by id
    const closeTournament = async(id) => {
      const client = new ConnectionClient();
      const result = await client.query(`UPDATE tournaments SET finished = true 
                                        WHERE id = $1 RETURNING *`, [id]);
      client.end();

      return result.rowCount > 0 ? true : false;
    }

    return{      
      createTournament,
      getTournaments,
      getActiveTournaments,
      getTournamentsById,
      deleteTournaments,
      updateTournaments,
      closeTournament
    }
}

module.exports = dalTournament;
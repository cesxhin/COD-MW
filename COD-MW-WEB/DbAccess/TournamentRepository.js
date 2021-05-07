const ConnectionClient = require('./connection');
const dalTournament = () =>
{
    //create tournament
    const createTournament = async (tournament) => {
      try
      {
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
        return result.rows.length > 0 ? result.rows[0] : null;
      }catch(error)
      {
        console.log(error);
      }finally
      {
        client.end();
      }
    }

    //get tournaments
    const getTournaments = async () => {
      try
      {
        const client = new ConnectionClient();
        const result = await client.query('SELECT * FROM tournaments WHERE finished = false ORDER BY id ASC');
        return result.rows.length > 0 ? result.rows : null;
      }catch(error)
      {
        console.log(error);
      }finally
      {
        client.end();
      }
    }
    //get by id tournaments
    const getTournamentsById = async (id) => {
      try
      {
        const client = new ConnectionClient();
        const result = await client.query('SELECT * FROM tournaments WHERE id = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
      }catch(error)
      {
        console.log(error);
      }finally
      {
        client.end();
      }
    }

    //get active tournaments by mode (duo, trio, quad)
    const getActiveTournaments = async(mode) => {
      try
      {
        const client = new ConnectionClient();
        const result = await client.query(`SELECT * FROM tournaments WHERE finished = false AND mode = $1`, [mode]);
        //dovrebbe essere uno solo in teoria quindi sarebbe più corretto ritornare result.rows[0]
        return result.rowCount > 0 ? result.rows[0] : null;
      }catch(error)
      {
        console.log(error);
      }finally
      {
        client.end();
      }
    }
    //update tournaments
    const updateTournaments = async (tournaments) => {
      try
      {
        const client = new ConnectionClient();
        const result = await client.query('UPDATE tournaments SET start_date=$1, start_time=$2, end_time=$3, id_schema=$4 WHERE id = $5 RETURNING *',[tournaments.start_date, tournaments.start_time, tournaments.end_time, tournaments.id_schema, tournaments.id]);
        return result.rows.length > 0 ? result.rows[0] : null;
      }catch(error)
      {
        console.log(error);
      }finally
      {
        client.end();
      }
    }
    //delete tournaments
    const deleteTournaments = async (id) => {
      const client = new ConnectionClient();
      try
      {
        await client.query('DELETE FROM tournaments WHERE id = $1', [id]);
        return;
      }catch
      {
        return 'generic'
      }finally
      {
        client.end();
      }
    }

    //close tournament by id
    const closeTournament = async(id) => {
      try
      {
        const client = new ConnectionClient();
        const result = await client.query(`UPDATE tournaments SET finished = true 
                                          WHERE id = $1 RETURNING *`, [id]);
        return result.rowCount > 0 ? true : false;
      }catch(error)
      {
        console.log(error);
      }finally
      {
        client.end();
      }
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
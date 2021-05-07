const ConnectionClient = require('./connection');

const dalRegistrationTournaments = () =>
{
    //get registration teams by id tournament
    const getRegistrationById = async(id) => {
      try
      {
        const client = new ConnectionClient();
        const result = await client.query('SELECT teamID FROM registrations WHERE tournamentID = $1 ', [id]);
        return result.rowCount > 0 ? result.rows : null;
      }catch(error)
      {
        console.log(error);
      }finally
      {
        client.end();
      }
    }
    return{
        getRegistrationById
    }
}

module.exports = dalRegistrationTournaments;
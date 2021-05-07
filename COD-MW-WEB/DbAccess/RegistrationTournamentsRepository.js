const ConnectionClient = require('./connection');

const dalRegistrationTournaments = () =>
{
    //get registration teams by id tournament
    const getRegistrationById = async(id) => {
      const client = new ConnectionClient();
      const result = await client.query('SELECT teamID FROM registrations WHERE tournamentID = $1 ', [id]);
      client.end();
      return result.rowCount > 0 ? result.rows : null;
    }
    return{
        getRegistrationById
    }
}

module.exports = dalRegistrationTournaments;
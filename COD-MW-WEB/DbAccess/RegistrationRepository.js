const ConnectionClient = require('./connection');

const dalRegistration = () => {

    const registrateTeam = async(team, tournament) => {
        const client = new ConnectionClient();
        const result = await client.query(`INSERT INTO registrations (teamid, tournamentid) VALUES ($1, $2) RETURNING * `, [team, tournament]);
        client.end();
        return result.rowCount > 0 ? result.rows[0] : null;
    }

    const closeRegistrations = async(tournament) => {
        const client = new ConnectionClient();
        const result = await client.query('UPDATE registrations SET closed = true WHERE tournamentID = $1', [tournament]);
        client.end();
        return result.rowCount > 0 ? true : false;
    }
    
    //get participating teams to a precise tournament
    const getRegistrations = async(tournament) => {
        const client = new ConnectionClient();
        const result = await client.query('SELECT teamID FROM registrations WHERE closed = true AND tournamentid = $1', [tournament]);
        client.end();
        return result.rowCount > 0 ? result.rows : null;
    }
    return {
        registrateTeam,
        closeRegistrations,
        getRegistrations
    }
}

module.exports = dalRegistration;
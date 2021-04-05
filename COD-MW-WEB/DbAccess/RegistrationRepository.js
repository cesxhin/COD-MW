const ConnectionClient = require('./connection');

const dalRegistration = () => {

    const registrateTeam = async(team, tournament) => {
        const client = new ConnectionClient();
        const result = await client.query(`INSERT INTO registrations (teamid, tournamentid) VALUES ($1, $2) RETURNING * `, [team, tournament]);
        await client.query('UPDATE teams SET participates = true WHERE name = $1', [team]);
        client.end();
        return result.rowCount > 0 ? result.rows[0] : null;
    }

    const closeRegistrations = async(tournament) => {
        const client = new ConnectionClient();
        const result = await client.query('UPDATE registrations SET closed = true WHERE tournamentID = $1', [tournament]);
        client.end();
        return result.rowCount > 0 ? true : false;
    }
    return {
        registrateTeam,
        closeRegistrations
    }
}

module.exports = dalRegistration;
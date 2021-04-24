const ConnectionClient = require('./connection');

const dalGeneric = () =>
{
    const pg = require('pg');
    const getClient = () =>{
        const client = new pg.Client(config);

        client.connect(err => {
          if (err) {
            console.error('connection error', err.stack)
          } else {
            console.log('connected')
          }
        })
        return client;
    }

    //login
    const login = async (email, password) =>{
      const client = new ConnectionClient();
      const result = await client.query('SELECT * FROM account as a JOIN players as p ON (a.uno = p.uno) WHERE a.email_cod = $1 AND a.password = $2', [email.toLowerCase(), password]);
      client.end();
      return result.rows.length > 0 ? result.rows[0] : null;
    }

    //get user by  auth token
    const getUserByToken = async(token) => {
      const client = new ConnectionClient();
      const result = await client.query(`SELECT * FROM account WHERE authToken = $1`, [token]);
      client.end();
      return result.rowCount > 0 ? result.rows[0] : null;
    }

    //add / edit auth token to user
    const addToken = async(uno, token) => {
      const client = new ConnectionClient();
      const result = await client.query(`UPDATE account SET authToken = $2 WHERE uno = $1`, [uno, token]);
      client.end();
      return result.rowCount > 0 ? result.rows[0] : null;
    }

    //registration
    const registration = async (account, player) =>{
      const client = new ConnectionClient();
      try {
        const accountResult = await client.query('INSERT INTO account VALUES ($1, $2, $3, $4, false) RETURNING *', [account.uno, account.password, account.emailCod, account.passwordCod]);
        const playerResult = await client.query('INSERT INTO players VALUES ($1, $2, $3) RETURNING *', [player.tag_username, player.platform, player.uno]);
        return accountResult.rows.length > 0 && playerResult.rows.length > 0 ? accountResult.rows[0] : null;
      } catch (error) {
        return null;
      } finally {
        client.end();
        console.log('ended connection');
      }
    }

    //verify equal email
    const verifyEmail = async (emailCod) =>{
      const client = new ConnectionClient();
      const result = await client.query('SELECT * FROM account where email_cod = $1', [emailCod.toLowerCase()]);
      client.end();
      return result.rows.length > 0 ? true : false;
    }

    //get exists tag_username
    const checkTagUsername = async (tagUsername) =>{
      const client = new ConnectionClient();
      const result = await client.query('SELECT * FROM players where tag_username = $1', [tagUsername]);
      client.end();
      return result.rowCount > 0 ? true : false;
    }

    //check closed registrations
    const checkRegistrations = async(tournamentID) => {
      const client = new ConnectionClient();
      const result = await client.query(`SELECT closed FROM registrations WHERE tournamentID = $1 AND closed = true limit 1`, [tournamentID]);
      client.end();
      return result.rowCount > 0 ? true : false;
    }

    //get information player
    const getPlayerCredentials = async(username) => {
      const client = new ConnectionClient();
      const result = await client.query(`SELECT a.email_cod AS codEmail, a.password_cod AS codPsw, a.password AS psw, a.uno FROM account a JOIN players p ON (a.uno = p.uno) where p.tag_username = $1`, [username]);
      client.end();
      return result.rowCount > 0 ? result.rows[0] : null;
    }
    //add / edit auth token to user
    const addTokenResetPassword = async(email, token) => {
      const client = new ConnectionClient();
      const result = await client.query(`UPDATE account SET authTokenResetPassw = $2 WHERE email_cod = $1 RETURNING *`, [email, token]);
      client.end();
      return result.rowCount > 0 ? result.rows[0] : null;
    }
    //add / edit auth token to user
    const ValidTokenResetPassword = async(token) => {
      const client = new ConnectionClient();
      const result = await client.query(`SELECT uno FROM account WHERE authTokenResetPassw=$1`, [token]);
      client.end();
      return result.rowCount > 0 ? result.rows[0] : null;
    }
    //add / edit auth token to user
    const changePassword = async(password, uno) => {
      const client = new ConnectionClient();
      const result = await client.query(`UPDATE account SET password = $2 WHERE uno = $1 RETURNING *`, [uno, password]);
      client.end();
      return result.rowCount > 0 ? result.rows[0] : null;
    }
    return{
      login,
      addToken,
      getUserByToken,
      registration,
      verifyEmail,
      checkTagUsername,
      checkRegistrations,
      getPlayerCredentials,
      addTokenResetPassword,
      ValidTokenResetPassword,
      changePassword
    }
}

module.exports = dalGeneric;
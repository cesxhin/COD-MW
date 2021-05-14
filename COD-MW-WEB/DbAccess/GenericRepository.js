const ConnectionClient = require('./connection');
const winston = require('winston');

const generic = winston.loggers.get('generic');

const dalGeneric = () =>
{
    const pg = require('pg');
    //login
    const login = async (email, password) =>{
      const client = new ConnectionClient();
      try {
        const result = await client.query('SELECT * FROM account as a JOIN players as p ON (a.uno = p.uno) WHERE a.email_cod = $1 AND a.password = $2', [email.toLowerCase(), password]);
        return result.rows.length > 0 ? result.rows[0] : null;
      } catch (err) {
        generic.error(err);
        return 'generic';
      }
      finally {
        client.end();
      }
    }

    //get user by  auth token
    const getUserByToken = async(token) => {
      const client = new ConnectionClient();
      try {
        const result = await client.query(`SELECT * FROM account WHERE authToken = $1`, [token]);
        return result.rowCount > 0 ? result.rows[0] : null;
      } catch (err) {
        logger.error(err);
        return 'generic';
      }
      finally{
        client.end();
      }
    }

    //add / edit auth token to user
    const addToken = async(uno, token) => {
      const client = new ConnectionClient();
      try {
        const result = await client.query(`UPDATE account SET authToken = $2 WHERE uno = $1`, [uno, token]);
        return result.rowCount > 0 ? result.rows[0] : null;
      } catch (err) {
        logger.error(err);
        return 'generic';
      }
      finally {
        client.end();
      }
    }

    //registration
    const registration = async (account, player) =>{
      const client = new ConnectionClient();
      try {
        const accountResult = await client.query('INSERT INTO account VALUES ($1, $2, $3, $4, false) RETURNING *', [account.uno, account.password, account.emailCod, account.passwordCod]);
        const playerResult = await client.query('INSERT INTO players VALUES ($1, $2, $3) RETURNING *', [player.tag_username, player.platform, player.uno]);
        return accountResult.rows.length > 0 && playerResult.rows.length > 0 ? accountResult.rows[0] : null;
      } catch (err) {
        logger.error(err);
        return null;
      } finally {
        client.end();
      }
    }

    //verify equal email
    const verifyEmail = async (emailCod) =>{
      const client = new ConnectionClient();
      try {
        const result = await client.query('SELECT * FROM account where email_cod = $1', [emailCod.toLowerCase()]);
        return result.rows.length > 0 ? true : false; 
      } catch (err) {
        logger.error(err);
        return 'generic';
      }
      finally {
        client.end();
      }
    }

    //get exists tag_username
    const checkTagUsername = async (tagUsername) =>{
      const client = new ConnectionClient();
      try {
        const result = await client.query('SELECT * FROM players where tag_username = $1', [tagUsername]);
        return result.rowCount > 0 ? true : false;
      } catch (err) {
        logger.error(err);
        return 'generic';
      }
      finally{
        client.end();
      }
    }

    //check closed registrations
    const checkRegistrations = async(tournamentID) => {
      const client = new ConnectionClient();
      try {
        const result = await client.query(`SELECT closed FROM registrations WHERE tournamentID = $1 AND closed = true limit 1`, [tournamentID]);
        return result.rowCount > 0 ? true : false;
      } catch (err) {
        logger.error(err);
        return 'generic';
      }
      finally {
        client.end();
      }
    }

    //get information player
    const getPlayerCredentials = async(username) => {
      const client = new ConnectionClient();
      try {
        const result = await client.query(`SELECT a.email_cod AS codEmail, a.password_cod AS codPsw, a.password AS psw, a.uno FROM account a JOIN players p ON (a.uno = p.uno) where p.tag_username = $1`, [username]);
        return result.rowCount > 0 ? result.rows[0] : null;
      } catch (err) {
        logger.error(err);
        return 'generic';
      }
      finally {
        client.end();
      }
      client.end();
    }
    //add token reset password
    const addTokenResetPassword = async(email, token) => {
      const client = new ConnectionClient();
      try {
        const result = await client.query(`UPDATE account SET authTokenResetPassw = $2 WHERE email_cod = $1 RETURNING *`, [email, token]);
        return result.rowCount > 0 ? result.rows[0] : null;
      } catch (err) {
        logger.error(err);
        return 'generic';
      }
      finally{
        client.end();
      }
    }
    //view if valid token
    const ValidTokenResetPassword = async(token) => {
      const client = new ConnectionClient();
      try {
        const result = await client.query(`SELECT uno FROM account WHERE authTokenResetPassw=$1`, [token]);
        return result.rowCount > 0 ? result.rows[0] : null;
      } catch (err) {
        logger.error(err);
        return 'generic';
      }
      finally{
        client.end();
      }
    }
    //change password of the account
    const changePassword = async(password, uno) => {
      const client = new ConnectionClient();
      try {
        const result = await client.query(`UPDATE account SET password = $2 WHERE uno = $1 RETURNING *`, [uno, password]);
        return result.rowCount > 0 ? result.rows[0] : null;
      } catch (err) {
        logger.error(err);
        return 'generic';
      }
      finally{
        client.end();
      }
    }


    //delete resetPasswordToken
    const deleteResetToken = async(uno) => {
      const client = new ConnectionClient();
      try {
        const result = await client.query(`UPDATE account SET (authTokenResetPassw, authtoken) = (null, null) WHERE uno = $1 RETURNING *`, [uno]);
        return result.rowCount > 0 ? true : false;
      } catch (err) {
        logger.error(err);
        return 'generic';
      }
      finally{
        client.end();
      }
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
      changePassword,
      deleteResetToken
    }
}

module.exports = dalGeneric;
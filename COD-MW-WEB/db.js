const dal = () =>
{
    const pg = require('pg');
    const getClient = () =>{
        const client = new pg.Client({
            host: 'ec2-34-242-51-83.eu-west-1.compute.amazonaws.com',
            database: 'COD-MW',
            user: 'ospite',
            password: '1234'
        });

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
    const login = async (username, password) =>{
      const client = getClient();
      const result = await client.query('SELECT * FROM account WHERE username_cod = $1 AND password = $2', [username, password]);
      client.end();

      return result.rows.length > 0 ? result.rows[0] : null;
    }

    //registration
    const registration = async (uno, password, username_cod, password_cod) =>{
      const client = getClient();
      const result = await client.query('INSERT INTO account VALUES ($1, $2, $3, $4) RETURNING *', [uno, password, username_cod, password_cod]);
      client.end();
      return result.rows.length > 0 ? result.rows[0] : null;
    }

    return{
      login,
      registration
    }
}

module.exports = dal;
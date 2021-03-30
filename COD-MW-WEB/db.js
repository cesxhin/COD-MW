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
    const login = async (email, password) =>{
      const client = getClient();
      const result = await client.query('SELECT * FROM account WHERE email_cod = $1 AND password = $2', [email.toLowerCase(), password]);
      client.end();

      return result.rows.length > 0 ? result.rows[0] : null;
    }

    //registration
    const registration = async (uno, password, email_cod, password_cod) =>{
      const client = getClient();
      const result = await client.query('INSERT INTO account VALUES ($1, $2, $3, $4) RETURNING *', [uno, password, email_cod.toLowerCase(), password_cod]);
      client.end();
      return result.rows.length > 0 ? result.rows[0] : null;
    }

    //verify equal email
    const verifyEmail = async (email_cod) =>{
      const client = getClient();
      const result = await client.query('SELECT * FROM account where email_cod = $1', [email_cod.toLowerCase()]);
      client.end();
      return result.rows.length > 0 ? true : false;
    }
    return{
      login,
      registration,
      verifyEmail
    }
}

module.exports = dal;
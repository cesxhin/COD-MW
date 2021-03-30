const esterno = () =>
{
    const pg = require('pg');
    const GetClient = () =>{
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
    const login = async (username, password) =>
    {
      const client = GetClient();
      const result = await client.query('SELECT * FROM account WHERE username_cod = $1 AND password = $2', [username], [password]);
      client.end();
      if(result.rows.length > 0) {
        return result;
      } else {
        return null;
      }
    }
    //registration
    const registration = async (uno, password, username_cod, password_cod) =>
    {
      const client = GetClient();
      const result = await client.query('INSERT INTO account(uno, password, username_cod, password_cod) VALUES ($1, $2, $3, $4)', [uno], [password], [username_cod], [password_cod]);
      client.end();
    }
    return{
      login,
      registration
    }
}

module.exports = esterno;
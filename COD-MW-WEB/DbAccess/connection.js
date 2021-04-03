const config = require('./config.json');
const pg = require('pg');
class ConnectionClient
{
    constructor ()
    {
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
}
module.exports = ConnectionClient;
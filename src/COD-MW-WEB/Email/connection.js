const config = require('./config.json');
const nodemailer = require("nodemailer");
class ConnectionClient
{
    constructor ()
    {
      try
      {
        return nodemailer.createTransport(config);
      }catch
      {
        return null;
      }
    }
}
module.exports = ConnectionClient;
const ConnectionEmail = require('./connection');

const Email = () =>
{
    //login
    const sendMail = async (email, authTokenResetPassword) =>{
      const transporter = new ConnectionEmail();
      try
      {
        let info = await transporter.sendMail({
          "from": '"no-replay" <cod.wztournaments@gmail.com>',
          "to": email,
          "subject": "Richiesta per resettare la password",
          "html":"<p>Ecco il link per resettare la tua password: https://wztournaments.tk/requestResetPassword/"+authTokenResetPassword+" </p><p>Non sei stato tu? Ignora questa email</p>"
        });
      }catch(error)
      {
        console.log(error);
      }
    }

    return{
      sendMail
    }
}

module.exports = Email;
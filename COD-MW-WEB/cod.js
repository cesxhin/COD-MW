const cod_api = require('call-of-duty-api')();
module.exports = 
{
    verifyLogin : async function (username, password)
    {
        try {
            await cod_api.login(username, password);
            console.log("success");
            return "success";
        } catch(Error) {
            console.log("failed");
            return Error;
        }
    },
    getUno : async function()
    {
        console.log("INIZIO: ");
        let data = await cod_api.getLoggedInUserInfo();
        const array = data['identities'];
        console.log(array);
        let uno = null;
        array.forEach(element => {
            if(element['provider'] === 'uno')
            {
                uno = element['accountID'];
            }
         });
        return uno;
    }
}

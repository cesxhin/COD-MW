const cod = () =>
{
    const cod_api = require('call-of-duty-api')();
    const verifyLogin = async (username, password) =>
    {
        try {
            await cod_api.login(username, password);
            return "success";
        } catch(Error) {
            return Error;
        }
    }
    const getUno = async (username, password) =>
    {
        const a = verifyLogin(username, password);
        if( a === "success")
        {
            const data = JSON.stringify(await cod_api.getLoggedInUserInfo());
            data.forEach(element => {
                if(element['provider'] === 'uno')
                {
                    return element['accountID'];
                }
            });
            return null;
        }else
        {
            return 'failed';
        }
    }
    return{
        verifyLogin,
        getUno
    }
}
module.exports = cod;
const API = require('call-of-duty-api')();

const cod = () =>
{
    //verify login
    const verifyLogin = async (username, password) => {
        try {
            await API.login(username, password);
            console.log("success");
            return "success";
        } catch(Error) {
            console.log("failed");
            return Error;
        }
    }

    //get uno
    const getUno = async() => {
        let data = await API.getLoggedInUserInfo();
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

    //get gamerTag
    const getGamerTag = async(platform) => {
        let tag_username = "";
        let data = await API.getLoggedInUserInfo();
        const array = data['identities'];
        array.forEach(element => {
            if(element['provider'] === platform)
            {
                tag_username = element['username'];
            }
         });
         return tag_username;
    }

    //get player matches 
    const getMatches = async(email, password, uno) =>
    {
        try {
            await API.login(email, password);
            let data = await API.MWcombatwz(uno, 'uno');
            return data;
        } catch(Error) {
            return null;
        }
    }
    return{
        verifyLogin,
        getUno,
        getGamerTag,
        getMatches 
        
    }
}

module.exports = cod;
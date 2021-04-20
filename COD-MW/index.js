const API = require('call-of-duty-api')();
const fs = require('fs');
async function login()
{
    try {
        await API.login('mattia.ceschin@gmail.com', 'DTjjsULmR6EjpvcrxjEO');
        let data = JSON.stringify(await API.getLoggedInUserInfo());
        fs.writeFile("data-personale.txt",data , function (err) {
            if (err) return console.log(err);
            console.log('Hello World > helloworld.txt');
          });
        console.log("Successo! " + data);
    } catch(Error) {
        console.log("errore connessione: "+Error);
    }
    /*try {
        let data = await API.MWcombatmp('cesxhin#2768', 'battle');
        console.log(data);
        fs.writeFile("data-multiplayer.txt",JSON.stringify(data) , function (err) {
            if (err) return console.log(err);
            console.log('Hello World > helloworld.txt');
          });
     } catch(Error) {
         //Handle Exception
         console.log(Error)
     }*/
     /*try {
        let data = await API.MWcombatwz('11211544909771063639','uno');
        fs.writeFile("data-warzone.txt",JSON.stringify(data) , function (err) {
            if (err) return console.log(err);
            console.log('Hello World > helloworld.txt');
          });
     } catch(Error) {
         //Handle Exception
     }*/
}
login()
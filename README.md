# WzTournaments
![plot](src/COD-MW-WEB/Public/assets/images/LOGO_SFONDO_UFFICIALE.png)
## What is this?
This project can be used create new tournaments for call of duty warzone.
When a tournament is ended by an admin, the system calculates and generates ranking with point for players.

## Which tecnology are used in this project?
- Database: PostgreSQL
- Website: NodeJS Runtime

## How to start this application?
### Configuration database
connection for database can found in `src/COD-MW-WEB/DbAccess/config.json`
```json
{
    "host": "",
    "database": "",
    "user": "",
    "password": "",
    "idleTimeoutMillis": 30000
}
```
### Configuration encrypt
There are password of account activion needed for the connection to the COD API without ask other password, encrypt it with password force, an example can be found in `src/COD-MW-WEB/index.js`
```javascript
...
//password
const key = ""; //example oAHSD980#saDnas!da0sdAS#Dh
...
```

## Database configuration
import this [data.sql](src/COD-MW-WEB/data.sql)

## Privacy
[privacy](src/COD-MW-WEB/Public/Privacy/privacy.pdf)

## Terms and Conditions
[termini e condizioni](src/COD-MW-WEB/Public/Privacy/termini_e_condizioni.pdf)

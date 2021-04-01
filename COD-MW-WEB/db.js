const config = require('./config.json');

const dal = () =>
{
    const pg = require('pg');
    const getClient = () =>{
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

    //login
    const login = async (email, password) =>{
      const client = getClient();
      const result = await client.query('SELECT * FROM account WHERE email_cod = $1 AND password = $2', [email.toLowerCase(), password]);
      client.end();

      return result.rows.length > 0 ? result.rows[0] : null;
    }

    //registration
    const registration = async (uno, password, email_cod, password_cod, tag_username, platform) =>{
      const client = getClient();
      const result = await client.query('INSERT INTO account VALUES ($1, $2, $3, $4, false, $5, $6) RETURNING *', [uno, password, email_cod.toLowerCase(), password_cod, tag_username, platform]);
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

    //create ranking schema
    const addRankingSchema = async (schema) => {
      const client = getClient();
      if(schema.gulag === undefined)
        schema.gulag = false;

      const result = await client.query(`INSERT INTO rankingschemas
        (name, points_top1, points_top2, points_top3, points_top5, points_top10, points_top15, points_top20, kill, gulag) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`, [schema.schemaName, schema.points_top1, schema.points_top2, schema.points_top3, schema.points_top5, schema.points_top10, schema.points_top15, schema.points_top20, schema.kill, schema.gulag]);
      
      client.end();
      return result.rows.length > 0 ? result.rows[0] : null;
    }

    //get ranking schemas
    const getRankingSchemas = async () => {
      const client = getClient();
      const result = await client.query('SELECT * FROM rankingschemas');
      client.end();
      return result.rows.length > 0 ? result.rows : null;
    }

    //get ranking schema by id
    const getRankingSchemaById = async (id) => {
      const client = getClient();
      const result = await client.query('SELECT * FROM rankingschemas WHERE id = $1', [id]);
      client.end();

      return result.rows.length > 0 ? result.rows[0] : null;
    }

    //update ranking schema 
    const updateRankingSchema = async (schema) => {
      const client = getClient();
      if(schema.gulag === undefined)
        schema.gulag = false;
      
      const result = await client.query(`UPDATE rankingschemas SET
      (name, points_top1, points_top2, points_top3, points_top5, points_top10, points_top15, points_top20, kill, gulag) 
      = ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      WHERE id = $11 RETURNING *`, 
      [schema.schemaName, schema.points_top1, schema.points_top2, schema.points_top3, schema.points_top5, schema.points_top10, schema.points_top15, schema.points_top20, schema.kill, schema.gulag, schema.id]);
      
      client.end();
      return result.rows.length > 0 ? result.rows[0] : null;
    }

    //delete ranking schema 
    const deleteRankingSchema = async (id) => {
      const client = getClient();
      try
      {
        const result = await client.query('DELETE FROM rankingschemas WHERE id = $1 RETURNING *', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
      }catch(Error)
      {
        if(Error.message.includes("violates"))
        {
          return 'violates'
        }else
        {
          return 'generic'
        }
      }
    }

    //create tournament
    const createTournament = async (tournaments) => {
      const client = getClient();
      const result = await client.query('INSERT INTO tournaments (start_date, start_time, number_matches, id_schema) values ($1, $2, $3, $4)  RETURNING *', [tournaments.start_date, tournaments.start_time, tournaments.number_matches, tournaments.id_schema]);
      client.end();
      return result.rows.length > 0 ? result.rows[0] : null;
    }

    //get tournaments
    const getTournaments = async () => {
      const client = getClient();
      const result = await client.query('SELECT * FROM tournaments');
      client.end();
      return result.rows.length > 0 ? result.rows : null;
    }
    //get by id tournaments
    const getTournamentsById = async (id) => {
      const client = getClient();
      const result = await client.query('SELECT * FROM tournaments WHERE id = $1', [id]);
      client.end();
      return result.rows.length > 0 ? result.rows[0] : null;
    }
    //update tournaments
    const updateTournaments = async (tournaments) => {
      const client = getClient();
      const result = await client.query('UPDATE tournaments SET start_date=$1, start_time=$2, number_matches=$3, id_schema=$4 WHERE id = $5 RETURNING *',[tournaments.start_date, tournaments.start_time, tournaments.number_matches, tournaments.id_schema, tournaments.id]);
      client.end();
      return result.rows.length > 0 ? result.rows[0] : null;
    }
    //delete tournaments
    const deleteTournaments = async (id) => {
      const client = getClient();
      try
      {
        await client.query('DELETE FROM tournaments WHERE id = $1', [id]);
        client.end();
        return;
      }catch
      {
        return 'generic'
      }
    }
    return{
      login,
      registration,
      verifyEmail,

      addRankingSchema,
      getRankingSchemas,
      getRankingSchemaById,
      updateRankingSchema,
      deleteRankingSchema,
      
      createTournament,
      getTournaments,
      getTournamentsById,
      deleteTournaments,
      updateTournaments
    }
}

module.exports = dal;
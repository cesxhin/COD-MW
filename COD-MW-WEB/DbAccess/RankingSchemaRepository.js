const ConnectionClient = require('./connection');

const dalRankingSchema = () =>
{
    //create ranking schema
    const addRankingSchema = async (schema) => {
      try
      {
        const client = new ConnectionClient();
        if(schema.gulag === undefined)
        {
          schema.gulag = false;
        }
        const result = await client.query(`INSERT INTO rankingschemas
          (name, playersNumber, points_top1, points_top2, points_top3, points_top5, points_top10, points_top15, points_top20, kill, gulag) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`, [schema.schemaName, schema.playersNumber, schema.points_top1, schema.points_top2, schema.points_top3, schema.points_top5, schema.points_top10, schema.points_top15, schema.points_top20, schema.kill, schema.gulag]);
        return result.rows.length > 0 ? result.rows[0] : null;
      }catch(error)
      {
        console.log(error);
      }finally
      {
        client.end();
      }
    }

    //get ranking schemas
    const getRankingSchemas = async () => {
      try
      {
        const client = new ConnectionClient();
        const result = await client.query('SELECT * FROM rankingschemas ORDER BY id ASC');
        return result.rows.length > 0 ? result.rows : null;
      }catch(error)
      {
        console.log(error);
      }finally
      {
        client.end();
      }
    }

    //get ranking schema by id
    const getRankingSchemaById = async (id) => {
      try
      {
        const client = new ConnectionClient();
        const result = await client.query('SELECT * FROM rankingschemas WHERE id = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
      }catch(error)
      {
        console.log(error);
      }finally
      {
        client.end();
      }
    }

    //update ranking schema 
    const updateRankingSchema = async (schema) => {
      try
      {
        const client = new ConnectionClient();
        if(schema.gulag === undefined)
          schema.gulag = false;
        const result = await client.query(`UPDATE rankingschemas SET
        (name, playersNumber, points_top1, points_top2, points_top3, points_top5, points_top10, points_top15, points_top20, kill, gulag) 
        = ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        WHERE id = $12 RETURNING *`, 
        [schema.schemaName, schema.playersNumber, schema.points_top1, schema.points_top2, schema.points_top3, schema.points_top5, schema.points_top10, schema.points_top15, schema.points_top20, schema.kill, schema.gulag, schema.id]);
        return result.rows.length > 0 ? result.rows[0] : null;
      }catch(error)
      {
        console.log(error);
      }finally
      {
        client.end();
      }      
    }

    //delete ranking schema 
    const deleteRankingSchema = async (id) => {
      const client = new ConnectionClient();
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
      }finally
      {
        client.end();
      }
    }

    return{
      addRankingSchema,
      getRankingSchemas,
      getRankingSchemaById,
      updateRankingSchema,
      deleteRankingSchema
    }
}

module.exports = dalRankingSchema;
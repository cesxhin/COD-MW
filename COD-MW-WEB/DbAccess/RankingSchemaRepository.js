const ConnectionClient = require('./connection');

const dalRankingSchema = () =>
{
    //create ranking schema
    const addRankingSchema = async (schema) => {
      const client = new ConnectionClient();
      if(schema.gulag === undefined)
      {
        schema.gulag = false;
      }
      const result = await client.query(`INSERT INTO rankingschemas
        (name, points_top1, points_top2, points_top3, points_top5, points_top10, points_top15, points_top20, kill, gulag) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`, [schema.schemaName, schema.points_top1, schema.points_top2, schema.points_top3, schema.points_top5, schema.points_top10, schema.points_top15, schema.points_top20, schema.kill, schema.gulag]);
      client.end();
      return result.rows.length > 0 ? result.rows[0] : null;
    }

    //get ranking schemas
    const getRankingSchemas = async () => {
      const client = new ConnectionClient();
      const result = await client.query('SELECT * FROM rankingschemas ORDER BY id ASC');
      client.end();
      return result.rows.length > 0 ? result.rows : null;
    }

    //get ranking schema by id
    const getRankingSchemaById = async (id) => {
      const client = new ConnectionClient();
      const result = await client.query('SELECT * FROM rankingschemas WHERE id = $1', [id]);
      client.end();

      return result.rows.length > 0 ? result.rows[0] : null;
    }

    //update ranking schema 
    const updateRankingSchema = async (schema) => {
      const client = new ConnectionClient();
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
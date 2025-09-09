import Fastify from 'fastify';
import { openDb } from './sqlite.js';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'handlebars';

const fastify = Fastify({ logger: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

fastify.register(import('@fastify/view'), {
  engine: { handlebars },
  root: path.join(__dirname, 'views')
});

fastify.register(import('@fastify/formbody'));

fastify.register(async function (api) {
  
  // -------------------- ROUTES UNDER / --------------------

api.get('/', async (req, reply) => {
  const base = 'https://grass-synonymous-zenith.glitch.me/apis';

  const viewLinks = [
    [`View Citizens Table`, `${base}/citizens-view`],
    [`View Chariots Table`, `${base}/chariots-view`],
    [`View Speeding Table`, `${base}/speeding-view`],
    [`View Relationships Table`, `${base}/citizens/relationships-view`]
  ];

  const apiUrls = [
    `${base}/citizens?citizenId=<i>{{citizenId}}</i>`,
    `${base}/citizens/relationships?citizenId=<i>{{citizenId}}</i>`,
    `${base}/licences/chariots?licenceNumber=<i>{{licenceNumber}}</i>`,
    `${base}/fines/speeding?licenceNumber=<i>{{licenceNumber}}</i>`,
  ];

  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>API & Table Views</title></head>
    <body>
      <h1>Viewable tables backing resources:</h1>
      <ul>
        ${viewLinks.map(([label, url]) => `<li><a href="${url}">${label}</a></li>`).join('\n')}
      </ul>

      <h1>API resources:</h1>
      <pre>${apiUrls.join('\n')}</pre>
    </body>
    </html>
  `;

  return reply
    .type('text/html')
    .send(html);
});



// -------------------- ROUTES UNDER /apis --------------------

api.get('/apis', async (req, reply) => {
  const base = 'https://grass-synonymous-zenith.glitch.me/apis';
  return reply.send({
    citizens: `${base}/citizens?citizenId=<citizenId>`,
    relationships: `${base}/citizens/relationships?citizenId=<citizenId>`,
    chariotLicences: `${base}/licences/chariots?licenceNumber=<licenceNumber>`,
    parkingFines: `${base}/fines/parking?licenceNumber=<licenceNumber>`,
    speedingFines: `${base}/fines/speeding?licenceNumber=<licenceNumber>`
  });
});
  
  
  api.all('/apis/echo*', async (request, reply) => {
  reply.header('X-Echoed-API', 'true');
  return {
    method: request.method,
    url: request.url,
    parameters: request.params,
    query: request.query,
    headers: request.headers,
    body: request.body
  };
});
  
  api.get('/apis/citizens', async (req, reply) => {
    const db = await openDb();
    const { citizenId } = req.query;
    const citizen = await db.get('SELECT * FROM citizens WHERE citizenId = ?', citizenId);
    return reply.send(citizen || { error: 'Citizen not found' });
  });

    api.get('/apis/citizens/relationships', async (req, reply) => {
    const db = await openDb();
    const { citizenId } = req.query;
    const rows = await db.all('SELECT * FROM relationships WHERE fromCitizenId = ?', citizenId);
    return reply.send(rows);
  });
  
  api.get('/apis/licences/chariots', async (req, reply) => {
    const db = await openDb();
    const { licenceNumber } = req.query;
    const chariot = await db.get('SELECT * FROM chariot_licences WHERE licenceNumber = ?', licenceNumber);
    if (!chariot) return reply.code(404).send({ error: 'Chariot not found' });

    const totalFines = await db.get(`
      SELECT IFNULL(SUM(fineAmount), 0) AS total
      FROM (
        SELECT fineAmount FROM parking_fines WHERE licenceNumber = ? AND paid = 0
        UNION ALL
        SELECT fineAmount FROM speeding_fines WHERE licenceNumber = ? AND paid = 0
      )
    `, [licenceNumber, licenceNumber]);

    return reply.send({
      ...chariot,
      finesOwing: totalFines.total
    });
  });

  api.get('/apis/fines/speeding', async (req, reply) => {
    const db = await openDb();
    const { licenceNumber } = req.query;
    const rows = await db.all('SELECT * FROM speeding_fines WHERE licenceNumber = ?', licenceNumber);
    return reply.send(rows);
  });


  // -------------------- HTML TABLE VIEWS --------------------

  api.get('/apis/citizens-view', async (req, reply) => {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM citizens');
    return reply.view('table.hbs', {
      title: 'Citizens',
      columns: ['citizenId', 'firstname', 'house', 'age', 'chariotLicence'],
      rows
    });
  });

    api.get('/apis/citizens/relationships-view', async (req, reply) => {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM relationships');
    return reply.view('table.hbs', {
      title: 'Relationships',
      columns: ['fromCitizenId', 'toCitizenId', 'relationshipType'],
      rows
    });
  });
  
  api.get('/apis/chariots-view', async (req, reply) => {
    const db = await openDb();
    const chariots = await db.all('SELECT * FROM chariot_licences');
    const results = [];

    for (const chariot of chariots) {
      const totalFines = await db.get(`
        SELECT IFNULL(SUM(fineAmount), 0) AS total
        FROM (
          SELECT fineAmount FROM parking_fines WHERE licenceNumber = ? AND paid = 0
          UNION ALL
          SELECT fineAmount FROM speeding_fines WHERE licenceNumber = ? AND paid = 0
        )
      `, [chariot.licenceNumber, chariot.licenceNumber]);

      results.push({
        licenceNumber: chariot.licenceNumber,
        model: chariot.model,
        finesOwing: totalFines.total,
        vin: chariot.vin
      });
    }

    return reply.view('table.hbs', {
      title: 'Chariot Licences',
      columns: ['licenceNumber', 'model', 'finesOwing', 'vin'],
      rows: results
    });
  });

  api.get('/apis/speeding-view', async (req, reply) => {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM speeding_fines');
    return reply.view('table.hbs', {
      title: 'Speeding Fines',
      columns: ['id', 'licenceNumber', 'citizenId', 'speed', 'fineAmount', 'paid', 'paymentCard'],
      rows
    });
  });


}, { prefix: '/' }); // registers all routes under /apis/*

// -------------------- START SERVER --------------------

fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});

const debugging = false;
// Require the framework and instantiate it
const fastify = require('fastify')({ logger: debugging });
const crypto = require('crypto');
require('dotenv').config();

fastify.register(require('./fastify-mongoose-driver.js').plugin, {
    uri: process.env.mongoConnString,
    settings: {
        useNewUrlParser: true,
        config: {
            autoIndex: true,
        },
    },
    models: [
        {
            name: "gameactivities",
            alias: "GameActivity",
            schema: {
                hash: {
                    type: String,
                    required: true,
                    index: true,
                    unique: true,
                    dropDups: true
                },
                origin: {
                    type: String,
                    required: true
                }
            }
        },
        {
            name: "gamecharts",
            alias: "GameCharts",
            schema: {
                origin: {
                    type: String,
                    required: true
                },
                totalCount: {
                    type: Number,
                    required: true
                }
            }
        }
    ],
    useNameAndAlias: true,
},
    (err) => {
        if (err) throw err;
    }
);

// Declare a route
fastify.post('/telemetry', async (request, reply) => {
    const ip =  request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || request.socket.remoteAddress;

    // Example URL: https://elethor.com/market/mine
    const origin = request.headers.referer;
    if (!origin || !ip) return;

    let splits, sanitizedOrigin, hash;

    try {
        splits = origin.split('/');
        sanitizedOrigin = `${splits[0]}//${splits[2]}/`;
        hash = crypto.createHash('md5').update(ip + sanitizedOrigin).digest('hex');
    } catch (e) {
        console.log(e);
        console.log("ORIGIN: " + origin);
    }
    if (origin == 'localhost') return;
    
    // Do not store IP address
    const dbEntry = {
        hash: hash,
        origin: sanitizedOrigin
    }

    if (debugging) {
        console.log(dbEntry);
    } else { 
        // For monitoring
        console.log(dbEntry.hash);
        await fastify.mongoose.GameActivity.create(dbEntry)
        .catch((err) => {
            // Duplicate key error, it's fine to dump it
            if (err.code != 11000) throw err;
        });
    }
});

// Run the server!
const start = async () => {
    try {
        await fastify.listen({ port: 5000 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start();

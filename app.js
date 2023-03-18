const express = require('express');
const rescue = require('express-rescue')
const cors = require('cors')
const combineTiles = require('./combine-tiles.js')
const sharp = require('sharp');
const bodyParser = require('body-parser');
const path = require('path');


const app = express()
const fs = require('fs')
const {v4: uuidv4} = require('uuid');

app.use(cors());
const port = 3000

// app.use(express.raw());


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

async function run() {

    app.post('/backend', rescue(async (req, res, next) => {
        let tiles = await req.body

        try {
            for (let tile of tiles) {
                tile.buffer = await sharp(Buffer.from(JSON.parse("[" + tile.buffer + "]")), {}).toBuffer()
            }
            const size = 512
            let imageBuffer = await combineTiles(tiles, size, size)

            res.send(Buffer.from(imageBuffer))
            res.end();

        } catch (e) {
            console.log(e)
        }
    }))

    app.use((err, req, res, next) => {
        res.send('error')
    })

    const server = await app.listen(port);
}

run()

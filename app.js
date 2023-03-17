const express = require('express');
const rescue = require('express-rescue')
const cors = require('cors')
const combineTiles = require('combine-tiles')
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
        let files = await req.body

        try {
            let tiles = []
            let tile = {}
            let guid = uuidv4();
            let destCombined = path.resolve('./tmp/' + 'combined' + '_' + guid + '.png');
            for (let file of files) {
                tile = {}
                let array = JSON.parse("[" + file.buffer + "]");
                let guid = uuidv4();
                let outputFilePath = path.resolve('./tmp/' + guid + +'_' + file.name)

                await sharp(Buffer.from(array), {}).toFile(outputFilePath)

                tile.x = file.x
                tile.y = file.y
                tile.file = outputFilePath
                tiles.push(tile)
            }

            const size = 512
            console.log(tiles)
            await combineTiles(tiles, size, size, destCombined)

            const imageBuffer = fs.readFileSync(
                path.resolve(destCombined),
            )

            res.send(Buffer.from(imageBuffer))
            res.end();

            for (let tile of tiles) {
                fs.unlink(tile.file, function (err) {
                    if (err) throw err;
                    // if no error, file has been deleted successfully
                    console.log('File deleted!');
                });
            }

            fs.unlink(destCombined, function (err) {
                if (err) throw err;
                // if no error, file has been deleted successfully
                console.log('File deleted!');
            })

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

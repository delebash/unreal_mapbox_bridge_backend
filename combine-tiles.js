'use strict'

const minBy = require('lodash/minBy')
const maxBy = require('lodash/maxBy')
const sortBy = require('lodash/sortBy')
const sharp = require('sharp')

const background = {r: 255, g: 255, b: 255}

const combineTiles = (tiles, tWidth, tHeight, cb) => {
    const offsetX = minBy(tiles, tile => tile.x).x
    const offsetY = minBy(tiles, tile => tile.y).y
    const makeRelative = (tile) => ({
        x: tile.x - offsetX,
        y: tile.y - offsetY,
        buffer: tile.buffer
    })
    const toCompositeOp = ({x, y, buffer}) => ({
        input: buffer,
        top: y * tHeight,
        left: x * tWidth
    })

    const index = sortBy(tiles.map(makeRelative), ['y', 'x'])
    const cols = 1 + maxBy(index, tile => tile.x).x
    const rows = 1 + maxBy(index, tile => tile.y).y
    const w = tWidth * cols
    const h = tHeight * rows

    return sharp(index[0].buffer)
        .metadata()
        .then(({channels}) => {
            return sharp({
                create: {
                    width: tWidth * cols,
                    height: tHeight * rows,
                    channels,
                    background
                }
            })
                .composite(index.map(toCompositeOp))
                // todo: accept more libvips options, e.g. format
                .png()
                .toBuffer()
        })

}

module.exports = combineTiles

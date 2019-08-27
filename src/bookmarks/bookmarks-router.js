const express = require('express')
const uuid = require('uuid')
const logger = require('../logger')
const { bookmarks } = require('../store')

const bodyParser = express.json()
const bookmarksRouter = express.Router()

bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks);
    })
    .post(bodyParser, (req, res) => {
        const { title, url, description, rating } = req.body;

        if(!title || !url || !description || !rating) {
            return res
                .status(400)
                .send('Invalid data')
        }

        const id = uuid()
        const bookmark = {
            title,
            url,
            description,
            rating
        }

        bookmarks.push(bookmark)
        logger.info(`Bookmark with ${ id } created`)
        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmark)
    })

bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params
        const bookmark = bookmarks.find(b => b.id === id)

        if(!bookmark) {
            logger.error(`Bookmark with ${id} not found.`)
            return res
                .status(404)
                .send('Bookmark not found')
        }

        res.json(bookmark)
    })
    .delete((req, res) => {
        const { id } = req.params
        const index = bookmarks.findIndex(b => b.id === id)

        if(!index) {
            logger.error(`Bookmark with ${id} not found.`)
            return res
                .status(404)
                .send(`Bookmark not found`)
        }

        bookmarks.splice(index, 1)

        logger.info(`Bookmark with id ${id} deleted.`);

        res
            .status(204)
            .end()
    })

module.exports = bookmarksRouter
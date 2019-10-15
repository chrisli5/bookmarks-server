require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./logger');
const { NODE_ENV } = require('./config')
const bookmarksService = require('./bookmarks-service')

const app = express();

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

/*
app.use(function validateToken(req, res, next) {
    const authToken = req.get('Authorization')
    const apiToken = process.env.API_TOKEN

    console.log(authToken);
    console.log(apiToken);

    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        logger.error(`Unauthorized request to path: ${req.path}`)
        return res.status(401).json({ error: 'Unauthorized request' })
    }
    
    next()
})
*/

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.get('/bookmarks', (req, res, next) => {
    const knexInstance = req.app.get('db')
    bookmarksService.getAllBookmarks(knexInstance)
        .then(bookmarks => {
            res.json(bookmarks)
        })
        .catch(next)
})

app.get('/bookmarks/:bookmark_id', (req, res, next) => {
    const knexInstance = req.app.get('db')
    bookmarksService.getById(knexInstance, req.params.bookmark_id)
        .then(bookmark => {
            res.json(bookmark)
        })
        .catch(next)
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }

    res.status(500).json(response)
})

module.exports = app
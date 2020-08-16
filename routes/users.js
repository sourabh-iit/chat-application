const express = require('express');
const router = express.Router();
const mongoclient = require('mongodb').MongoClient;
const assert = require('assert');
const app = require('../app');

const url = "mongodb://localhost:27017";

async function connect() {
    const client = await mongoclient.connect(url);
    return client.db('chat');
}

router.get('/users', async function(req, res, next) {
    try {
        const db = await connect();
        const users = await db.collection('users').find().toArray();
        res.json({success: true, data: users});
    } catch(error) {
        res.json({success: false, error: error.message}, status=400);
    }
});

router.post('/chat/:username', async function(req, res, next) {
    try {
        const db = await connect();
        const doc = {
            from: req.username,
            to: req.params.username,
            message: req.body.message,
            time: Date.now()
        };
        const result = await db.collection('messages').insertOne(doc);
        assert(result && result.result, "Problem with database")
        const message = result.ops[0];
        app.io.emit('message', message);
        res.json({success: true, data: message});
    } catch(error) {
        res.json({success: false, error: error.message}, status=400);
    }
})

router.get('/chat/:username', async function(req, res, next) {
    try {
        const db = await connect();
        const username = req.params.username;
        const chat = await db.collection('messages').find({
            from: {$in: [username, req.username]},
            to: {$in: [username, req.username]}
        }).toArray();
        res.json({success: true, data: chat});
    } catch(error) {
        res.json({success: false, error: error.message}, status=400);
    }
});

module.exports = router;

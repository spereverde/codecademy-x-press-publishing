const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const seriesRouter = express.Router();

seriesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Series`, (err, data) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({series: data});
        }
    });
});

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get(`SELECT * FROM Series WHERE id = ${seriesId}`,
        (err, data) => {
            if (err) {
                next(err);
            } else if (data) {
                req.series = data;
                next();
            } else {
                res.sendStatus(404);
            }
        });
});

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({series: req.series});
});

module.exports = seriesRouter;
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

const validateSeries = (req, res, next) => {
    req.name = req.body.series.name;
    req.description = req.body.series.description;
    if (!req.name || !req.description) {
        return res.sendStatus(400);
    } else {
        next();
    }
};


seriesRouter.post('/', validateSeries, (req, res, next) => {
    db.run(`INSERT INTO Series (name, description) VALUES("${req.name}", "${req.description}")`,
        function (error) {
            if (error) {
                next(error);
            } else {
                db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (error, series) => {
                    res.status(201).json({series: series});
                });
            }
        });
});

module.exports = seriesRouter;
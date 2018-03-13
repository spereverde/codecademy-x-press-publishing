const express = require('express');
const artistsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Artist WHERE is_currently_employed = 1`, (err, artists) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({artists: artists});
        }
    });
});

artistsRouter.param('artistId', (req, res, next, artistId) => {
    db.get(`SELECT * FROM Artist WHERE id = $artistId;`,
        { $artistId: artistId },
        (error, artist) => {
            if (error) {
                next(error);
            } else if (artist) {
                req.artist = artist;
                next();
            } else {
                res.status(404).send(`Artist with that name does not exist`);
                //res.sendStatus(404);
            }
        });
});

artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({artist: req.artist});
});

const validateArtist = (req, res, next) => {
    req.name = req.body.artist.name;
    req.dateOfBirth = req.body.artist.dateOfBirth;
    req.biography = req.body.artist.biography;
    req.isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    if (!req.name || !req.dateOfBirth || !req.biography) {
        return res.sendStatus(400);
    } else {
        next();
    }
};

artistsRouter.post('/', validateArtist, (req, res, next) => {
    db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) 
        VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`,
        {
            $name: req.name,
            $dateOfBirth: req.dateOfBirth,
            $biography: req.biography,
            $isCurrentlyEmployed: req.isCurrentlyEmployed
        }, function (error) {
            if (error) {
                next(error);
            }
            db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (error, artist) => {
                res.status(201).json({artist: artist});
            });
    });
});

artistsRouter.put('/:artistId', validateArtist, (req, res, next) => {
    db.run(`UPDATE Artist SET name = "${req.name}", date_of_birth = "${req.dateOfBirth}",
        biography = "${req.biography}", is_currently_employed = "${req.isCurrentlyEmployed}" 
        WHERE id = "${req.params.artistId}"`,
        function(error) {
            if (error) {
                next(error);
            } else {
                db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (error, artist) => {
                    res.status(200).json({artist: artist});
                });
            }
        });
});

artistsRouter.delete('/:artistId', (req, res, next) => {
    db.run(`UPDATE Artist SET is_currently_employed = 0 
        WHERE id = "${req.params.artistId}"`,
        function(error) {
            if (error) {
                next(error);
            } else {
                db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (error, artist) => {
                    res.status(200).json({artist: artist});
                });
            }
        });
});

module.exports = artistsRouter;
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
    next();
});

const validateArtist = (req, res, next) => {
  const artistToCreate = req.body.artist;
  const isCurrentlyEmployed = artistToCreate.isCurrentlyEmployed === 0 ? 0 : 1;
  if (!artistToCreate.name || !artistToCreate.dateOfBirth || !artistToCreate.biography) {
    return res.sendStatus(400);
  } else {
      next();
  }
};

artistsRouter.post('/', validateArtist, (req, res, next) => {
    const artistToCreate = req.body.artist;
    const sql = `INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES (
        $name, $dateOfBirth, $biography, $isCurrentlyEmployed)`;
    db.run(sql,
        {
            $name: artistToCreate.name,
            $dateOfBirth: artistToCreate.dateOfBirth,
            $biography: artistToCreate.biography,
            $isCurrentlyEmployed: artistToCreate.isCurrentlyEmployed
        }, function (error) {
            if (error) {
                next(error);
            }
            db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (error, artist) => {
                if (!artist) {
                    res.sendStatus(500);
                }
                res.status(201).send.json({artist: artist});
            });
    });
});

artistsRouter.put('/:artistId', validateArtist, (req, res, next) => {
    const sql = `UPDATE Artist SET name=${req.name}, date_of_birth=${req.dateOfBirth}, 
        biography=${req.biography}, is_currently_employed=${req.isCurrentlyEmployed}
        WHERE id = ${req.params.artistId}`;
    db.run(sql, (error, row) => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`,(error, row) => {
                res.status(200).json({artist: row});
            });
        }
    });
});

module.exports = artistsRouter;
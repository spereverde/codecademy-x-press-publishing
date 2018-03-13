const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const issuesRouter = express.Router({mergeParams: true});

issuesRouter.param('issueId', (req, res, next, issueId) => {
    db.get(`SELECT * FROM Issue WHERE id = ${issueId}`,
        (error, data) => {
            if (error) {
                next(error);
            } else if (data) {
                next();
            } else {
                res.sendStatus(404);
            }
        });
});

issuesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`, (error, data) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({issues: data});
        }
    });
});

const validateIssue = (req, res, next) => {
    req.name = req.body.issue.name;
    req.issueNumber = req.body.issue.issueNumber;
    req.publicationDate = req.body.issue.publicationDate;
    req.artistId = req.body.issue.artistId;
    if (!req.name || !req.issueNumber || !req.publicationDate || !req.artistId) {
        return res.sendStatus(400);
    } else {
        next();
    }
};

issuesRouter.post('/', validateIssue, (req, res, next) => {
    db.run(`INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES 
        ("${req.name}", "${req.issueNumber}", "${req.publicationDate}", ${req.artistId}, ${req.params.seriesId})`,
        function (error, data) {
            if (error) {
                next(error);
            } else {
                db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, (error, data) => {
                    if (error) {
                        next(error);
                    } else {
                        res.status(201).json({issue: data});
                    }
                });
            }
        });
});

issuesRouter.put('/:issueId', validateIssue, (req, res, next) => {
    db.run(`UPDATE Issue SET name = "${req.name}", issue_number = ${req.issueNumber}, publication_date = "${req.publicationDate}",
        artist_id = ${req.artistId}, series_id = ${req.params.seriesId}  
        WHERE id = ${req.params.issueId}`,
        function (error, data) {
            if (error) {
                next(error);
            } else {
                db.get(`SELECT * FROM Issue WHERE id = ${req.params.issueId}`, (error, data) => {
                    if (error) {
                        next(error);
                    } else {
                        res.status(200).json({issue: data});
                    }
                });
            }
        });
});

issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run(`DELETE FROM Issue WHERE id = ${req.params.issueId}`, (error) => {
        if (error) {
            next(error);
        } else {
            res.sendStatus(204);
        }
    });
});

module.exports = issuesRouter;
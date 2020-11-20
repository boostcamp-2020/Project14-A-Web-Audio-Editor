import express from 'express';

const oauthRouter = express.Router();

oauthRouter.get('/github', (req, res, next) => { res.status(200).end(); });
oauthRouter.get('/github/login', (req, res, next) => { res.status(200).end(); });

export { oauthRouter };

import express, { NextFunction, Request, Response } from 'express';
import {DbService} from '../service/dbService';
import {Post} from "../model/response";

let router = express.Router();

router.get('/post/:source', async (req: Request, res: Response, next: NextFunction) => {
    let { category, limit, type } = req.query;
    let source = req.params.source ? Number(req.params.source) : 0;
    try {
        const db = DbService.getDbServiceInstance();
        let posts: Post[] = [];
        switch (type) {
            case 'category':
                if (category) {
                    posts = await db.getPostByCategories(source, limit as string, category as Array<string>);
                } else {
                    posts = await db.getPost(source, req);
                }
                break;
            case 'featured':
                posts = await db.getFeaturePosts(source);
                break;
            default:
                posts = await db.getPost(source, req);
        }
        for (const post of posts) {
            post.categories = await db.getCategories(source, post);
            let featureImage = await db.getFeatureImage(source, post);
            post.featureImage = featureImage[0];
            let author = await db.getAuthor(source, post);
            post.author = author[0];
        }
        res.setHeader('Content-Type', 'application/json');
        res.json(posts);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

export default router;

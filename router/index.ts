import express, {NextFunction, Request, Response} from 'express';
import {DbService} from '../service/dbService';
import {Post} from "../model/response";
import {SourceEnum} from "../model/enum/index";

let router = express.Router();

router.get('/post/:source', async (req: Request, res: Response, next: NextFunction) => {
    let {category} = req.query;
    let {source} = req.params
    let sourceEnum = SourceEnum.parse(source);
    const db = DbService.getDbServiceInstance();
    let posts: Post[] = [];
    if (category) {
        posts = await db.getPostByCategories(sourceEnum, category as Array<string>);
    } else {
       posts = await db.getPost(sourceEnum);
    }
    for (const post of posts) {
        post.categories = await db.getCategories(sourceEnum, post);
        post.attachments = await db.getAttachment(sourceEnum, post);
    }
    res.send(posts);
});

export default router;
import {Author, Category, FeatureImage, Post} from "../model/response";
import {SourceEnum} from "../model/enum";
import {Request} from "express";

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'node',
    password: 'samsung',
    database: 'paillaco',
    port: 3306,
    debug: false

});
let instance: DbService;

connection.connect((err: any) => {
    if (err) {
        console.log(err.message);
    }
    console.log('db ' + connection.state);
});

export class DbService {

    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async getFeaturePosts(source: number): Promise<Post[]> {
        const result = await this.execQuery(source, `select wp.ID id,
                                                    wp.post_date_gmt published,
                                                    wp.post_modified_gmt updated,
                                                    wp.post_content content,
                                                    wp.post_title title,
                                                    wp.post_name name
                                             from wp_posts wp inner join wp_postmeta meta on meta.meta_value = wp.ID
                                             where meta.meta_key = ? and wp.post_status = ?
                                               and wp.post_type = ?
                                             order by wp.post_date DESC limit 4;`, ['_wp_attached_file', 'publish', 'post']);
        return result as Post[];
    }

    async getPost(source: number, request: Request): Promise<Post[]> {
        const params = ['publish', 'post'];
        let {limit, post_name} = request.query;
        if (post_name !== undefined) {
            post_name = `and wp.post_name = '${post_name}'`;
        } else {
            post_name = ''
        }
        const result = await this.execQuery(source, `select wp.ID id,
                                                    wp.post_date_gmt published,
                                                    wp.post_modified_gmt updated,
                                                    wp.post_content content,
                                                    wp.post_title title,
                                                    wp.post_name name
                                             from wp_posts wp
                                             where wp.post_status = ?
                                               and wp.post_type = ? ${post_name}
                                             order by wp.post_date DESC limit ${limit};`, params);
        return result as Post[];
    }

    async getPostByCategories(source: number, limit: string, categories: Array<string>): Promise<Post[]> {
        const result = await this.execQuery(source, `select wp.ID id,
                                                    wp.post_date_gmt published,
                                                    wp.post_modified_gmt updated,
                                                    wp.post_content content,
                                                    wp.post_title title,
                                                    wp.post_name name
                                             from wp_posts wp
                                                      LEFT JOIN wp_term_relationships rel ON rel.object_id = wp.ID
                                                      LEFT JOIN wp_term_taxonomy tax ON tax.term_taxonomy_id = rel.term_taxonomy_id
                                                      LEFT JOIN wp_terms t ON t.term_id = tax.term_id
                                             where wp.post_status = ?
                                               and wp.post_type = ?
                                               and t.term_id IN (?)
                                             order by wp.post_date DESC limit ${limit};`,
            ['publish', 'post', categories.toString()])
        return result as Post[];
    }

    async getFeatureImage(source: number, post: Post): Promise<FeatureImage[]> {
        const result = await this.execQuery(source, `
            select post.guid url, post.post_title title
            from wp_postmeta mta
                     inner join wp_posts post on mta.meta_value = post.ID
            where mta.meta_key = ?
              and mta.post_id = ?
            limit 1;`, ['_thumbnail_id', post.id.toString()]
        );
        return result as FeatureImage[];
    }

    async getCategories(source: number, post: Post): Promise<Category[]> {
        const result = await this.execQuery(source, `select t.term_id id, t.name, t.slug
                                                     from wp_posts wp
                                                              LEFT JOIN wp_term_relationships rel ON rel.object_id = wp.ID
                                                              LEFT JOIN wp_term_taxonomy tax ON tax.term_taxonomy_id = rel.term_taxonomy_id
                                                              LEFT JOIN wp_terms t ON t.term_id = tax.term_id
                                                     where wp.ID = ?`, [post.id.toString()]);
        return result as Category[];
    }

    async getAuthor(source: number, post: Post): Promise<Author[]> {
        const result = await this.execQuery(source, `select user.display_name name, user.user_nicename niceName
                                                     from wp_users user
                                                              inner join wp_posts wp on user.ID = wp.post_author
                                                     where wp.ID = ?`, [post.id.toString()]);
        return result as Author[];
    }

    /**
     * Execute query in database
     * @param source
     * @param query An string query
     * @param params An Array of params
     * @returns {Promise<unknown>}
     */
    private async execQuery(source: number, query: string, params: string[]): Promise<[]> {
        return await new Promise((resolve, reject) => {
            connection.changeUser({database: SourceEnum.getDbName(source)});
            connection.query(query, params, (err: any, result: any, fields: any) => {
                if (err) {
                    reject({message: err.message})
                }
                resolve(result);
            })
        });
    }
}

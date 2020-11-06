import {Category, Post} from "../model/response";
import {Attachment} from "../model/response/attachment";
import {SourceEnum} from "../model/enum/source.enum";

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'node',
    password: 'samsung',
    database: 'paillaco',
    port: 3306

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

    /**
     * Execute query in database
     * @param query An string query
     * @param params An Array of params
     * @returns {Promise<unknown>}
     */
    private async execQuery(source: SourceEnum, query: string, params: string[]) {
        return await new Promise((resolve, reject) => {
            connection.changeUser({database: SourceEnum.getDbName(source)});
            connection.query(query, params, (err: any, result: any, fields: any) => {
                if (err) {
                    throw new Error(err.message);
                }
                resolve(result);
            })
        });
    }

    async getPost(source: SourceEnum): Promise<Post[]> {
        const result = await this.execQuery(source, `select wp.ID,
                                                    wp.post_date_gmt,
                                                    wp.post_content,
                                                    wp.post_title,
                                                    wp.post_name
                                             from wp_posts wp
                                             where wp.post_status = ?
                                               and wp.post_type = ?
                                             order by wp.post_date DESC
                                             limit 10;`,
            ['publish', 'post'])
        return result as Post[];
    }

    async getPostByCategories(source: SourceEnum, categories: Array<string>): Promise<Post[]> {
        const params = ['publish', 'post'];
        params.push(categories.toString())

        const result = await this.execQuery(source, `select wp.ID,
                                                    wp.post_date_gmt,
                                                    wp.post_content,
                                                    wp.post_title,
                                                    wp.post_name
                                             from wp_posts wp
                                                      LEFT JOIN wp_term_relationships rel ON rel.object_id = wp.ID
                                                      LEFT JOIN wp_term_taxonomy tax ON tax.term_taxonomy_id = rel.term_taxonomy_id
                                                      LEFT JOIN wp_terms t ON t.term_id = tax.term_id
                                             where wp.post_status = ?
                                               and wp.post_type = ?
                                               and t.term_id IN (?)
                                             order by wp.post_date DESC
                                             limit 15;`,
            params)
        return result as Post[];
    }

    async getAttachment(source: SourceEnum, post: Post): Promise<Attachment[]> {
        const result = await this.execQuery(source, `select post_title, guid
                                             from wp_posts
                                             where post_parent = ?
                                               and post_type = ?`, [post.ID.toString(), 'attachment']);
        return result as Attachment[];
    }

    async getCategories(source: SourceEnum, post: Post): Promise<Category[]> {
        const result = await this.execQuery(source, `select t.term_id, t.name, t.slug
                                             from wp_posts wp
                                                      LEFT JOIN wp_term_relationships rel ON rel.object_id = wp.ID
                                                      LEFT JOIN wp_term_taxonomy tax ON tax.term_taxonomy_id = rel.term_taxonomy_id
                                                      LEFT JOIN wp_terms t ON t.term_id = tax.term_id
                                             where wp.ID = ?`, [post.ID.toString()]);
        return result as Category[];
    }
}

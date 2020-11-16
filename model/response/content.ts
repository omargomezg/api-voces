import {Author} from "./author";

export abstract class Content {
    id: number;
    published: Date;
    updated: Date;
    title: string;
    name: string;
    author: Author;

    protected constructor() {
        this.id = 0;
        this.published = new Date();
        this.updated = new Date();
        this.title = '';
        this.name = '';
        this.author = new Author();
    }
}

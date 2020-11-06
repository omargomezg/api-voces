import {Category} from "./category";
import {Content} from "./content";
import {Attachment} from "./attachment";

export class Post extends Content {
    post_content: string;
    categories: Category[] = [];
    attachments: Attachment[];

    constructor() {
        super();
        this.post_content = '';
        this.attachments = [];
    }
}
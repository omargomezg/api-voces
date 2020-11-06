export abstract class Content {
    ID: number;
    post_date_gmt: Date;
    post_title: string;
    post_name: string;

    protected constructor() {
        this.ID = 0;
        this.post_date_gmt = new Date();
        this.post_title = '';
        this.post_name = '';
    }
}
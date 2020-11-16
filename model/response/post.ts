import {Category} from "./category";
import {Content} from "./content";
import {FeatureImage} from "./featureImage";

export class Post extends Content {
    post_content: string;
    categories: Category[] = [];
    featureImage: FeatureImage;

    constructor() {
        super();
        this.post_content = '';
        this.featureImage = new FeatureImage();
    }
}

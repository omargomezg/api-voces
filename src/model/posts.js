const Sequelize = require('sequelize');

module.exports = sequelize.define('wp_posts', {
    ID: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    post_title: Sequelize.TEXT
})

const { Model } = require('sequelize');
const sequelize = new Sequelize()

class Posts extends Model {}

Posts.init({

}, {
    sequelize
});
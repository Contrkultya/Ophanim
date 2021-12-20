module.exports = (sequelize, Sequelize) => {
    return sequelize.define("parse", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        user_id: {
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.STRING
        },
        photo: {
            type: Sequelize.BLOB
        },
        messages: {
            type: Sequelize.STRING
        },
        messages_orig: {
            type: Sequelize.STRING
        }
    });
};

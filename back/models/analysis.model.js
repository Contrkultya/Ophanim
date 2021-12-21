module.exports = (sequelize, Sequelize) => {
    return sequelize.define("analysis", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        parse_id: {
            type: Sequelize.INTEGER
        },
        user_id: {
            type: Sequelize.INTEGER
        },
        status: {
            type: Sequelize.STRING
        },
        result: {
            type: Sequelize.TEXT
        }
    });
};

module.exports = (sequelize, Sequelize) => {
    return sequelize.define("analysis", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        parse_id: {
            type: Sequelize.INTEGER
        },
        user_id: {
            type: Sequelize.INTEGER
        },
        status: {
            type: Sequelize.BOOLEAN
        },
        result: {
            type: Sequelize.BOOLEAN
        }
    });
};

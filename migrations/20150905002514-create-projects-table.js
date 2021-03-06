var dbm = global.dbm || require('db-migrate')
var type = dbm.dataType
var databaseConfig = require('../app/config/database')

exports.up = function (db, callback) {
  db.createTable(databaseConfig.PROJECTS_TABLE, {
    id: { type: type.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: type.STRING, notNull: true },
    user_id: {
      type: type.INTEGER,
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'project_user_id_fk',
        table: databaseConfig.USERS_TABLE,
        rules: { onDelete: 'CASCADE' },
        mapping: 'id'
      }
    }
  }, callback)
}

exports.down = function (db, callback) {
  db.dropTable('projects', callback)
}

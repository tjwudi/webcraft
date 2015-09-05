/**
 * Project ORM
 */

var bookshelf = appRequire('app/init/database').bookshelf
var databaseConfig = appRequire('app/config/database')
var randomString = require('randomstring')
var validator = require('validator')
var dataRules = appRequire('app/config/data-rules')
var Promise = require('bluebird')
var User;

var Project = bookshelf.Model.extend({
  tableName: databaseConfig.PROJECTS_TABLE,
}, {
  /**
   * Generate a project name for the user
   * @param  {[type]}
   * @return {[type]}
   */
  _generateName: function (user) {
    return new Promise(function (resolve, reject) {
      function generate () {
        var projectName = randomString.generate(dataRules.DEFAULT_PROJECT_NAME_LENGTH)
        return user.hasProjectName(projectName).then(function (hasProjectName) {
          if (hasProjectName) return generate.call(null, user)
          else return projectName
        })
      }
      generate().then(resolve, reject)
    })
  },

  /**
   * Factory function to create a Project
   *
   * @public
   * @param  {object} attrs - Project attributes
   * @return {Promise}
   */
  createProject: function (attrs) {
    return new Promise(function (resolve, reject) {
      // Find the user
      new User({ id: attrs['user_id'] })
        .fetch()
        .then(function (user) {
          return Project._generateName(user)
        }, reject)
        // Assign name and save project
        .then(function (projectName) {
          attrs['name'] = projectName
          var project = new Project(attrs)
          return project.save()
        }, reject)
        .then(resolve, reject)
    })
  },

  user: function () {
    return this.belongsTo(User)
  }
})

Project = bookshelf.model('Project', Project)
User = bookshelf.model('User') || appRequire('app/models/User')

module.exports = Project

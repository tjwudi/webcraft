require('./global-bootstrap')

var gulp = require('gulp')
var mocha = require('gulp-mocha')
var standard = require('gulp-standard')

gulp.task('standardTest:tests', function () {
  return gulp.src('./tests/**/*-spec.js')
    .pipe(standard({
      globals: ['appRequire', 'describe', 'it', 'should', 'beforeEach', 'afterEach']
    }))
    .pipe(standard.reporter('default'))
})

gulp.task('standardTest:nodeApp', function () {
  return gulp.src(['./app/**/*.js', './migrations/**/*.js'])
    .pipe(standard({
      globals: ['require', 'process', 'appRequire']
    }))
    .pipe(standard.reporter('default'))
})

gulp.task('standardTest', function () {
  gulp.run('standardTest:tests')
  gulp.run('standardTest:nodeApp')
})

gulp.task('mochaTest', function () {
  return gulp.src('./tests/**/*-spec.js')
    .pipe(mocha({
      require: ['should', './global-bootstrap']
    }))
})

gulp.task('test', function () {
  gulp.run('standardTest')
  gulp.run('mochaTest')
})

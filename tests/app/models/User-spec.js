var User = appRequire('app/models/User')
var dbTracker = require('mock-knex').getTracker()
var bcrypt = require('bcrypt-nodejs')
var should = require('should')

describe('User', function () {
  describe('_comparePassword', function () {
    it('should output true when raw password matches encrypted password', function (done) {
      const password = 'abc'
      const encryptedPassword = bcrypt.hashSync('abc')
      User._comparePassword(password, encryptedPassword, function (err, passwordValid) {
        if (err) done(err)
        passwordValid.should.be.ok()
        done()
      })
    })

    it('should output false when raw password does not match encrypted password', function (done) {
      const password = 'abcd'
      const encryptedPassword = bcrypt.hashSync('abc')
      User._comparePassword(password, encryptedPassword, function (err, passwordValid) {
        if (err) done(err)
        passwordValid.should.not.be.ok()
        done()
      })
    })
  })

  describe('getUserByUsername', function () {
    it('should resolves a correct user if the username matches any user', function (done) {
      dbTracker.install()
      const username = 'abc'

      User.getUserByUsername(username).then(function (user) {
        should.exist(user)
        user.has('username').should.be.ok()
        user.get('username').should.equal(username)
        done()
      })

      dbTracker.on('query', function (query) {
        query.method.should.equal('select')
        query.response([{
          id: 1,
          username: username
        }])
      })
    })

    it('should resolves undefined if the username matches any user', function (done) {
      dbTracker.install()

      User.getUserByUsername('abc').then(function (user) {
        should.not.exist(user)
        done()
      })

      dbTracker.on('query', function (query) {
        query.method.should.equal('select')
        query.response([])
      })
    })
  })

  describe('registerUser', function () {
    beforeEach(function () {
      dbTracker.install()
    })

    it('should register user and return the user model when infos are valid', function (done) {
      var password = 'abcddd'
      var attrs = {
        username: 'johndd',
        password: password
      }
      User.registerUser(attrs, attrs.password)
        .then(function (user) {
          should.exist(user)
          should(user instanceof User).be.ok()
          user.get('username').should.equal(attrs.username)
          // password should be encrypted!
          bcrypt.compareSync(password, user.get('password')).should.be.ok
          done()
        }, function (err) {
          should.not.exist(err)
        })
      dbTracker.on('query', function (query) {
        if (query.method === 'insert') {
          query.response(1)
        }
        if (query.method === 'select') {
          query.response([{ count: 0 }])
        }
      })
    })

    it('should reject when username exists', function (done) {
      var attrs = {
        username: 'johndd',
        password: 'password'
      }
      User.registerUser(attrs, attrs.password)
        .then(function (user) {
          throw Error('Should not be called')
        }, function (err) {
          should.exist(err)
          done()
        })
      dbTracker.on('query', function (query) {
        if (query.method === 'select') {
          query.response([{ count: 1 }])
        }
      })
    })

    it('should reject when password does not match confirmedPassword', function (done) {
      var attrs = {
        username: 'johnnn',
        password: 'johnnn'
      }
      User.registerUser(attrs, 'abcddd')
        .then(function () {
          throw new Error('should not be called')
        }, function (err) {
          should.exist(err)
          err.message.should.equal('Password does not match confirmed password')
          done()
        })
    })

    it('should reject when username/password format is not correct', function (done) {
      var attrsForTesting = [
        { username: 'joh', password: 'abcwwee' },
        { username: 'johnnmnnnnnnnnnbnbnbnbnbnbnbnbnn', password: 'abcwwee' },
        { username: 'johnnmn', password: 'abc' },
        { username: 'johnnmn', password: 'johnnmnnnnnnnnnbnbnbnbnbnbnbnbnn' }
      ]
      Promise.all(attrsForTesting.map(function (attrs) {
        return User.registerUser(attrs, attrs.password)
          .then(function () {
            throw Error('should not be called')
          }, function (err) {
            should.exist(err)
          })
      })).then(function (results) {
        results.forEach(function (result) {
          should.not.exist(result)
        })
        done()
      })
    })
  })
})

describe('user', function () {
  describe('validatePassword', function () {
    it('should resolve true when passwords match', function (done) {
      const password = 'abc'
      User.forge({ id: 1, username: 'diwu', password: bcrypt.hashSync(password) })
        .validatePassword(password)
        .then(function (isPasswordValid) {
          isPasswordValid.should.be.ok()
          done()
        })
    })

    it('should resolve false when passwords does not match', function (done) {
      const password = 'abc'
      User.forge({ id: 1, username: 'diwu', password: bcrypt.hashSync(password) })
        .validatePassword(password + 'd')
        .then(function (isPasswordValid) {
          isPasswordValid.should.not.be.ok()
          done()
        })
    })
  })
})

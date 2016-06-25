jest.unmock('../password.js');
jest.useRealTimers();

const Promise = require('bluebird');
const bcrypt = require('../promisifiedBcrypt.js');
const password = require('../password.js');
const db = require('../db.js');

describe('password', () => {

  let collection;
  beforeEach(() => {
    collection = {
      updateOneAsync: jest.genMockFunction().mockReturnValue(Promise.resolve()),
      findOneAsync: jest.genMockFunction().mockReturnValue(Promise.resolve())
    };
    db.collection.mockReturnValue(collection);

    bcrypt.hashAsync.mockImplementation(value => {
      return Promise.resolve(value + '-hash');
    });
    bcrypt.compareAsync.mockImplementation((value, hashed) => {
      return Promise.resolve(value + '-hash' === hashed);
    });
  });

  describe('set', () => {

    it('resolves and sets the password when no old password', done => {
      password.set({ callId: 'test123', password: 'abc' })
      .then(() => {
        expect(collection.findOneAsync.mock.calls.length).toBe(1);
        expect(collection.findOneAsync.mock.calls[0][0]).toEqual({
          callId: 'test123'
        });

        expect(collection.updateOneAsync.mock.calls.length).toBe(1);
        expect(collection.updateOneAsync.mock.calls[0]).toEqual([{
          callId: 'test123',
        }, {
          $set: {
            password: 'abc-hash'
          }
        }, {
          upsert: true
        }]);
      })
      .then(done)
      .catch(done.fail);
    });

    it('resolves and updates the password when oldPassword matches', done => {
      collection.findOneAsync.mockReturnValue(Promise.resolve({
        callId: 'test123',
        password: 'abc-hash'
      }));

      password.set({ callId: 'test123', oldPassword: 'abc', password: 'def' })
      .then(() => {
        expect(collection.findOneAsync.mock.calls.length).toBe(1);
        expect(collection.findOneAsync.mock.calls[0][0]).toEqual({
          callId: 'test123'
        });

        expect(collection.updateOneAsync.mock.calls.length).toBe(1);
        expect(collection.updateOneAsync.mock.calls[0]).toEqual([{
          callId: 'test123',
        }, {
          $set: {
            password: 'def-hash'
          }
        }, {
          upsert: true
        }]);

      })
      .then(done)
      .catch(done.fail);
    });

    it('gets rejected when oldPassword does not match', done => {
      collection.findOneAsync.mockReturnValue(Promise.resolve({
        callId: 'test123',
        password: 'abc-hash'
      }));

      let err;
      password.set({ callId: 'test123', oldPassword: 'inv', password: 'def' })
      .catch(_err => err = _err)
      .then(() => {
        expect(err).toBeTruthy();
        expect(err.message).toBe('Invalid credentials');
      })
      .then(done)
      .catch(done.fail);
    });

  });

  describe('verify', () => {

    it('gets rejected when no credentials provided', done => {
      let err;
      password.verify()
      .catch(_err => err = _err)
      .then(() => expect(err).toBeTruthy())
      .then(done)
      .catch(done.fail);
    });

    it('resolves when no call', done => {
      password.verify({ callId: 'bla123', password: '12345' })
      .then(done)
      .catch(done.fail);
    });

    it('resolves to true when blank password for call', done => {
      collection.findOneAsync.mockReturnValue(Promise.resolve({
        callId: 'test123',
        password: 'abc-hash'
      }));

      password.verify({ callId: 'bla123', password: 'abc' })
      .then(() => {
        expect(collection.findOneAsync.mock.calls.length).toBe(1);
        expect(collection.findOneAsync.mock.calls[0][0]).toEqual({
          callId: 'bla123'
        });
      })
      .then(done)
      .catch(done.fail);
    });

    it('gets rejected  when invalid password', done => {
      collection.findOneAsync.mockReturnValue(Promise.resolve({
        callId: 'test123',
        password: 'abc-hash'
      }));

      let err;
      password.verify({ callId: 'bla123', password: 'invalid' })
      .catch(_err => err = _err)
      .then(() => {
        expect(err).toBeTruthy();
        expect(err.message).toBe('Invalid credentials');
      })
      .then(done)
      .catch(done.fail);
    });

  });

  describe('isRequired', () => {

    it('resolves to false when call does not exist', done => {
      password.isRequired('test123')
      .then(required => expect(required).toBe(false))
      .then(done)
      .catch(done.fail);
    });

    it('resolves to false when password not set for call', done => {
      collection.findOneAsync.mockReturnValue(Promise.resolve({
        callId: 'test123',
        password: ''
      }));

      password.isRequired('test123')
      .then(required => expect(required).toBe(false))
      .then(done)
      .catch(done.fail);
    });

    it('resolves to false when password is required', done => {
      collection.findOneAsync.mockReturnValue(Promise.resolve({
        callId: 'test123',
        password: 'password'
      }));

      password.isRequired('test123')
      .then(required => expect(required).toBe(true))
      .then(done)
      .catch(done.fail);
    });

  });

});

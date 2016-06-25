jest.unmock('../db.js');

const Promise = require('bluebird');
const db = require('../db.js');
const config = require('config');
const mongo = require('../promisifiedMongo.js');

describe('db', () => {

  let mongodb;
  beforeEach(() => {
    mongo.connectAsync.mockClear();
    config.get.mockClear();

    mongodb = {
      collection: jest.genMockFunction()
    };
    mongo.connectAsync.mockReturnValue(Promise.resolve(mongodb));
    config.get.mockReturnValue('mongodb://');
  });

  describe('connect', () => {

    it('returns a promise with db instance', done => {
      db.connect()
      .then(mongodb => {
        expect(config.get.mock.calls.length).toBe(1);
        expect(config.get.mock.calls[0][0]).toBe('database');

        expect(mongo.connectAsync.mock.calls.length).toBe(1);
        expect(mongo.connectAsync.mock.calls[0][0]).toBe('mongodb://');

        expect(mongodb.collection).toEqual(jasmine.any(Function));
        expect(mongodb.collectionAsync).toEqual(jasmine.any(Function));
        done();
      });

    });

  });

  describe('get', () => {

    let d;
    beforeEach(done => {
      db.connect()
      .then(_d => (d = _d))
      .then(() => done());
    });

    it('returns an existing db instance', () => {
      expect(db.get()).toBe(d);
    });

  });

  describe('collection', () => {

    let d, c;
    beforeEach(done => {
      c = {};
      db.connect()
      .then(_d => (d = _d))
      .then(() => d.collection.mockReturnValue(c))
      .then(() => done());
    });

    it('returns a collection', () => {
      let collection = db.collection('test');
      expect(collection).toBe(c);
      expect(d.collection.mock.calls.length).toBe(1);
      expect(d.collection.mock.calls).toEqual([[ 'test' ]]);
    });

  });

});

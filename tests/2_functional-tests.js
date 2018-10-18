/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({
            stock: 'goog'
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData');
            assert.typeOf(res.body.stockData, 'object');
            assert.property(res.body.stockData, 'stock');
            assert.typeOf(res.body.stockData.stock, 'string');
            assert.property(res.body.stockData, 'price');
            assert.typeOf(res.body.stockData.price, 'number');
            assert.property(res.body.stockData, 'likes');
            assert.typeOf(res.body.stockData.likes, 'number');
            assert.equal(res.body.stockData.likes, 0);
            done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({
            stock: 'goog',
            like: true
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData');
            assert.typeOf(res.body.stockData, 'object');
            assert.property(res.body.stockData, 'stock');
            assert.typeOf(res.body.stockData.stock, 'string');
            assert.property(res.body.stockData, 'price');
            assert.typeOf(res.body.stockData.price, 'number');
            assert.property(res.body.stockData, 'likes');
            assert.typeOf(res.body.stockData.likes, 'number');
            assert.equal(res.body.stockData.likes, 1);
            done();
          });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({
            stock: 'goog',
            like: true
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData');
            assert.typeOf(res.body.stockData, 'object');
            assert.property(res.body.stockData, 'stock');
            assert.typeOf(res.body.stockData.stock, 'string');
            assert.property(res.body.stockData, 'price');
            assert.typeOf(res.body.stockData.price, 'number');
            assert.property(res.body.stockData, 'likes');
            assert.typeOf(res.body.stockData.likes, 'number');
            assert.equal(res.body.stockData.likes, 1);
            done();
          });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query('stock=goog&stock=msft')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData');
            assert.typeOf(res.body.stockData, 'array');
            assert.equal(res.body.stockData.length, 2);
            assert.property(res.body.stockData[0], 'stock');
            assert.equal(res.body.stockData[0].stock, 'goog');
            assert.property(res.body.stockData[0], 'price');
            assert.typeOf(res.body.stockData[0].price, 'number');
            assert.property(res.body.stockData[0], 'rel_likes');
            assert.equal(res.body.stockData[0].rel_likes, 1);
            assert.property(res.body.stockData[1], 'stock');
            assert.equal(res.body.stockData[1].stock, 'msft');
            assert.property(res.body.stockData[1], 'price');
            assert.typeOf(res.body.stockData[1].price, 'number');
            assert.property(res.body.stockData[1], 'rel_likes');
            assert.equal(res.body.stockData[1].rel_likes, -1);
            done();
          });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query('stock=appl&stock=intu&likes=true')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData');
            assert.typeOf(res.body.stockData, 'array');
            assert.equal(res.body.stockData.length, 2);
            assert.property(res.body.stockData[0], 'stock');
            assert.equal(res.body.stockData[0].stock, 'appl');
            assert.property(res.body.stockData[0], 'price');
            assert.typeOf(res.body.stockData[0].price, 'number');
            assert.property(res.body.stockData[0], 'rel_likes');
            assert.equal(res.body.stockData[0].rel_likes, 0);
            assert.property(res.body.stockData[1], 'stock');
            assert.equal(res.body.stockData[1].stock, 'intu');
            assert.property(res.body.stockData[1], 'price');
            assert.typeOf(res.body.stockData[1].price, 'number');
            assert.property(res.body.stockData[1], 'rel_likes');
            assert.equal(res.body.stockData[1].rel_likes, 0);
            done();
          });
      });      
    });
});

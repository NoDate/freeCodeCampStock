/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var https = require('https');
var expect = require('chai').expect;

let mongoose = require('mongoose');

// Connect to database
mongoose.connect(process.env.DB);
let db = mongoose.connection;

let stockSchema;
let stockModel;

db.once('open', () => {
  // Create stock schema
  stockSchema = new mongoose.Schema({
    stock: String,
    ip: Array
  });
  
  // Create stock model
  stockModel = mongoose.model('stock', stockSchema);
});

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get((req, res) => {
      let stockList = [];
        
      // Check if stock specified
      if (!req.query.stock) {
        res.send('no stocks specified');
        return;
      }
    
      // Get stock list
      let stockNames;
      if (typeof req.query.stock === 'object') {
        stockNames = req.query.stock;
      } else {
        stockNames = [ req.query.stock ];
      }
    
      let promises = [];
    
      stockNames.forEach(stockName => {
        // Add stock promise
        promises.push(addStock(stockName));
      });
    
      Promise.all(promises).then(stocks => {
        promises = [];
        
        if (req.query.like) {
          stockNames.forEach(stockName => {
            // Add ip to stock promise
            promises.push(addIP(stockName, req.ip));
          });
        }
        
        Promise.all(promises).then(stocks => {
          promises = [];
          
          stockNames.forEach((stockName) => {
            // Find stock promise
            promises.push(stockModel.findOne({ stock: stockName }).exec());
          });
          
          Promise.all(promises).then(stocks => {
            stocks.forEach(stock => {
              // Add to stock list
              stockList.push({
                stock: stock.stock,
                likes: stock.ip.length
              });
            });
            
            promises = [];

            stockList.forEach((stocks) => {
              // Stock price promise
              promises.push(getStockPrice(stocks.stock));
            });
            
            Promise.all(promises).then(prices => {
              stockList.forEach((stock, index) => {
                // Add stock price
                stock.price = prices[index];
              });
              
              if (stockList.length === 2) {
                // Get relative likes
                let rel = stockList[0].likes - stockList[1].likes;
                
                // Remove likes count
                delete stockList[0].likes;
                delete stockList[1].likes;
                
                // Add relative likes
                stockList[0].rel_likes = rel;
                stockList[1].rel_likes = -rel;
              }

              // Return list
              if (stockList.length === 1) {
                res.json({
                  stockData: stockList[0]
                });
              } else {
                res.json({
                  stockData: stockList
                });
              }
            });
          });          
        });
      });
    });
  
  // Gets stock prices
  const getStockPrice = stock => {
    return new Promise((resolve, reject) => {
      let get = https.get('https://finance.google.com/finance/info?q=NASDAQ%3a' + stock, (res) => {
        
        let rawData = '';
        res.on('data', chunk => { rawData += chunk; });
        res.on('end', () => { 
          // The API no longer works, so just adding a random number
          //resolve(rawData);
          
          resolve(Math.floor(10000 * Math.random()) / 100);
          return;
        });
      });
    });
  };
  
  // Add stock to databsae if not found
  const addStock = stockName => {
    return new Promise((resolve, reject) => {
      // Find stock
      stockModel.findOne({ stock: stockName }, (err, stock) => {        
        // Check if found
        if (stock) {
          resolve();
          return;
        }
        
        // Add new stock
        let stockAdd = new stockModel({
          stock: stockName,
          ip: [],
          testing: 'testing'
        });
        stockAdd.save(stock => {
          resolve();
          return;
        });
      });
    });
  };
  
  // Add ip to stock
  const addIP = (stockName, ip) => {
    return new Promise((resolve, reject) => {
      // Find stock
      stockModel.findOne({ stock: stockName }, (err, stock) => {
        // Check if stock found
        if (!stock) {
          resolve();
          return;
        }
        
        // Check if ip already exists
        if (stock.ip.includes(ip)) {
          resolve();
          return;
        }
        
        // Add ip
        stock.ip.push(ip);
        
        // Save stock
        stock.save((err, stock) => {
          resolve();
          return;
        });        
      });
    });
  };
};

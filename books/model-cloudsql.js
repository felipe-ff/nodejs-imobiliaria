// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//    http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const extend = require('lodash').assign;
const mysql = require('mysql');
const config = require('../config');

const options = {
  user: config.get('MYSQL_USER'),
  password: config.get('MYSQL_PASSWORD'),
  database: 'bookshelf',
};

if (
  config.get('INSTANCE_CONNECTION_NAME') &&
  config.get('NODE_ENV') === 'production'
) {
  options.socketPath = `/cloudsql/${config.get('INSTANCE_CONNECTION_NAME')}`;
}

const connection = mysql.createConnection(options);

function listBuildWhere(params) {
  let sql = '';
  if (params && params !== 'undefined') {
    let obj = JSON.parse(params);
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key]) {
        let value = obj[key];
        if (value.hasOwnProperty('code') && !value.code) continue;
        sql += !sql ? ' where ' : ' AND ';
        if (key === 'rangeValues') {
          sql += 'b.price BETWEEN ' + value[0] + ' AND ' + value[1];
        } else if (key === 'purpose') {
          sql += key + ' = ' + "\'" + value.code + "\'";
        } else {
          sql += key + ' = ' + value;
        }
      }
    }
    console.log(sql);
  }
  return sql;
}

function list(limit, params, token, cb) {
  //token = token ? parseInt(token, 10) : 0;
  var whereClause = listBuildWhere(params);
  connection.query(
    'SELECT * FROM `books` b left join imagesUrl i on (b.id = i.bookId)' + whereClause, //LIMIT ? OFFSET ?
    //[limit, token],
    (err, results) => {
      if (err) {
        cb(err);
        return;
      }

      let values = {};
      let uniqueArray = results.filter(function(item) {
          let val = item['id'];
          let exists = values[val];
          values[val] = true;
          return !exists;
      });

      const hasMore = results.length === limit ? token + results.length : false;
      cb(null, uniqueArray, hasMore);
    }
  );
}

function create(data, cb) {
  connection.query('INSERT INTO `books` SET ?', data, (err, res) => {
    if (err) {
      cb(err);
      return;
    }
    cb(null, res.insertId);
  });
}

function createImagesUrl(data, cb) {
  var sql = 'INSERT INTO `imagesUrl` (bookId, imageUrl) VALUES ?';
  var values = [];
  for (let i = 0; data.imageUrl.length > i; i++) {
    let j = i + 1;
    let myValues = [];
    myValues.push(data.bookId, data.imageUrl[i]);
    values.push(myValues);
  }
  
  connection.query(sql, [values], (err, res) => {
    if (err) {
      cb(err);
      return;
    }
    read(res.insertId, cb);
  });
}

function read(id, cb) {
  connection.query(
    'SELECT * FROM `books` left join `imagesUrl` on (books.id = imagesUrl.bookId) WHERE books.id = ?',
    id,
    (err, results) => {
      if (!err && !results.length) {
        err = {
          code: 404,
          message: 'Not found',
        };
      }
      if (err) {
        cb(err);
        return;
      }

      cb(null, results);
    }
  );
}

function update(id, data, cb) {
  connection.query('UPDATE `books` SET ? WHERE `id` = ?', [data, id], err => {
    if (err) {
      cb(err);
      return;
    }
    read(id, cb);
  });
}

function _delete(id, cb) {
  connection.query('DELETE FROM `books` WHERE `id` = ?', id, cb);
}

module.exports = {
  createSchema: createSchema,
  list: list,
  create: create,
  read: read,
  update: update,
  createImagesUrl: createImagesUrl,
  delete: _delete,
};

if (module === require.main) {
  const prompt = require('prompt');
  prompt.start();

  console.log(
    `Running this script directly will allow you to initialize your mysql database.
    This script will not modify any existing tables.`
  );

  prompt.get(['user', 'password'], (err, result) => {
    if (err) {
      return;
    }
    createSchema(result);
  });
}

function createSchema(config) {
  const connection = mysql.createConnection(
    extend(
      {
        multipleStatements: true,
      },
      config
    )
  );

  connection.query(
    `CREATE DATABASE IF NOT EXISTS \`bookshelf\`
      DEFAULT CHARACTER SET = 'utf8'
      DEFAULT COLLATE 'utf8_general_ci';
    USE \`bookshelf\`;
    CREATE TABLE IF NOT EXISTS \`bookshelf\`.\`books\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`title\` VARCHAR(255) NULL,
      \`author\` VARCHAR(255) NULL,
      \`publishedDate\` VARCHAR(255) NULL,
      \`imageUrl\` VARCHAR(255) NULL,
      \`description\` TEXT NULL,
      \`createdBy\` VARCHAR(255) NULL,
      \`createdById\` VARCHAR(255) NULL,
    PRIMARY KEY (\`id\`));`,
    err => {
      if (err) {
        throw err;
      }
      console.log('Successfully created schema');
      connection.end();
    }
  );
}

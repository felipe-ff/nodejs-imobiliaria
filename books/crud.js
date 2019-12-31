// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const images = require('../lib/images');

function getModel() {
  return require('./model-datastore');
}

const router = express.Router();

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({extended: false}));

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});


/**
 * POST /books/add
 *
 * Create a book.
 */
// [START add]
router.post('/add', images.multer.array('images'), images.sendUploadToGCS, (req, res, next) => {
    let data = req.body;
    let dataImg = {};

    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    dataImg.imageUrl = [];
    if (req.files) {
      req.files.forEach(element => {
        if (element.cloudStoragePublicUrl) {
          dataImg.imageUrl.push(element.cloudStoragePublicUrl); //usar o filter aqui
        }
      });
      //dataImg.imageUrl = dataImg.imageUrl.slice(0, -1);
    }

    data.imageUrl = dataImg.imageUrl;
    // Save the data to the database.
    getModel().create(data, (err, savedId) => {
      if (err) {
        next(err);
        return;
      }

      dataImg.bookId = savedId;
      //res.json(`${savedId}`);
      res.json(savedId);
    });
  }
);
// [END add]

/**
 * GET /books/:id/edit
 *
 * Display a book for editing.
 */
router.get('/:book/edit', (req, res, next) => {
  getModel().read(req.params.book, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('books/form.pug', {
      book: entity,
      action: 'Edit',
    });
  });
});

/**
 * Errors on "/books/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = err.message;
  next(err);
});

module.exports = router;

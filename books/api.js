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
const passport = require('passport');
const auth = require('../routes/auth');
const User = require('../models/User');
const moment = require('moment');

function getModel() {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /api/books
 */
router.get('/', (req, res, next) => {
  getModel().list(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    //console.log(moment().isBefore(moment(req.session.cookie._expires)));

    res.json({
      items: entities,
    });
  });
});

/**
 * POST /api/books
 */
router.post('/', (req, res, next) => {
  getModel().create(req.body, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});

/**
 * POST /api/books/login
 * POST login route (optional, everyone has access)
 */
router.post('/login', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if (err) {
      return next(err);
    }

    if (err || !passportUser) {
      return res.status(400).json({
          message: 'Something is not right',
          user   : user
      });
    }

    if (passportUser) {
      req.login(user, {session: false}, (err) => {
        if (err) {
            res.send(err);
        }
        const user = passportUser;
        user.token = User.generateJWT(passportUser.id, passportUser.email);
        //req.isAuthenticated() = true;
        //res.cookie("SESSIONID", user.token, {httpOnly:true, secure:true, maxAge: 555});

        return res.json({ user: User.toAuthJSON(passportUser.id, passportUser.email) });
      });
    }
  })(req, res, next);
});

/**
 * GET /api/books/:id
 */
router.get('/:book', (req, res, next) => {
  getModel().read(req.params.book, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    //entity.loggedIn = req.session._expires ? moment().isBefore(req.session._expires) : false;
    res.json(entity);
  });
});

/**
 * PUT /api/books/:id
 */
router.put('/:book', auth.required, (req, res, next) => {
  getModel().update(req.params.book, req.body, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});

/**
 * DELETE /api/books/:id
 */
router.delete('/:book', auth.required, (req, res, next) => {
  getModel().delete(req.params.book, err => {
    if (err) {
      next(err);
      return;
    }
    res.status(200).send();
  });
});

/**
 * Errors on "/api/books/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and responding to the request
  err.response = {
    message: err.message,
    internalCode: err.code,
  };
  next(err);
});

module.exports = router;

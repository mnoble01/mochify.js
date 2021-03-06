/*eslint-env mocha*/
/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var assert  = require('assert');
var fs      = require('fs');
var through = require('through2');
var api     = require('./fixture/api');
var sandbox = require('./fixture/sandbox');
var mochify = require('../lib/mochify');


describe('api', function () {
  this.timeout(10000);

  function validateOutput(expect, done) {
    return function (err, buf) {
      if (err) {
        done(err);
        return;
      }
      assert.equal(String(buf), expect);
      done();
    };
  }

  it('runs phantomjs', function (done) {
    mochify('./test/fixture/passes/test/*.js', {
      output   : through(),
      reporter : 'tap'
    }).bundle(validateOutput('1..1\n'
      + 'ok 1 test passes\n'
      + '# tests 1\n'
      + '# pass 1\n'
      + '# fail 0\n', done));
  });

  it('runs node', function (done) {
    mochify('./test/fixture/passes/test/*.js', {
      output   : through(),
      reporter : 'tap',
      node     : true
    }).bundle(validateOutput('1..1\n'
      + 'ok 1 test passes\n'
      + '# tests 1\n'
      + '# pass 1\n'
      + '# fail 0\n', done));
  });

  it('uses defaults', function (done) {
    api('api-defaults.js', function (code, stdout) {
      assert.equal(code, 0);
      assert.equal(stdout.split('\n')[0], '# phantomjs:');
      done();
    });
  });

  it('uses only path', function (done) {
    api('api-only-path.js', function (code, stdout) {
      assert.equal(code, 0);
      assert.equal(stdout.split('\n')[0], '# phantomjs:');
      done();
    });
  });

  it('uses only options', function (done) {
    api('api-only-options.js', function (code, stdout) {
      assert.equal(code, 0);
      assert.equal(stdout.split('\n')[0], '# node:');
      done();
    });
  });

  it('uses only callback', function (done) {
    api('api-only-callback.js', function (code) {
      assert.equal(code, 42);
      done();
    });
  });

  it('uses options and callback', function (done) {
    api('api-options-callback.js', function (code, stdout) {
      assert.equal(code, 42);
      assert.equal(stdout.split('\n')[0], '# node:');
      done();
    });
  });

  it('should only run 1 test when glob options are passed', function (done) {
    mochify('./test/fixture/glob/ignore/*.js', {
      output   : through(),
      reporter: 'tap',
      glob: {
        ignore: './test/fixture/glob/ignore/excluded.js'
      }
    }).bundle(function (err, buf) {
      if (err) {
        return done(err);
      }
      assert(String(buf).indexOf('# tests 1') !== -1);
      done();
    });
  });

  it('looks imported modules from specified path', function (done) {
    mochify('./test/fixture/paths/test/*.js', {
      node: true,
      reporter: 'tap',
      path : ['./test/fixture/']
    }).bundle(validateOutput('1..1\n'
      + 'ok 1 test passes\n'
      + '# tests 1\n'
      + '# pass 1\n'
      + '# fail 0\n', done));
  });

  it('should write a test-runner html document when --consolify is used',
    sandbox(function (done, tmpdir) {
      mochify('./test/fixture/passes/test/*.js', {
        consolify: tmpdir + '/output.html'
      }).bundle(function (err) {
        if (err) {
          return done(err);
        }
        try {
          fs.statSync(tmpdir + '/output.html');
          done();
        } catch (e) {
          done(e);
        }
      });
    })
  );

  it('should extract the script to an external bundle when --bundle is used'
    + ' with --consolify',
    sandbox(function (done, tmpdir) {
      mochify('./test/fixture/passes/test/*.js', {
        consolify: tmpdir + '/output.html',
        bundle: tmpdir + '/bundle.js'
      }).bundle(function (err) {
        if (err) {
          return done(err);
        }
        try {
          fs.statSync(tmpdir + '/output.html');
          fs.statSync(tmpdir + '/bundle.js');
          done();
        } catch (e) {
          done(e);
        }
      });
    })
  );

});

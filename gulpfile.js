var gulp = require('gulp');
var gutil = require('gulp-util');
var log = require('gulp-util').log;
var colors = require('gulp-util').colors;
var express = require('express');
var runSequence = require('run-sequence');
var spawn = require('child_process').spawn;
var webdriverProcess;
var protractorProcess;
var expressServer;
// assume failure by default. Only protractor can set it to success
var errorCode = 1;

// clean opened processes if gulp is interrupted with ctrl + c
process.on('SIGINT', _cleanProcesses);

gulp.task('webserver', function (done) {
  var expressInstance = express();
  expressInstance.use(express.static(__dirname + '/src'));

  var port = 8085;
  expressServer = expressInstance.listen(port, function () {
    log(colors.yellow('Server available on http://localhost:' + port));
    done();
  });
});

gulp.task('webdriver', function (done) {
  var serverStartedMessage = 'Selenium Server is up and running';
  webdriverProcess = spawn('npm', ['run', 'test:e2e:webdriver'], {
    detached: true
  });

  webdriverProcess.stderr.on('data', _log);
  webdriverProcess.stdout.on('data', _log);

  function _log(data) {
    // detects when webdriver is ready
    if (data.indexOf(serverStartedMessage) !== -1) {
      log(colors.yellow('Webdriver started'));
      done();
    }
  }
});

gulp.task('protractor', function (done) {
  protractorProcess = spawn('npm', ['run', 'test:e2e:protractor'], {
    detached: true,
    stdio: 'inherit'
  });

  protractorProcess.on('exit', function (err) {
    errorCode = err;
    done();
  });
});

gulp.task('e2e', function (done) {
  runSequence('webserver', 'webdriver', 'protractor', function () {
    done();
    _cleanProcesses();
  });
});

gulp.task('default', ['e2e']);

/**
 * Kill child processes
 * @method _cleanProcesses
 */
function _cleanProcesses() {
  try {
    expressServer.close();
    process.kill(-webdriverProcess.pid);
  } catch (e) {}

  process.exit(errorCode);
}

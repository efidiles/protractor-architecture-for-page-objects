exports.config = {
  framework: 'jasmine2',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  troubleshoot: false,
  multiCapabilities: [{
    'browserName': 'chrome'
  }],
  specs: ['./test/e2e/spec/*.spec.js'],
  baseUrl: 'http://localhost:8085'
};

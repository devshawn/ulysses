'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var uploadCtrlStub = {
  index: 'uploadCtrl.index',
  show: 'uploadCtrl.show',
  create: 'uploadCtrl.create',
  update: 'uploadCtrl.update',
  destroy: 'uploadCtrl.destroy'
};

var authServiceStub = {
  isAuthenticated() {
    return 'authService.isAuthenticated';
  },
  hasRole(role) {
    return 'authService.hasRole.' + role;
  }
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var uploadIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './upload.controller': uploadCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Upload API Router:', function() {

  it('should return an express router instance', function() {
    uploadIndex.should.equal(routerStub);
  });

  describe('POST /api/upload', function() {

    it('should route to upload.controller.create', function() {
      routerStub.post
        .withArgs('/', 'authService.hasRole.organizer', 'uploadCtrl.create')
        .should.have.been.calledOnce;
    });

  });

});

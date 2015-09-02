var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');
var Taut = require('../lib/index');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var internals = {
    defaults: {
        startJob: function (jobId, pr, cb) {

            //console.log('starting job: ' + jobId + ' with pr: ' + pr);
            return cb();
        },
        getActiveJobs: function () {

            //console.log('getting active jobs 0');
            return {};
        },
        getActivePullRequests: function () {

            //console.log('getting active prs 0');
            return {};
        },
        getJob: function (jobId, pr) {

            //console.log('getting job: ' + jobId);
            return {
                id: '1',
                name: 'job'
            };
        }
    }
};

describe('pr', function () {

    it('startPR 1:1 from queue', function (done) {

        var taut = new Taut(internals.defaults);
        var queueObj = taut.startQueue();
        var jobId = '1';
        var pr = {
            number: 1
        };
        taut.addJob(jobId, pr);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(1);

        var intervalObj1 = setInterval(function () {

            queue = taut.getQueue();
            if (queue.length === 0) {
                clearInterval(intervalObj1);
                taut.stopQueue(queueObj);
                done();
            }
        }, 1000);
    });

    it('startPR 1:1 with running pr 1:1', function (done) {

        var taut = new Taut(internals.defaults);
        taut.settings.size = 2;
        taut.settings.getActivePullRequests = function () {

            return {
                '1': {
                    prs: {
                        '1': {}
                    }
                }
            };
        };
        var queueObj = taut.startQueue();
        var queue = taut.getQueue();
        var pr = {
            number: 1
        };
        taut.settings.startJob('1', pr, function () {

            taut.addJob('1', pr);
            queue = taut.getQueue();
            expect(queue.length).to.equal(1);
            var intervalObj = setInterval(function () {

                if (queue.length === 1) {
                    clearInterval(intervalObj);
                    taut.removeJob('1', 1);
                    taut.stopQueue(queueObj);
                    done();
                }
            }, 1000);
        });
    });

    it('startPR 1:2 with running pr 1:1 and pr 1:1 at top', function (done) {

        var taut = new Taut(internals.defaults);
        taut.settings.size = 2;
        taut.settings.getActivePullRequests = function () {

            return {
                '1': {
                    prs: {
                        '1': {}
                    }
                }
            };
        };
        var queueObj = taut.startQueue();
        var pr = {
            number: 1
        };
        taut.settings.startJob('1', pr, function () {

            taut.addJob('1', pr);
            var queue = taut.getQueue();
            expect(queue.length).to.equal(1);
            taut.addJob('1', { number: 2 });
            queue = taut.getQueue();
            expect(queue.length).to.equal(2);
            var intervalObj = setInterval(function () {

                queue = taut.getQueue();
                if (queue.length === 1) {
                    clearInterval(intervalObj);
                    taut.removeJob('1', 2);
                    taut.removeJob('1', 1);
                    taut.stopQueue(queueObj);
                    done();
                }
            }, 1000);
        });
    });

    it('addPR 1:1 with existing 1:1 queue', function (done) {

        var taut = new Taut(internals.defaults);
        taut.settings.size = 2;
        taut.settings.getActivePullRequests = function () {

            return {
                '1': {
                    prs: {
                        '1': {}
                    }
                }
            };
        };
        var queueObj = taut.startQueue();
        var queue = taut.getQueue();
        var pr = {
            number: 1
        };
        taut.addJob('1', pr);
        queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        taut.addJob('1', pr);
        queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        taut.removeJob('1', 1);
        taut.stopQueue(queueObj);
        done();
    });

    it('addPR 1:2 with running 1:1', function (done) {

        var taut = new Taut(internals.defaults);
        taut.settings.size = 2;
        taut.settings.getActivePullRequests = function () {

            return {
                '1': {
                    prs: {
                        '1': {}
                    }
                }
            };
        };
        var queueObj = taut.startQueue();
        var pr = {
            number: 2
        };
        taut.addJob('1', pr);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        taut.removeJob('1', pr.number);
        taut.stopQueue(queueObj);
        done();
    });

    it('addJob 1:null with running pr 1:1', function (done) {

        var taut = new Taut(internals.defaults);
        taut.settings.size = 2;
        taut.settings.getActivePullRequests = function () {

            return {
                '1': {
                    prs: {
                        '1': {}
                    }
                }
            };
        };
        var queueObj = taut.startQueue();
        var pr = {
            number: 1
        };
        taut.addJob('1', pr);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        taut.addJob('1', null);
        queue = taut.getQueue();
        expect(queue.length).to.equal(2);
        taut.removeJob('1', pr.number);
        taut.removeJob('1', null);
        taut.stopQueue(queueObj);
        done();
    });

    it('addJob 1:1 with running pr 1:null', function (done) {

        var taut = new Taut(internals.defaults);
        taut.settings.size = 2;
        taut.settings.getActiveJobs = function () {

            return {
                '1': {}
            };
        };
        var queueObj = taut.startQueue();
        var pr = {
            number: 1
        };
        taut.addJob('1', null);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        taut.addJob('1', pr);
        queue = taut.getQueue();
        expect(queue.length).to.equal(2);
        taut.removeJob('1', null);
        taut.removeJob('1', pr.number);
        taut.stopQueue(queueObj);
        done();
    });

    it('removeJob 1:1 with running pr 1:null', function (done) {

        var taut = new Taut(internals.defaults);
        taut.settings.size = 2;
        var queueObj = taut.startQueue();
        var pr = {
            number: 1
        };
        taut.addJob('1', null);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        taut.addJob('1', pr);
        queue = taut.getQueue();
        expect(queue.length).to.equal(2);
        taut.removeJob('1', pr.number);
        queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        taut.removeJob('1', null);
        taut.stopQueue(queueObj);
        done();
    });

    it('removeJob 1:null with running pr 1:1', function (done) {

        var taut = new Taut(internals.defaults);
        taut.settings.size = 2;
        var queueObj = taut.startQueue();
        var pr = {
            number: 1
        };
        taut.addJob('1', pr);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        taut.addJob('1', null);
        queue = taut.getQueue();
        expect(queue.length).to.equal(2);
        taut.removeJob('1', null);
        queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        taut.removeJob('1', pr.number);
        taut.stopQueue(queueObj);
        done();
    });
});

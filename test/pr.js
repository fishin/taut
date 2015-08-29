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

    it('startPR from queue', function (done) {

        var taut = new Taut(internals.defaults);
        var queueObj = taut.startQueue();
        var jobId = '1';
        var pr = '1';
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

    it('addPR existing pr 1', function (done) {

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
        taut.settings.startJob('1', '1', function () {

            taut.addJob('1', '1');
            queue = taut.getQueue();
            expect(queue.length).to.equal(1);
            var intervalObj = setInterval(function () {

                if (queue.length === 1) {
                    clearInterval(intervalObj);
                    taut.removeJob('1', '1');
                    taut.stopQueue(queueObj);
                    done();
                }
            }, 1000);
        });
    });

    it('addPR 2 for existing job', function (done) {

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
        taut.settings.startJob('1', '1', function () {

            taut.addJob('1', '2');
            queue = taut.getQueue();
            expect(queue.length).to.equal(1);
            var intervalObj = setInterval(function () {

                if (queue.length === 1) {
                    clearInterval(intervalObj);
                    taut.removeJob('1', '2');
                    taut.stopQueue(queueObj);
                    done();
                }
            }, 1000);
        });
    });

    it('addPR for full reel', function (done) {

        var taut = new Taut(internals.defaults);
        taut.settings.size = 2;
        taut.settings.getActivePullRequests = function () {

            return {
                '1': {
                    prs: {
                        '1': {},
                        '2': {}
                    }
                }
            };
        };
        var queueObj = taut.startQueue();
        var queue = taut.getQueue();
        taut.settings.startJob('1', '1', function () {

            taut.addJob('1', '3');
            queue = taut.getQueue();
            expect(queue.length).to.equal(1);
            var intervalObj2 = setInterval(function () {

                if (queue.length === 1) {
                    clearInterval(intervalObj2);
                    taut.removeJob('1', '2');
                    taut.stopQueue(queueObj);
                    done();
                }
            }, 1000);
        });
    });
});

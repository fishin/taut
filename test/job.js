var Code = require('code');
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



describe('job', function () {

    it('startQueue and stopQueue', function (done) {

        var taut = new Taut(internals.defaults);
        var queueObj = taut.startQueue();
        setTimeout(function () {

            taut.stopQueue(queueObj);
            done();
        }, 1000);
    });

    it('getQueue', function (done) {

        var taut = new Taut(internals.defaults);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(0);
        done();
    });

    it('addJob 1', function (done) {

        var taut = new Taut(internals.defaults);
        var jobId = '1';
        taut.addJob(jobId, null);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        done();
    });

    it('addJob 1 with running active job', function (done) {

        var taut = new Taut(internals.defaults);
        taut.settings.getActiveJobs = function () {

            //console.log('getting active jobs 1');
            return {
                '1': {}
            };
        };
        var jobId = '1';
        taut.addJob(jobId, null);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        done();
    });

    it('addJob 2', function (done) {

        var taut = new Taut(internals.defaults);
        var jobId = '2';
        taut.addJob(jobId, null);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(2);
        done();
    });

    it('removeJob 2', function (done) {

        var taut = new Taut(internals.defaults);
        var jobId = '2';
        taut.removeJob(jobId, null);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        done();
    });

    it('removeJob 1', function (done) {

        var taut = new Taut(internals.defaults);
        var jobId = '1';
        taut.removeJob(jobId, null);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(0);
        done();
    });

    it('startJob from queue', function (done) {

        var taut = new Taut(internals.defaults);
        var queueObj = taut.startQueue();
        var jobId = '1';
        taut.addJob(jobId, null);
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

    it('addJob for startJob', function (done) {

        var taut = new Taut(internals.defaults);
        taut.settings.size = 2;
        taut.settings.getActiveJobs = function () {

            //console.log('getting active jobs 2');
            return {
                '2': {}
            };
        };
        var queueObj = taut.startQueue();
        var jobId = '2';
        taut.addJob(jobId, null);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        var intervalObj2 = setInterval(function () {

            queue = taut.getQueue();
            if (queue.length === 1) {
                clearInterval(intervalObj2);
                taut.removeJob(jobId, null);
                taut.stopQueue(queueObj);
                done();
            }
        }, 1000);
    });

    it('addJob for full reel', function (done) {

        var taut = new Taut(internals.defaults);
        taut.settings.getActiveJobs = function () {

            //console.log('getting active jobs 3');
            return {
                '1': {}
            };
        };
        var queueObj = taut.startQueue();
        var queue = taut.getQueue();
        taut.settings.startJob('2', null, function () {

            taut.addJob('1', null);
            queue = taut.getQueue();
            expect(queue.length).to.equal(1);
            var intervalObj3 = setInterval(function () {

                if (queue.length === 1) {
                    clearInterval(intervalObj3);
                    taut.removeJob('1', null);
                    taut.stopQueue(queueObj);
                    done();
                }
            }, 1000);
        });
    });
});

var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var Taut = require('../lib/index');

describe('queue', function () {

    it('startQueue and stopQueue', function (done) {

        var taut = new Taut({});
        var queueObj = taut.startQueue();
        setTimeout(function () {

            taut.stopQueue(queueObj);
            done();
        }, 1000);
    });

    it('getQueue', function (done) {

        var taut = new Taut({});
        var queue = taut.getQueue();
        expect(queue.length).to.equal(0);
        done();
    });

    it('addJob 1', function (done) {

        var taut = new Taut({});
        var jobId = '1';
        taut.addJob(jobId);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        done();
    });

    it('addJob 1 again', function (done) {

        var options = {
            getActiveJobs: function () {

                //console.log('getting active jobs 1');
                return {
                    '1': {}
                };
            }
        };
        var taut = new Taut(options);
        var jobId = '1';
        taut.addJob(jobId);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        done();
    });

    it('addJob 2', function (done) {

        var taut = new Taut({});
        var jobId = '2';
        taut.addJob(jobId);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(2);
        done();
    });

    it('removeJob 2', function (done) {

        var taut = new Taut({});
        var jobId = '2';
        taut.removeJob(jobId);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        done();
    });

    it('removeJob 1', function (done) {

        var taut = new Taut({});
        var jobId = '1';
        taut.removeJob(jobId);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(0);
        done();
    });

    it('startJob from queue', function (done) {

        var taut = new Taut({});
        var queueObj = taut.startQueue();
        var jobId = '1';
        taut.addJob(jobId);
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

        var options = {
            getActiveJobs: function () {

                //console.log('getting active jobs 2');
                return {
                    '2': {}
                };
            }
        };
        var taut = new Taut(options);
        var queueObj = taut.startQueue();
        var jobId = '2';
        taut.addJob(jobId);
        var queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        var intervalObj2 = setInterval(function () {

            queue = taut.getQueue();
            if (queue.length === 1) {
                clearInterval(intervalObj2);
                taut.removeJob('2');
                taut.stopQueue(queueObj);
                done();
            }
        }, 1000);
    });

    it('addJob for full reel', function (done) {

        var options = {
            getActiveJobs: function () {

                //console.log('getting active jobs 3');
                return {
                    '2': {},
                    '3': {}
                };
            }
        };
        var taut = new Taut(options);
        var queueObj = taut.startQueue();
        var queue = taut.getQueue();
        taut.settings.startJob('2');
        taut.addJob('1');
        queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        var intervalObj3 = setInterval(function () {

            if (queue.length === 1) {
                clearInterval(intervalObj3);
                taut.removeJob('1');
                taut.stopQueue(queueObj);
                done();
            }
        }, 1000);
    });
});

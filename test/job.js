'use strict';

const Code = require('code');
const Lab = require('lab');
const Taut = require('../lib/index');

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

const internals = {
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



describe('job', () => {

    it('startQueue and stopQueue', (done) => {

        const taut = new Taut(internals.defaults);
        const queueObj = taut.startQueue();
        setTimeout(() => {

            taut.stopQueue(queueObj);
            done();
        }, 1000);
    });

    it('getQueue', (done) => {

        const taut = new Taut(internals.defaults);
        const queue = taut.getQueue();
        expect(queue.length).to.equal(0);
        done();
    });

    it('addJob 1', (done) => {

        const taut = new Taut(internals.defaults);
        const jobId = '1';
        taut.addJob(jobId, null);
        const queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        done();
    });

    it('addJob 1 with running active job', (done) => {

        const taut = new Taut(internals.defaults);
        taut.settings.getActiveJobs = function () {

            //console.log('getting active jobs 1');
            return {
                '1': {}
            };
        };
        const jobId = '1';
        taut.addJob(jobId, null);
        const queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        done();
    });

    it('addJob 2', (done) => {

        const taut = new Taut(internals.defaults);
        const jobId = '2';
        taut.addJob(jobId, null);
        const queue = taut.getQueue();
        expect(queue.length).to.equal(2);
        done();
    });

    it('removeJob 2', (done) => {

        const taut = new Taut(internals.defaults);
        const jobId = '2';
        taut.removeJob(jobId, null);
        const queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        done();
    });

    it('clearQueue', (done) => {

        const taut = new Taut(internals.defaults);
        taut.clearQueue();
        const queue = taut.getQueue();
        expect(queue.length).to.equal(0);
        done();
    });

    it('startJob from queue', (done) => {

        const taut = new Taut(internals.defaults);
        const queueObj = taut.startQueue();
        const jobId = '1';
        taut.addJob(jobId, null);
        let queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        const intervalObj1 = setInterval(() => {

            queue = taut.getQueue();
            if (queue.length === 0) {
                clearInterval(intervalObj1);
                taut.stopQueue(queueObj);
                done();
            }
        }, 1000);
    });

    it('addJob for startJob', (done) => {

        const taut = new Taut(internals.defaults);
        taut.settings.size = 2;
        taut.settings.getActiveJobs = function () {

            //console.log('getting active jobs 2');
            return {
                '2': {}
            };
        };
        const queueObj = taut.startQueue();
        const jobId = '2';
        taut.addJob(jobId, null);
        let queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        const intervalObj2 = setInterval(() => {

            queue = taut.getQueue();
            if (queue.length === 1) {
                clearInterval(intervalObj2);
                taut.removeJob(jobId, null);
                taut.stopQueue(queueObj);
                done();
            }
        }, 1000);
    });

    it('addJob for full reel', (done) => {

        const taut = new Taut(internals.defaults);
        taut.settings.getActiveJobs = function () {

            //console.log('getting active jobs 3');
            return {
                '1': {}
            };
        };
        const queueObj = taut.startQueue();
        let queue = taut.getQueue();
        taut.settings.startJob('2', null, () => {

            taut.addJob('1', null);
            queue = taut.getQueue();
            expect(queue.length).to.equal(1);
            const intervalObj3 = setInterval(() => {

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

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

describe('pr', () => {

    it('startPR 1:1 from queue', (done) => {

        const taut = new Taut(internals.defaults);
        const queueObj = taut.startQueue();
        const jobId = '1';
        const pr = {
            number: 1
        };
        taut.addJob(jobId, pr);
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

    it('startPR 1:1 with running pr 1:1', (done) => {

        const taut = new Taut(internals.defaults);
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
        const queueObj = taut.startQueue();
        let queue = taut.getQueue();
        const pr = {
            number: 1
        };
        taut.settings.startJob('1', pr, () => {

            taut.addJob('1', pr);
            queue = taut.getQueue();
            expect(queue.length).to.equal(1);
            const intervalObj = setInterval(() => {

                if (queue.length === 1) {
                    clearInterval(intervalObj);
                    taut.removeJob('1', 1);
                    taut.stopQueue(queueObj);
                    done();
                }
            }, 1000);
        });
    });

    it('startPR 1:2 with running pr 1:1 and pr 1:1 at top', (done) => {

        const taut = new Taut(internals.defaults);
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
        const queueObj = taut.startQueue();
        const pr = {
            number: 1
        };
        taut.settings.startJob('1', pr, () => {

            taut.addJob('1', pr);
            let queue = taut.getQueue();
            expect(queue.length).to.equal(1);
            taut.addJob('1', { number: 2 });
            queue = taut.getQueue();
            expect(queue.length).to.equal(2);
            const intervalObj = setInterval(() => {

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

    it('addPR 1:1 with existing 1:1 queue', (done) => {

        const taut = new Taut(internals.defaults);
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
        const queueObj = taut.startQueue();
        let queue = taut.getQueue();
        const pr = {
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

    it('addPR 1:2 with running 1:1', (done) => {

        const taut = new Taut(internals.defaults);
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
        const queueObj = taut.startQueue();
        const pr = {
            number: 2
        };
        taut.addJob('1', pr);
        const queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        taut.removeJob('1', pr.number);
        taut.stopQueue(queueObj);
        done();
    });

    it('addJob 1:null with running pr 1:1', (done) => {

        const taut = new Taut(internals.defaults);
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
        const queueObj = taut.startQueue();
        const pr = {
            number: 1
        };
        taut.addJob('1', pr);
        let queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        taut.addJob('1', null);
        queue = taut.getQueue();
        expect(queue.length).to.equal(2);
        taut.removeJob('1', pr.number);
        taut.removeJob('1', null);
        taut.stopQueue(queueObj);
        done();
    });

    it('addJob 1:1 with running pr 1:null', (done) => {

        const taut = new Taut(internals.defaults);
        taut.settings.size = 2;
        taut.settings.getActiveJobs = function () {

            return {
                '1': {}
            };
        };
        const queueObj = taut.startQueue();
        const pr = {
            number: 1
        };
        taut.addJob('1', null);
        let queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        taut.addJob('1', pr);
        queue = taut.getQueue();
        expect(queue.length).to.equal(2);
        taut.removeJob('1', null);
        taut.removeJob('1', pr.number);
        taut.stopQueue(queueObj);
        done();
    });

    it('removeJob 1:1 with running pr 1:null', (done) => {

        const taut = new Taut(internals.defaults);
        taut.settings.size = 2;
        const queueObj = taut.startQueue();
        const pr = {
            number: 1
        };
        taut.addJob('1', null);
        let queue = taut.getQueue();
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

    it('removeJob 1:null with running pr 1:1', (done) => {

        const taut = new Taut(internals.defaults);
        taut.settings.size = 2;
        const queueObj = taut.startQueue();
        const pr = {
            number: 1
        };
        taut.addJob('1', pr);
        let queue = taut.getQueue();
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

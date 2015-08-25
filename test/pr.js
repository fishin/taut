var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var Taut = require('../lib/index');

describe('pr', function () {

    it('startPR from queue', function (done) {

        var taut = new Taut({});
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

    it('addPR for full reel', function (done) {

        var options = {
            getActivePRs: function () {

                //console.log('getting active jobs 3');
                return {
                    '1': {
                        prs: {
                            '1': {},
                            '2': {}
                        }
                    }
                };
            }
        };
        var taut = new Taut(options);
        var queueObj = taut.startQueue();
        var queue = taut.getQueue();
        //taut.settings.startJob('1', null);
        taut.addJob('1', '3');
        queue = taut.getQueue();
        expect(queue.length).to.equal(1);
        var intervalObj3 = setInterval(function () {

            if (queue.length === 1) {
                clearInterval(intervalObj3);
                taut.removeJob('1', '3');
                taut.stopQueue(queueObj);
                done();
            }
        }, 1000);
    });
});

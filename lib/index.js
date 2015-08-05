var Hoek = require('hoek');

var internals = {
    queue: [],
    size: 1,
    startJob: function (jobId) {

        //console.log('starting job: ' + jobId);
        return;
    },
    getActiveJobs: function () {

        //console.log('getting active jobs 0');
        return {};
    },
    getJob: function (jobId) {

        //console.log('getting job: ' + jobId);
        return {
            id: '1',
            name: 'job'
        };
    }
};

module.exports = internals.Queue = function (options) {

    var settings = Hoek.applyToDefaults(internals, options);
    this.settings = settings;
    internals.Queue.settings = settings;
    internals.Queue.removeJob = exports.removeJob;
    this.addJob = exports.addJob;
    this.removeJob = exports.removeJob;
    this.getQueue = exports.getQueue;
    this.startQueue = exports.startQueue;
    this.stopQueue = exports.stopQueue;
};

exports.addJob = function (jobId) {

    // make sure jobId doesnt already exist
    for (var i = 0; i < internals.queue.length; i++) {
        if (internals.queue[i].jobId === jobId) {
            console.log(jobId + ' already in queue');
            return null;
        }
    }
    var queueTime = new Date().getTime();
    var queue = {
        jobId: jobId,
        queueTime: queueTime
    };
    internals.queue.push(queue);
    return null;
};

exports.removeJob = function (jobId) {

    for (var i = 0; i < internals.queue.length; i++) {
        if (internals.queue[i].jobId === jobId) {
            internals.queue.splice(i, 1);
        }
    }
    return null;
};

exports.getQueue = function () {

    var queue = [];
    for (var i = 0; i < internals.queue.length; i++) {
        var now = new Date().getTime();
        var jobId = internals.queue[i].jobId;
        var queueTime = internals.queue[i].queueTime;
        var shortId = jobId.split('-')[0];
        var elapsedTime = now - queueTime;
        var job = internals.Queue.settings.getJob(jobId);
        var jobConfig = {
            jobId: jobId,
            name: job.name,
            queueTime: queueTime,
            shortId: shortId,
            elapsedTime: elapsedTime
        };
        queue.push(jobConfig);
    }
    return queue;
};

exports.startQueue = function () {

    var queueObj = setInterval(function () {

        //console.log('checking queue');
        if (internals.queue.length > 0) {
            //console.log('checking activeRuns');
            var activeJobs = internals.Queue.settings.getActiveJobs();
            //console.log(activeJobs);
            // find size of associated reel
            var size = internals.Queue.settings.size;
            var jobId = internals.queue[0].jobId;
            //console.log('max reel size: ' + size);
            //console.log('activeJobs: ' + Object.keys(activeJobs).length);
            //console.log('jobId: ' + jobId);
            //console.log('activeJobs: ' + JSON.stringify(activeJobs));
            if (!activeJobs[jobId]) {
                if (Object.keys(activeJobs).length < size) {
                    internals.Queue.settings.startJob(jobId);
                    internals.Queue.removeJob(jobId);
                }
                //else {
                //    console.log('all full');
                //}
            }
            //else {
            //    console.log('active jobId');
            //}
        }
    }, 1000);
    return queueObj;
};

exports.stopQueue = function (queueObj) {

    clearInterval(queueObj);
    return;
};

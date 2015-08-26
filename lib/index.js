var Hoek = require('hoek');

var internals = {
    queue: [],
    size: 1,
    startJob: function (jobId, pr) {

        //console.log('starting job: ' + jobId + ' with pr: ' + pr);
        return;
    },
    getActiveJobs: function () {

        //console.log('getting active jobs 0');
        return {};
    },
    getActivePRs: function () {

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

exports.addJob = function (jobId, pr) {

    // make sure jobId doesnt already exist
    for (var i = 0; i < internals.queue.length; i++) {
        if (internals.queue[i].jobId === jobId && internals.queue[i].pr === pr) {
            console.log(jobId + ':' + pr + ' already in queue');
            return null;
        }
    }
    var queueTime = new Date().getTime();
    var queue = {
        jobId: jobId,
        pr: pr,
        queueTime: queueTime
    };
    internals.queue.push(queue);
    return null;
};

exports.removeJob = function (jobId, pr) {

    for (var i = 0; i < internals.queue.length; i++) {
        if (internals.queue[i].jobId === jobId && internals.queue[i].pr === pr) {
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
        var pr = internals.queue[i].pr;
        var queueTime = internals.queue[i].queueTime;
        var shortId = jobId.split('-')[0];
        var elapsedTime = now - queueTime;
        var job = internals.Queue.settings.getJob(jobId, pr);
        var jobConfig = {
            jobId: jobId,
            name: job.name,
            pr: pr,
            queueTime: queueTime,
            shortId: shortId,
            elapsedTime: elapsedTime
        };
        queue.push(jobConfig);
    }
    return queue;
};

internals.getActiveTotal = function (activeJobs, activePRs) {

    var totalActive = Object.keys(activeJobs).length;
    for (var jobKey in activePRs) {
        for (var prKey in activePRs[jobKey].prs) {
            totalActive++;
        }
    }
    return totalActive;
};


exports.startQueue = function () {

    var queueObj = setInterval(function () {

        //console.log('checking queue');
        if (internals.queue.length > 0) {
            //console.log('checking activeRuns');
            // find size of associated reel
            var activeJobs = internals.Queue.settings.getActiveJobs();
            var activePRs = internals.Queue.settings.getActivePRs();
            var size = internals.Queue.settings.size;
            var jobId = internals.queue[0].jobId;
            var pr = internals.queue[0].pr;
            //console.log('max reel size: ' + size);
            //console.log('activeJobs: ' + Object.keys(activeJobs).length);
            //console.log('jobId: ' + jobId);
            //console.log('activeJobs: ' + JSON.stringify(activeJobs));
            var totalActive = internals.getActiveTotal(activeJobs, activePRs);
            //console.log('totalActive: ' + totalActive);
            if (!activeJobs[jobId] && pr === null) {
                if (totalActive < size) {
                    internals.Queue.settings.startJob(jobId, pr);
                    internals.Queue.removeJob(jobId, pr);
                }
                //else {
                //    console.log('all full');
                //}
            }
            if (pr !== null) {
                if (!activePRs[jobId] || !activePRs[jobId].prs[pr]) {
                    if (totalActive < size) {
                        internals.Queue.settings.startJob(jobId, pr);
                        internals.Queue.removeJob(jobId, pr);
                    }
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

var Hoek = require('hoek');

var internals = {
    queue: [],
    size: 1
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

    // make sure jobId:pr doesnt already exist
    //console.log('adding job: ' + jobId + ' pr: ' + JSON.stringify(pr));
    for (var i = 0; i < internals.queue.length; i++) {
        // check job
        if (internals.queue[i].jobId === jobId && internals.queue[i].pr === null) {
            console.log(jobId + ':' + pr + ' already in queue');
            return null;
        } else if (internals.queue[i].jobId === jobId && internals.queue[i].pr.number === pr.number) {
            console.log(jobId + ':' + pr.number + ' already in queue');
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

    //console.log('removing job: ' + jobId + ' pr: ' + pr);
    for (var i = 0; i < internals.queue.length; i++) {
        if (internals.queue[i].jobId === jobId && internals.queue[i].pr === null) {
            // remove job
            internals.queue.splice(i, 1);
        } else {
            // remove pr
            if (internals.queue[i].jobId === jobId && internals.queue[i].pr.number === pr) {
                internals.queue.splice(i, 1);
            }
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

internals.getActiveTotal = function () {

    var activeJobs = internals.Queue.settings.getActiveJobs();
    var activePullRequests = internals.Queue.settings.getActivePullRequests();
    var totalActive = Object.keys(activeJobs).length;
    for (var jobKey in activePullRequests) {
        for (var prKey in activePullRequests[jobKey].prs) {
            totalActive++;
        }
    }
    var result = {
        total: totalActive,
        activeJobs: activeJobs,
        activePullRequests: activePullRequests
    };
    return result;
};

exports.startQueue = function () {

    var totalActive = {};
    var queueObj = setInterval(function () {

        //console.log('checking queue');
        if (internals.queue.length > 0) {
            //console.log('checking activeRuns');
            // find size of associated reel
            totalActive = internals.getActiveTotal();
            var size = internals.Queue.settings.size;
            var jobId = internals.queue[0].jobId;
            var pr = internals.queue[0].pr;
            //console.log('max reel size: ' + size);
            //console.log('activeJobs: ' + Object.keys(activeJobs).length);
            //console.log('jobId: ' + jobId + ' pr: ' + pr);
            //console.log('activeJobs: ' + JSON.stringify(total.activeJobs, null, 4));
            //console.log('totalActive: ' + totalActive.total);
            // start up regular jobs
            if (totalActive.total >= size) {
                //console.log('sorry all full!');
                return;
            }
            if (pr === null && !totalActive.activeJobs[jobId]) {
                internals.Queue.settings.startJob(jobId, pr, Hoek.ignore);
                internals.Queue.removeJob(jobId, null);
                return;
            } else if (pr !== null && !totalActive.activePullRequests[jobId]) {
                internals.Queue.settings.startJob(jobId, pr, Hoek.ignore);
                internals.Queue.removeJob(jobId, pr.number);
                return;
            } else if (pr !== null && !totalActive.activePullRequests[jobId].prs[pr]) {
                internals.Queue.settings.startJob(jobId, pr, Hoek.ignore);
                internals.Queue.removeJob(jobId, pr.number);
                return;
            }
//            else {
//                console.log('all full or already running');
//            }
        }
//        else {
//            console.log('nothing in queue');
//        }
    }, 1000);
    return queueObj;
};

exports.stopQueue = function (queueObj) {

    clearInterval(queueObj);
    return;
};

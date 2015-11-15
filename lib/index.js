'use strict';

const Hoek = require('hoek');

const internals = {
    queue: [],
    size: 1
};

module.exports = internals.Queue = function (options) {

    const settings = Hoek.applyToDefaults(internals, options);
    this.settings = settings;
    internals.Queue.settings = settings;
    internals.Queue.removeJob = exports.removeJob;
    this.addJob = exports.addJob;
    this.removeJob = exports.removeJob;
    this.clearQueue = exports.clearQueue;
    this.getQueue = exports.getQueue;
    this.startQueue = exports.startQueue;
    this.stopQueue = exports.stopQueue;
};

exports.addJob = function (jobId, pr) {

    // make sure jobId:pr doesnt already exist
    //console.log('adding job: ' + jobId + ' pr: ' + JSON.stringify(pr));
    for (let i = 0; i < internals.queue.length; ++i) {
        const item = internals.queue[i];
        // check job
        // compare job jobId:null to queue jobId:null
        if (item.jobId === jobId && item.pr === null && pr === null) {
            console.log(jobId + ':null already in queue');
            return null;
        }
        // check pr
        // compare job jobId:pr to queue jobId:pr
        if (item.jobId === jobId && item.pr !== null && pr !== null && item.pr.number === pr.number) {
            console.log(jobId + ':' + pr.number + ' already in queue');
            return null;
        }
        // jobId:pr jobId:null and jobId:null jobId:pr are remaining
    }
    const queueTime = new Date().getTime();
    const queue = {
        jobId: jobId,
        pr: pr,
        queueTime: queueTime
    };
    internals.queue.push(queue);
    return null;
};

exports.removeJob = function (jobId, pr) {

    //console.log('removing job: ' + jobId + ' pr: ' + pr);
    for (let i = 0; i < internals.queue.length; ++i) {
        const item = internals.queue[i];
        if (item.jobId === jobId && item.pr === null && pr === null) {
            // remove job
            internals.queue.splice(i, 1);
            return;
        }
        if (item.jobId === jobId && item.pr !== null && pr !== null && item.pr.number === pr) {
            // remove pr
            internals.queue.splice(i, 1);
            return;
        }
        // jobId:pr jobId:null and jobId:null jobId:pr are remaining
    }
    return;
};

exports.clearQueue = function () {

    internals.queue = [];
    return;
};

exports.getQueue = function () {

    const queue = [];
    for (let i = 0; i < internals.queue.length; ++i) {
        const now = new Date().getTime();
        const jobId = internals.queue[i].jobId;
        const pr = internals.queue[i].pr;
        const queueTime = internals.queue[i].queueTime;
        const shortId = jobId.split('-')[0];
        const elapsedTime = now - queueTime;
        const job = internals.Queue.settings.getJob(jobId, pr);
        const jobConfig = {
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

    const activeJobs = internals.Queue.settings.getActiveJobs();
    const activePullRequests = internals.Queue.settings.getActivePullRequests();
    let totalActive = Object.keys(activeJobs).length;
    for (const jobKey in activePullRequests) {
        totalActive = totalActive + activePullRequests[jobKey].prs.length;
    }
    const result = {
        total: totalActive,
        activeJobs: activeJobs,
        activePullRequests: activePullRequests
    };
    return result;
};

exports.startQueue = function () {

    let totalActive = {};
    const queueObj = setInterval(() => {

        //console.log('checking queue');
        if (internals.queue.length > 0) {
            //console.log('checking activeRuns');
            // find size of associated reel
            totalActive = internals.getActiveTotal();
            const size = internals.Queue.settings.size;
            if (totalActive.total >= size) {
                //console.log('sorry all full!');
                return;
            }
            // default to the first item
            let jobId = internals.queue[0].jobId;
            let pr = internals.queue[0].pr;
            for (let i = 0; i < internals.queue.length; ++i) {
                const item = internals.queue[i];
                // if its a job see if its running already
                if (item.pr === null && !totalActive.activeJobs[item.jobId]) {
                    jobId = item.jobId;
                    pr = null;
                    break;
                }
                // see if theres any pull requests with that jobId
                if (item.pr !== null && !totalActive.activePullRequests[item.jobId]) {
                    jobId = item.jobId;
                    pr = item.pr;
                    break;
                }
                // last check to see if there is that specific pr with that jobId
                if (item.pr !== null && totalActive.activePullRequests[item.jobId].prs[item.pr.number]) {
                    jobId = item.jobId;
                    pr = item.pr;
                    break;
                }
            }
            //console.log('max reel size: ' + size);
            //console.log('activeJobs: ' + Object.keys(activeJobs).length);
            //console.log('jobId: ' + jobId + ' pr: ' + JSON.stringify(pr));
            //console.log('activeJobs: ' + JSON.stringify(total.activeJobs, null, 4));
            //console.log('totalActive: ' + totalActive.total);
            // start up regular jobs
            if (pr === null && !totalActive.activeJobs[jobId]) {
                internals.Queue.settings.startJob(jobId, pr, Hoek.ignore);
                internals.Queue.removeJob(jobId, null);
                return;
            }
            else if (pr !== null && !totalActive.activePullRequests[jobId]) {
                internals.Queue.settings.startJob(jobId, pr, Hoek.ignore);
                internals.Queue.removeJob(jobId, pr.number);
                return;
            }
            else if (pr !== null && !totalActive.activePullRequests[jobId].prs[pr]) {
                internals.Queue.settings.startJob(jobId, pr, Hoek.ignore);
                internals.Queue.removeJob(jobId, pr.number);
                return;
            }
//            else {
//                console.log('already running');
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

MediaPlayer.rules.PlaybackTimeRule = function () {
    "use strict";

    var seekTarget = {},
        scheduleController = {},

        onPlaybackSeeking = function(e) {
            var streamId = e.sender.getStreamId(),
                time = e.data.seekTime;
            seekTarget[streamId] = seekTarget[streamId] || {};
            seekTarget[streamId].audio = time;
            seekTarget[streamId].video = time;
        };

    return {
        adapter: undefined,
        sourceBufferExt: undefined,



        setup: function() {
            this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING] = onPlaybackSeeking;
        },

        setScheduleController: function(scheduleControllerValue) {
            var streamId = scheduleControllerValue.streamProcessor.getStreamInfo().id;
            scheduleController[streamId] = scheduleController[streamId] || {};
            scheduleController[streamId][scheduleControllerValue.streamProcessor.getType()] = scheduleControllerValue;
        },

        execute: function(context, callback) {

//This Check Point Comes for starting of Every Segment Request. Thus Rule is Here..
//console.log("Check Point 1.5");

            var mediaType = context.getMediaInfo().type,
                streamId = context.getStreamInfo().id,
                sc = scheduleController[streamId][mediaType],
                // EPSILON is used to avoid javascript floating point issue, e.g. if request.startTime = 19.2,
                // request.duration = 3.83, than request.startTime + request.startTime = 19.2 + 1.92 = 21.119999999999997
                EPSILON = 0.1,
                streamProcessor = scheduleController[streamId][mediaType].streamProcessor,
                track = streamProcessor.getCurrentTrack(),
                st = seekTarget[streamId] ? seekTarget[streamId][mediaType] : null,
                hasSeekTarget = (st !== undefined) && (st !== null),
                p = hasSeekTarget ? MediaPlayer.rules.SwitchRequest.prototype.STRONG  : MediaPlayer.rules.SwitchRequest.prototype.DEFAULT,
                rejected = sc.getFragmentModel().getRejectedRequests().shift(),
                keepIdx = !!rejected && !hasSeekTarget,
                currentTime = this.adapter.getIndexHandlerTime(streamProcessor),
                playbackTime = streamProcessor.playbackController.getTime(),
                rejectedEnd = rejected ? rejected.startTime + rejected.duration : null,
                useRejected = !hasSeekTarget && rejected && ((rejectedEnd > playbackTime) && (rejected.startTime <= currentTime) || isNaN(currentTime)),
                range,
                time,
                request;

            time = hasSeekTarget ? st : ((useRejected ? (rejected.startTime) : currentTime));

/*Hema - Based of the time We can also Decide the Next segment to be fetched. If it is "Nan" then all the segments are downladed*/
//console.log("Check Point 1.6 - Time: "+time);


	/*If all the segments are downloaded the Time returns "NaN" The the Following If is called and returned*/
            if (isNaN(time)) {
                callback(new MediaPlayer.rules.SwitchRequest(null, p));
                return;
            }


            if (seekTarget[streamId]) {
                seekTarget[streamId][mediaType] = null;
            }

		/*The "getBufferRange" Function is in "SourceBufferExtensions.js".  Mostly The range value is NULL*/
            range = this.sourceBufferExt.getBufferRange(streamProcessor.bufferController.getBuffer(), time);
	    if (range !== null) {
                time = range.end;
            }


            request = this.adapter.getFragmentRequestForTime(streamProcessor, track, time, {keepIdx: keepIdx});

            if (useRejected && request && request.index !== rejected.index) {
                request = this.adapter.getFragmentRequestForTime(streamProcessor, track, rejected.startTime + (rejected.duration / 2) + EPSILON, {keepIdx: keepIdx});
            }


            while (request && streamProcessor.fragmentController.isFragmentLoadedOrPending(sc, request)) {
                if (request.action === "complete") {
                    request = null;
                    this.adapter.setIndexHandlerTime(streamProcessor, NaN);
                    break;
                }

                request = this.adapter.getNextFragmentRequest(streamProcessor, track);

            }

            if (request && !useRejected) {
                this.adapter.setIndexHandlerTime(streamProcessor, request.startTime + request.duration);
            }




            callback(new MediaPlayer.rules.SwitchRequest(request, p));
        },

        reset: function() {
            seekTarget = {};
            scheduleController = {};
        }
    };
};

MediaPlayer.rules.PlaybackTimeRule.prototype = {
    constructor: MediaPlayer.rules.PlaybackTimeRule
};

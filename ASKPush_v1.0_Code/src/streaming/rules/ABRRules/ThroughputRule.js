/*
 * The copyright in this software is being made available under the BSD License, included below. This software may be subject to other third party and contributor rights, including patent rights, and no such rights are granted under this license.
 * 
 * Copyright (c) 2014, Akamai Technologies
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Digital Primates nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
MediaPlayer.rules.ThroughputRule = function () {
    "use strict";


    var throughputArray = [],
        AVERAGE_THROUGHPUT_SAMPLE_AMOUNT_LIVE = 2,
        AVERAGE_THROUGHPUT_SAMPLE_AMOUNT_VOD = 3,
        //THROUGHTPUT_RATIO_SAFETY_FACTOR = 1.2,
	typ,
        storeLastRequestThroughputByType = function (type, lastRequestThroughput) {typ=type;
            throughputArray[type] = throughputArray[type] || [];
            if (lastRequestThroughput !== Infinity &&
                lastRequestThroughput !== throughputArray[type][throughputArray[type].length-1]) {
                throughputArray[type].push(lastRequestThroughput);
            }
        },

        getAverageThroughput = function (type,  isDynamic) {
            var averageThroughput = 0,
                sampleAmount = isDynamic ? AVERAGE_THROUGHPUT_SAMPLE_AMOUNT_LIVE: AVERAGE_THROUGHPUT_SAMPLE_AMOUNT_VOD,
                arr = throughputArray[type],
                len = arr.length;

            sampleAmount = len < sampleAmount ? len : sampleAmount;

            if (len > 0) {
                var startValue = len - sampleAmount,
                    totalSampledValue = 0;

                for (var i = startValue; i < len; i++) {
                    totalSampledValue += arr[i];
                }
                averageThroughput = totalSampledValue / sampleAmount;
            }

            if (arr.length > sampleAmount) {
                arr.shift();
            }
		
            return averageThroughput;
        };


    return {
        debug: undefined,
        metricsExt: undefined,
        metricsModel: undefined,
        manifestExt:undefined,
        manifestModel:undefined,

        execute: function (context, callback) {
            var self = this,
                mediaInfo = context.getMediaInfo(),
                mediaType = mediaInfo.type,
                manifest = this.manifestModel.getValue(),
                metrics = self.metricsModel.getReadOnlyMetricsFor(mediaType),
                isDynamic= context.getStreamProcessor().isDynamic(),
                lastRequest = self.metricsExt.getCurrentHttpRequest(metrics),
                downloadTime,
                averageThroughput,
                lastRequestThroughput,
                bufferStateVO = (metrics.BufferState.length > 0) ? metrics.BufferState[metrics.BufferState.length - 1] : null,
                bufferLevelVO = (metrics.BufferLevel.length > 0) ? metrics.BufferLevel[metrics.BufferLevel.length - 1] : null,
                switchRequest =  new MediaPlayer.rules.SwitchRequest(MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE, MediaPlayer.rules.SwitchRequest.prototype.WEAK);

            if (!metrics || lastRequest === null || lastRequest.type !== MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE ||
                bufferStateVO === null || bufferLevelVO === null) {
                callback(new MediaPlayer.rules.SwitchRequest());
                return;
            }

            downloadTime = (lastRequest.tfinish.getTime() - lastRequest.tresponse.getTime()) / 1000;
            lastRequestThroughput = Math.round((lastRequest.trace[lastRequest.trace.length - 1].b * 8 ) / downloadTime);

            storeLastRequestThroughputByType(mediaType, lastRequestThroughput);
            averageThroughput = Math.round(getAverageThroughput(mediaType, isDynamic));

            var adaptation = this.manifestExt.getAdaptationForType(manifest, 0, mediaType);
            var max = mediaInfo.trackCount - 1;

            if (bufferStateVO.state === MediaPlayer.dependencies.BufferController.BUFFER_LOADED &&
                (bufferLevelVO.level >= (MediaPlayer.dependencies.BufferController.LOW_BUFFER_THRESHOLD*2) || isDynamic) )
            {
                
	
	//osmf algo start
   if(typ == "audio")
	{
		//console.log(aaR.length+'audiolength');
		if(aaR.length==1)
		{
			var ap = MediaPlayer.rules.SwitchRequest.prototype.DEFAULT;
                        switchRequest = new MediaPlayer.rules.SwitchRequest(0, ap);
		}
//audio algo begin
	else
	{
	var atheta1=v;//currently 2s of playback time segments are used
	var at_last = (lastRequest.tfinish.getTime() - lastRequest.trequest.getTime()) / 1000;
	var al_nxt =acur;
	var amini=0,amaxi=aaR.length-1;
	var ar_download = atheta1/at_last;//console.log(ar_download);
	document.getElementById("ath").innerHTML=ar_download;
	//console.log("r: "+ar_download);
	var acurBandwidth = this.manifestExt.getRepresentationFor(acur, adaptation).bandwidth;
	//document.getElementById("ath").innerHTML=acurBandwidth;
	var acur_1=acur-1;
	if(acur_1<0)
		acur_1=acur;
	var acur_m1Bandwidth = this.manifestExt.getRepresentationFor(acur_1, adaptation).bandwidth;
	//var cur_p1Bandwidth = this.manifestExt.getRepresentationFor(l_nxt+1, adaptation).bandwidth;
	//console.log("t_last_frag: "+ t_last_frag);
	if (ar_download < 1)
	{
		if (acur > 0)
		{
			
			if (ar_download < (acur_m1Bandwidth/acurBandwidth)) 
				al_nxt = 0;
			else
				al_nxt =acur-1;
			if(al_nxt<0)
				al_nxt=0;
			
		}
	}
	else
	{
		//console.log('else increasing audio');
		if ( acur < aaR.length-1)
		{
			if (ar_download >= acur_m1Bandwidth/acurBandwidth)
			{		
				while(1)
				{
					al_nxt=al_nxt+1;
					if(al_nxt>aaR.length-1)
						al_nxt=aaR.length-1;
					if(al_nxt<=(aaR.length-1))
					{
						//console.log(al_nxt);
						var al_n=this.manifestExt.getRepresentationFor(al_nxt, adaptation).bandwidth;
					}
					//console.log(al_n);
					if((al_nxt>=aaR.length-1) || ((ar_download) < al_n ))
					break;
						
				}
					
			}
			
		}
	
	}

//audio algo end
		if(al_nxt!=acur){acur=al_nxt;		
		var ap = MediaPlayer.rules.SwitchRequest.prototype.DEFAULT;
                        switchRequest = new MediaPlayer.rules.SwitchRequest(al_nxt, ap);}
	}
	}
   else
	{
console.log("In Video Fetching part");
	var theta1=v;
	var t_last = (lastRequest.tfinish.getTime() - lastRequest.trequest.getTime()) / 1000;
	//console.log(t_last+"tlast");
	var l_nxt =cur;
	var mini=0,maxi=aR.length-1;
	var r_download = theta1/t_last;
	document.getElementById("th").innerHTML=r_download;
	//console.log("r: "+r_download);
	var curBandwidth = this.manifestExt.getRepresentationFor(cur, adaptation).bandwidth;
	//document.getElementById("th").innerHTML=curBandwidth;
	var cur_1=cur-1;
	if(cur_1<0)
		cur_1=cur;
	var cur_m1Bandwidth = this.manifestExt.getRepresentationFor(cur_1, adaptation).bandwidth;
	//var cur_p1Bandwidth = this.manifestExt.getRepresentationFor(l_nxt+1, adaptation).bandwidth;
	//console.log("t_last_frag: "+ t_last_frag);
	if (r_download < 1)
	{//console.log(r_download+'if decreasing video');
		if (cur > 0)
		{
			
			if (r_download < cur_m1Bandwidth/curBandwidth) 
				l_nxt = 0;
			else
				l_nxt =cur-1;
			if(l_nxt<0)
				l_nxt=0;
			
		}
	}
	else
	{
		//console.log(r_download+'else increasing video');
		//console.log(aR.length-1);
		if ( cur < aR.length-1)
		{
			if (r_download >= cur_m1Bandwidth/curBandwidth)
			{		
				while(1)
				{
					l_nxt=l_nxt+1;
					if(l_nxt>aR.length-1)
						l_nxt=aR.length-1;
					if(l_nxt<=(aR.length-1))
						var l_n=this.manifestExt.getRepresentationFor(l_nxt, adaptation).bandwidth;
					//console.log(l_n);
					if((l_nxt>=aR.length-1) || ((r_download) < l_n ))
					break;
						
				}
					
			}
			
		}
	
	}
	if(l_nxt!=cur){nbs++;document.getElementById("bs").innerHTML=nbs;cur=l_nxt;
	var p = /*(current < i) ? MediaPlayer.rules.SwitchRequest.prototype.STRONG :*/MediaPlayer.rules.SwitchRequest.prototype.STRONG;
                        switchRequest = new MediaPlayer.rules.SwitchRequest(l_nxt, p);}
	//osmf end
	}
            }

            if (switchRequest.value !== MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE) {
                self.debug.log("ThroughputRule requesting switch to index: ", switchRequest.value, "type: ",mediaType, " Priority: ",
                    switchRequest.priority === MediaPlayer.rules.SwitchRequest.prototype.DEFAULT ? "Default" :
                        switchRequest.priority === MediaPlayer.rules.SwitchRequest.prototype.STRONG ? "Strong" : "Weak", "Average throughput", Math.round(averageThroughput/1024), "kbps");
            }

            callback(switchRequest);
        },

        reset: function() {
            throughputArray = [];
        }
    };
};

MediaPlayer.rules.ThroughputRule.prototype = {
    constructor: MediaPlayer.rules.ThroughputRule
};

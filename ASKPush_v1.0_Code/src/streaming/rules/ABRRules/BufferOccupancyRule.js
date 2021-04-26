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
MediaPlayer.rules.BufferOccupancyRule = function () {
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
        metricsModel: undefined,
        manifestModel:undefined,
	metricsExt: undefined,

        execute: function (context, callback) {
            var self = this,
                mediaInfo = context.getMediaInfo(),
                mediaType = mediaInfo.type,
                manifest = this.manifestModel.getValue(),			// Newly Added
                metrics = this.metricsModel.getReadOnlyMetricsFor(mediaType),
                isDynamic= context.getStreamProcessor().isDynamic(),		// Newly Added
		lastRequest = self.metricsExt.getCurrentHttpRequest(metrics),
                downloadTime,
                averageThroughput,
                lastRequestThroughput,
                bufferStateVO = (metrics.BufferState.length > 0) ? metrics.BufferState[metrics.BufferState.length - 1] : null,
                bufferLevelVO = (metrics.BufferLevel.length > 0) ? metrics.BufferLevel[metrics.BufferLevel.length - 1] : null,
		/*Above Added for Throughput estimation */
                lastBufferLevelVO = (metrics.BufferLevel.length > 0) ? metrics.BufferLevel[metrics.BufferLevel.length - 1] : null,
                lastBufferStateVO = (metrics.BufferState.length > 0) ? metrics.BufferState[metrics.BufferState.length - 1] : null,
                isBufferRich = false,
                maxIndex = mediaInfo.trackCount - 1,
                switchRequest = new MediaPlayer.rules.SwitchRequest(MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE, MediaPlayer.rules.SwitchRequest.prototype.WEAK);



		/* Handeling the Exceptational cases carefully, for throughput estimation. *
          	if (!metrics || lastRequest === null || lastRequest.type !== MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE ||
                	bufferStateVO === null || bufferLevelVO === null) {
                	callback(new MediaPlayer.rules.SwitchRequest());
	                return;
        	}
		*/

		/*Storing the Stating time of the video*/
		if(starttime_flag == 0)
		{
			start_time = new Date().getTime();
			console_Print_Time = start_time + 47990099;
			starttime_flag = 1;
		}


		
		/* Calculating the averageThroughput to be used in SARA Algo*/
		averageThroughput = 0;
		lastRequestThroughput = 0;
		buffer_Current = parseFloat(document.getElementById("bl").innerHTML);	/*Updating the current buffer value*/

		/*Tracing the RED Log*/
		if(buffer_Current < 1)
		{
			var now_temp = new Date().getTime();
			RED_log.push([ now_temp, buffer_Current ]);
		}

		if(buffer_Current > 0)
		{
		downloadTime = (lastRequest.tfinish.getTime() - lastRequest.tresponse.getTime()) / 1000;
            	lastRequestThroughput = Math.round((lastRequest.trace[lastRequest.trace.length - 1].b) / downloadTime);
		
	        storeLastRequestThroughputByType(mediaType, lastRequestThroughput);
        	averageThroughput = Math.round(getAverageThroughput(mediaType, isDynamic));
		}

		/*
		console.log("----------*************----------");
		console.log("The averageThroughput: "+averageThroughput);
		console.log("The lastRequestThroughput: "+lastRequestThroughput);
		*/

		/*This section is commented as, not required*/
		/*
			    if (lastBufferLevelVO !== null && lastBufferStateVO !== null) {

				// This will happen when another rule tries to switch from top to any other.
				// If there is enough buffer why not try to stay at high level.
				if (lastBufferLevelVO.level > lastBufferStateVO.target) {
				    isBufferRich = (lastBufferLevelVO.level - lastBufferStateVO.target) > MediaPlayer.dependencies.BufferController.RICH_BUFFER_THRESHOLD;
				    if (isBufferRich && mediaInfo.trackCount > 1) {
				        switchRequest = new MediaPlayer.rules.SwitchRequest(maxIndex, MediaPlayer.rules.SwitchRequest.prototype.STRONG);
				    }
				}
			    }
		*/





/*SARA Algorithm Variavles and Code Starts Here..*/
/*H_n is Calculate Here for SARA...*/
current_Segment_Being_Downloaded = lastSegmentFetchedIndex + 1;		/*Updating the current_Segment_Being_Downloaded Variable*/
total_Number_of_Segments = (segmentSizes.length/vrep.length)-1;

//console.log("total_Number_of_Segments: "+total_Number_of_Segments);
/*updating the averageThroughput for every segment number. */
if(current_Segment_Being_Downloaded == segmentVsAvgThroughput.length)
{
	segmentVsAvgThroughput[segmentVsAvgThroughput.length] = lastRequestThroughput;	
}

var already_Rep_Updated = 0;
/*If the Rep for the segment is already decised in the last loop, just update the last value and call the same. */
if(current_Segment_Being_Downloaded < segmentVsQuality.length)
{
//console.log("Last time fetched Rep: "+ segmentVsQuality[current_Segment_Being_Downloaded]);
r_Current_No = segmentVsQuality[current_Segment_Being_Downloaded];
	switchRequest = new MediaPlayer.rules.SwitchRequest(r_Current_No, MediaPlayer.rules.SwitchRequest.prototype.STRONG);

already_Rep_Updated = 1;

}


/* Waiting for "delta" time before proceeding to download..*/
	buffer_Current = parseFloat(document.getElementById("bl").innerHTML);
	if(buffer_Current > b_B)		/*- Delayed Download -*/
	{	delta = buffer_Current - b_B;		}
	else
	{	delta = 0;	}

if(delta>0)
{
	buffer_Current = parseFloat(document.getElementById("bl").innerHTML);

	var now = new Date().getTime();
	var delta_Wait = delta * 1000;
	delta_Wait = delta_Wait + now;

	/*	
	console.log("buffer_Current is: "+buffer_Current);
	console.log("Now Time is: "+now);
	console.log("Inside Delta Wait: "+delta_Wait);
	*/

	while( now < delta_Wait )
	{
		buffer_Current = parseFloat(document.getElementById("bl").innerHTML);	/*Updating the current buffer value*/
		/*Tracing the RED Log*/
		if(buffer_Current < 1)
		{
			var now_temp = new Date().getTime();
			RED_log.push([ now_temp, buffer_Current ]);
		}
	
		now = new Date().getTime();
	}

}




/* This IF loop is to print Stats and avaid the H_n problem bu calling "return" call.  */
var Temp_time = new Date().getTime();

if((current_Segment_Being_Downloaded > total_Number_of_Segments) && (Temp_time > console_Print_Time))
{
	/* Printing the final OQoE statics..*/
	console.log("OQoE Statics are:");
	console.log("-----------------");

	console.log("Number of BSE : "+number_Of_BSE);
	console.log("Average Throughput: "+averageThroughput);
	
	var number_of_Rebuffers = 0;
	number_of_Rebuffers = parseFloat(document.getElementById("re").innerHTML);
	if(number_of_Rebuffers > 0)
	{	number_of_Rebuffers = number_of_Rebuffers - 1;
		console.log("Number of rebuffering Events : "+number_of_Rebuffers);
	}
	else
	{	console.log("Number of rebuffering Events : "+number_of_Rebuffers);	}

	console.log("Printing the RED Log");
	console.log("---------------------");
	for(var Key=0; Key < RED_log.length; Key++)		/*Where, "seg_Key" is the segment number. */
	{
		console.log(RED_log[Key][0]+"  "+RED_log[Key][1]);
	}
	console.log("---------------------");

	var startup_Delay = 0;
	startup_Delay = parseFloat(document.getElementById("sd").innerHTML);
	console.log("Startup Delay is: "+startup_Delay);

	var highest_Bitrate_Reached = 0;
	highest_Bitrate_Reached = parseFloat(document.getElementById("hvt").innerHTML);
	console.log("Time taken to reach Highest Bitrate : "+highest_Bitrate_Reached);

	/* Calculation of Average Bitrate Perceived by the Player */
	var total_Bitrate_Sum = 0;
	var avg_Bitrate = 0;
	

	for(var seg_Key=0; seg_Key <= total_Number_of_Segments; seg_Key++)		/*Where, "seg_Key" is the segment number. */
	{
		var rep_Key = segmentVsQuality[seg_Key];

		total_Bitrate_Sum = total_Bitrate_Sum + vrep[rep_Key];
	}

	avg_Bitrate = total_Bitrate_Sum / (total_Number_of_Segments+1);
	console.log("Average Bitrate Perceived: "+avg_Bitrate);

	/* Printing the segment wise bitrates perceived.*/
	console.log("The Segment ise Bitrates");
	console.log("-------------------------");
	for(var seg_Key=0; seg_Key <= total_Number_of_Segments; seg_Key++)		/*Where, "seg_Key" is the segment number. */
	{
		var rep_Key = segmentVsQuality[seg_Key];
		console.log(seg_Key+"  "+rep_Key+"   "+vrep[rep_Key]);
	}
}

if(current_Segment_Being_Downloaded > total_Number_of_Segments)
{
	return;
}

var Wi_Sum = 0;
var Wi_By_di_Sum = 0;

	for(var seg_Key=0; seg_Key<current_Segment_Being_Downloaded; seg_Key++)		/*Where, "seg_Key" is the segment number. */
	{
		var rep_Key = 0;
		rep_Key = segmentVsQuality[seg_Key];
		var row_Key = 0;
		row_Key = (rep_Key * total_Number_of_Segments) + rep_Key + seg_Key;	
	
		Wi_Sum = Wi_Sum + (segmentSizes[row_Key][2] * 1000);

		if(segmentVsAvgThroughput[seg_Key] > 0)
		{
			var temp = parseFloat((segmentSizes[row_Key][2] * 1000)/segmentVsAvgThroughput[seg_Key]);

			Wi_By_di_Sum = parseFloat(Wi_By_di_Sum + temp);
		}

//console.log("Hello..Check Value 3: "+Wi_By_di_Sum);


	}

//console.log("Check Value H_n: "+Wi_Sum);
//console.log("Check Value H_n: "+Wi_By_di_Sum);


	H_n = Wi_Sum/Wi_By_di_Sum;	/* Estimating the H_n Value..*/		


r_Max = mediaInfo.trackCount - 1;
buffer_Current = parseFloat(document.getElementById("bl").innerHTML);	/*Updating the current buffer value*/


if (current_Segment_Being_Downloaded <= total_Number_of_Segments)		/* Checking for Segment Number overflow Condition */
{
	var row_Temp = (r_Current_No * total_Number_of_Segments) + r_Current_No + current_Segment_Being_Downloaded;
	var W_curr_nplus1 = segmentSizes[row_Temp][2] * 1000;			/* Calculating the "W_curr_nplus1" value */
}
else
{
	var row_Temp = (r_Current_No * total_Number_of_Segments) + r_Current_No + total_Number_of_Segments;
	var W_curr_nplus1 = segmentSizes[row_Temp][2] * 1000;			/* Calculating the "W_curr_nplus1" value */
}


if(r_Current_No < r_Max)							/* Checking the rep overflow condition */
{
	if (current_Segment_Being_Downloaded <= total_Number_of_Segments)	/* Checking for Segment Number overflow Condition */
	{
		var row_Temp = ((r_Current_No+1) * total_Number_of_Segments) + (r_Current_No+1) + current_Segment_Being_Downloaded;
		var W_currplus1_nplus1 = segmentSizes[row_Temp][2] * 1000;	/* Calculating the "W_currplus1_nplus1" value */	
	}
	else
	{
		var row_Temp = ((r_Current_No+1) * total_Number_of_Segments) + (r_Current_No+1) + total_Number_of_Segments;
		var W_currplus1_nplus1 = segmentSizes[row_Temp][2] * 1000;	/* Calculating the "W_currplus1_nplus1" value */		
	}
}
else
{
	var W_currplus1_nplus1 = W_curr_nplus1;
}


/* Few Console Prints for Check 
console.log("Current Buffer Length: "+buffer_Current);
console.log("H_n Value: "+H_n);
console.log("last Segment Fetched Index: "+lastSegmentFetchedIndex);	//Segment number of most recent downloadfed segment
console.log(" I= "+I+", b_A= "+b_A+", b_B= "+b_B+", b_Max= "+b_Max);
console.log(" r_Current_No = "+r_Current_No);
*/

/*HEMA _ SARA Algorithm Code Here.*/
/**********************************/
if(buffer_Current <= I)		/*- Fast Start -*/
{
	r_Current_No = r_Min;
	delta = 0;
}
else 
{
	if( (W_curr_nplus1/H_n) > (buffer_Current - I) )
	{
		for(var i=r_Current_No; i>=0 ; i--)
		{
			if (current_Segment_Being_Downloaded <= total_Number_of_Segments)		/* Checking for Segment Number overflow Condition */
			{	row_Temp = (i * total_Number_of_Segments) + i + current_Segment_Being_Downloaded;	}
			else
			{	row_Temp = (i * total_Number_of_Segments) + i + total_Number_of_Segments;		}
			var W_i_nplus1 = segmentSizes[row_Temp][2] * 1000;

			if( (W_i_nplus1/H_n) <=  (buffer_Current - I) )
			{
				r_Current_No = i;
				break;
			}
		}
		delta = 0;
	}
	else if(buffer_Current <= b_A)		/*- Additive Increase -*/
	{
		if( (W_currplus1_nplus1/H_n) < (buffer_Current - I) )
		{
			if(r_Current_No < r_Max)
			{	r_Current_No = r_Current_No + 1;	}
			else
			{	r_Current_No = r_Max;			}
		}
		else
		{
			r_Current_No = r_Current_No;
		}
		delta = 0;
	}
	else if(buffer_Current <= b_B)		/*- Aggressive Download -*/
	{
		for(var i=r_Max; i>=r_Current_No ; i--)
		{	
			if (current_Segment_Being_Downloaded <= total_Number_of_Segments)		/* Checking for Segment Number overflow Condition */
			{	row_Temp = (i * total_Number_of_Segments) + i + current_Segment_Being_Downloaded;	}
			else
			{	row_Temp = (i * total_Number_of_Segments) + i + total_Number_of_Segments;		}
			var W_i_nplus1 = segmentSizes[row_Temp][2] * 1000;

			if( (W_i_nplus1/H_n) <=  (buffer_Current - I) )
			{
				r_Current_No = i;
				break;
			}
		}
		delta = 0;
	}
	else if(buffer_Current > b_B)		/*- Delayed Download -*/
	{
		for(var i=r_Max; i>=r_Current_No ; i--)
		{
			if (current_Segment_Being_Downloaded <= total_Number_of_Segments)		/* Checking for Segment Number overflow Condition */
			{	row_Temp = (i * total_Number_of_Segments) + i + current_Segment_Being_Downloaded;	}
			else
			{	row_Temp = (i * total_Number_of_Segments) + i + total_Number_of_Segments;	}
			var W_i_nplus1 = segmentSizes[row_Temp][2] * 1000;

			if( (W_i_nplus1/H_n) <=  (buffer_Current - b_A) )
			{
				r_Current_No = i;
				break;
			}
		}
		delta = buffer_Current - b_B;
	}
	else
	{
		r_Current_No = r_Current_No;
		delta = 0;
	}
}



/*updating the Number of Bitrate Switching Events..  */
if(current_Segment_Being_Downloaded == segmentVsQuality.length && current_Segment_Being_Downloaded != 0)
{
	if(r_Current_No != segmentVsQuality[segmentVsQuality.length - 1])
	{
		number_Of_BSE++;
	}	
}

/*
console.log("number_Of_BSE++ : "+number_Of_BSE);
console.log("current_Segment_Being_Downloaded: "+current_Segment_Being_Downloaded);
console.log(" r_Current_No = "+r_Current_No);
*/

if((current_Segment_Being_Downloaded == segmentVsQuality.length) && (current_Segment_Being_Downloaded <= total_Number_of_Segments))
{
	segmentVsQuality[segmentVsQuality.length] = r_Current_No;	/*updating the current selected rep no to the segment number. */
	
}



/*****************----------------------**********************************/
/* Simulating the rebuffering part.... Dummy Code to introduce rebuffer mannually
if(current_Segment_Being_Downloaded == 10)
{
buffer_Current = parseFloat(document.getElementById("bl").innerHTML);
delta = buffer_Current+5;

console.log("buffer_Current is: "+buffer_Current);
console.log("Rebuffer Delta is: "+delta);
}
*/

/*****************----------------------**********************************/


/******************************************/
/*   Code for obtaining number of BSE and Interruptions. Avg bitrate etc.... StartupDelay: 0.146

HighestVRTime: 0.999 from the terminal as well...*/
/******************************************/

if(already_Rep_Updated == 0)
{
	/* Sending the Newly selected representation to the Switch request.*/
	switchRequest = new MediaPlayer.rules.SwitchRequest(r_Current_No, MediaPlayer.rules.SwitchRequest.prototype.STRONG);
}
/******** SARA Function End here **********/


            if (switchRequest.value !== MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE) {
                self.debug.log("BufferOccupancyRule requesting switch to index: ", switchRequest.value, "type: ",mediaType, " Priority: ",
                    switchRequest.priority === MediaPlayer.rules.SwitchRequest.prototype.DEFAULT ? "Default" :
                        switchRequest.priority === MediaPlayer.rules.SwitchRequest.prototype.STRONG ? "Strong" : "Weak");
            }



            callback(switchRequest);
        }
    };
};

MediaPlayer.rules.BufferOccupancyRule.prototype = {
    constructor: MediaPlayer.rules.BufferOccupancyRule
};

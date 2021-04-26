MediaPlayer.utils.Debug = function () {
    "use strict";

    var logToBrowserConsole = true,
        showLogTimestamp = false,
        startTime = new Date().getTime();

    return {
        eventBus: undefined,
        /**
         * Prepends a timestamp in milliseconds to each log message.
         * @param {boolean} value Set to true if you want to see a timestamp in each log message.
         * @default false
         * @memberof MediaPlayer.utils.Debug#
         */
        setLogTimestampVisible: function(value) {
            showLogTimestamp = value;
        },
        /**
         * Toggles logging to the browser's javascript console.  If you set to false you will still receive a log event with the same message.
         * @param {boolean} value Set to false if you want to turn off logging to the browser's console.
         * @default true
         * @memberof MediaPlayer.utils.Debug#
         */
        setLogToBrowserConsole: function(value) {
            logToBrowserConsole = value;
        },
        /**
         * Use this method to get the state of logToBrowserConsole.
         * @returns {boolean} The current value of logToBrowserConsole
         * @memberof MediaPlayer.utils.Debug#
         */
        getLogToBrowserConsole: function() {
            return logToBrowserConsole;
        },
        /**
         * This method will allow you send log messages to either the browser's console and/or dispatch an event to capture at the media player level.
         * @param {arguments} The message you want to log. The Arguments object is supported for this method so you can send in comma separated logging items.
         * @memberof MediaPlayer.utils.Debug#
         */
        log: function () {

            var logTime = null,
                logTimestamp = null;

            if (showLogTimestamp)
            {
                logTime = new Date().getTime();
                logTimestamp = "[" + (logTime - startTime) + "] ";
            }

            var message = arguments[0];
            if (arguments.length > 1) {
                message = "";
                Array.apply(null, arguments).forEach(function(item) {
                    message += " " + item;
                });
            }

            if (logToBrowserConsole) {
		hs=parseInt(document.getElementById("vi").innerHTML);
			if((hs==aR.length)&&lflag==1)
			{
				var ht=(new Date()).getTime();
				document.getElementById("hvt").innerHTML=parseFloat((ht-ct)/1000);lflag=-1;
			}
			if(parseFloat(document.getElementById("bl").innerHTML)>0.5&&rbflag==0)
				rbflag=1;
			if(parseFloat(document.getElementById("bl").innerHTML)<0.5)
			{
				if(rbflag==1)
				{
					rbe++;rbflag=0;
					document.getElementById("re").innerHTML=rbe;
				}
			}
			if(bitrateflag==0)
			{
				time=parseInt(((new Date()).getTime()-ct)/1000);
				if(document.getElementById("bl").innerHTML!=undefined){
				//console.log(vrep[cur]);
				//console.log(document.getElementById("bl").innerHTML);
				//console.log(" ");
				bitrateflag=1;}
			}
			else if(bitrateflag==1)
			{
				//console.log(cur);
				var t1=parseInt(((new Date()).getTime()-ct)/1000);
				if(t1>=time){
				//console.log(vrep[cur]);
				//console.log(document.getElementById("bl").innerHTML);
				//console.log(" ");
				time++;	}		
			}
			
            }

            this.eventBus.dispatchEvent({
                type: "log",
                message: message
            });
        }
    };
};

/*
 * The copyright in this software is being made available under the BSD License, included below. This software may be subject to other third party and contributor rights, including patent rights, and no such rights are granted under this license.
 * 
 * Copyright (c) 2013, Digital Primates
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Digital Primates nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
MediaPlayer.dependencies.ManifestLoader = function () {
    "use strict";

    var RETRY_ATTEMPTS = 3,
        RETRY_INTERVAL = 500,
        parseBaseUrl = function (url) {
            var base = null;

            if (url.indexOf("/") !== -1)
            {
                if (url.indexOf("?") !== -1) {
                    url = url.substring(0, url.indexOf("?"));
                }
                base = url.substring(0, url.lastIndexOf("/") + 1);
            }
		var xmlhttp;
			if (window.XMLHttpRequest)
  			{
  				xmlhttp=new XMLHttpRequest();
  			}
			if(ctflag==0){
			ct=new Date().getTime();ctflag=1;}//console.log(ct);
			time=ct;
			xmlhttp.open("GET",url,false);
			xmlhttp.send();
			var xmlDoc=xmlhttp.responseXML;
			var x= xmlDoc.getElementsByTagName("MPD")[0].getAttribute("minBufferTime");
			v=Math.ceil(parseFloat(x.substring(2,x.length-1)));//console.log(v);
			//edit..
			//var mimetypecounter=0;
		//var repcounter=0;
		if(vrepflag==0)
		{
			var x1=[];
			x1=xmlDoc.getElementsByTagName("AdaptationSet").item(0).attributes;
			for(var i=0;i<x1.length;i++)
				if(x1[i].name=="mimeType")
					mimeflag=1;
			while(1)
			{
				var mimetype;
				//edit
				if(mimeflag==0)
				{
					if(xmlDoc.getElementsByTagName("Representation")[repcounter]==undefined)
						break;
					else if(xmlDoc.getElementsByTagName("Representation")[repcounter].getAttribute("mimeType")=="audio/mp4"){repcounter=repcounter+1;}
					
					else
					{
						var reps=xmlDoc.getElementsByTagName("Representation")[repcounter].getAttribute("bandwidth");
						vrep[vrep.length]=parseFloat(reps);
						repcounter++;
					}
				}
				//edit
				else
				{//edit
				mimetype=xmlDoc.getElementsByTagName("AdaptationSet")[mimetypecounter].getAttribute("mimeType");
				//console.log(mimetype+"mimetype");


				//If multipul audio case arises, it need to be handeled saperately.
				if(mimetype=="audio/mp4")
				{	
					if(mtflag==0)
					{
						mimetypecounter=1;
						repcounter=repcounter+1;
						mtflag=1;
					}
					else
						repcounter=repcounter+1;
					
				}
				else if(mimetype=="video/mp4")
				{
					//edit
					
					if(mimetypecounter==0)
						mf=1;
					//edit
					//console.log("mf"+mf);
					if(xmlDoc.getElementsByTagName("Representation")[repcounter]==undefined)
					{	
					
						break;		//To breal the outer while loop;
					}
					else
					{
						
						var rep=xmlDoc.getElementsByTagName("Representation")[repcounter].getAttribute("bandwidth");

						vrep[vrep.length]=parseFloat(rep);
						repcounter++;
						
					}
					
				}
				}//edit
			}
			//for(var i=0;i<vrep.length;i++)
				//console.log(vrep[i]);
		}
		else{}
		function sortNumber(a,b) {
    			return a - b;
		}
		vrep.sort(sortNumber);
		if(mf==1)
			vrep.shift();
		//for(var i=0;i<vrep.length;i++)
				//console.log(vrep[i]);
		vrmax=vrep.length-1;
		//vrmax=vrep.length-1;
			//edit..
            return base;
        },

        doLoad = function (url, remainingAttempts) {
            var baseUrl = parseBaseUrl(url),
                request = new XMLHttpRequest(),
                requestTime = new Date(),
                loadedTime = null,
                needFailureReport = true,
                manifest,
                onload = null,
                report = null,
                self = this;
		

            onload = function () {
                if (request.status < 200 || request.status > 299)
                {
                  return;
                }
                needFailureReport = false;
                loadedTime = new Date();

                self.metricsModel.addHttpRequest("stream",
                                                 null,
                                                 "MPD",
                                                 url,
                                                 null,
                                                 null,
                                                 requestTime,
                                                 loadedTime,
                                                 null,
                                                 request.status,
                                                 null,
                                                 null,
                                                 request.getAllResponseHeaders());

                manifest = self.parser.parse(request.responseText, baseUrl);

                if (manifest) {
                    manifest.url = url;
                    manifest.loadedTime = loadedTime;
                    self.metricsModel.addManifestUpdate("stream", manifest.type, requestTime, loadedTime, manifest.availabilityStartTime);
                    self.notify(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED, {manifest: manifest});
                } else {
                    self.notify(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED, {manifest: null}, new MediaPlayer.vo.Error(null, "Failed loading manifest: " + url, null));
                }
            };

            report = function () {
                if (!needFailureReport)
                {
                  return;
                }
                needFailureReport = false;

                self.metricsModel.addHttpRequest("stream",
                                                 null,
                                                 "MPD",
                                                 url,
                                                 null,
                                                 null,
                                                 requestTime,
                                                 new Date(),
                                                 request.status,
                                                 null,
                                                 null,
                                                 request.getAllResponseHeaders());
                if (remainingAttempts > 0) {
                    self.debug.log("Failed loading manifest: " + url + ", retry in " + RETRY_INTERVAL + "ms" + " attempts: " + remainingAttempts);
                    remainingAttempts--;
                    setTimeout(function() {
                        doLoad.call(self, url, remainingAttempts);
                    }, RETRY_INTERVAL);
                } else {
                    self.debug.log("Failed loading manifest: " + url + " no retry attempts left");
                    self.errHandler.downloadError("manifest", url, request);
                    self.notify(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED, null, new Error("Failed loading manifest: " + url + " no retry attempts left"));
                }
            };

            try {
                //this.debug.log("Start loading manifest: " + url);
                request.onload = onload;
                request.onloadend = report;
                request.onerror = report;
                request.open("GET", self.requestModifierExt.modifyRequestURL(url), true);
                request.send();
            } catch(e) {
                request.onerror();
            }
        };

    return {
        debug: undefined,
        parser: undefined,
        errHandler: undefined,
        metricsModel: undefined,
        requestModifierExt:undefined,
        notify: undefined,
        subscribe: undefined,
        unsubscribe: undefined,

        load: function(url) {
            doLoad.call(this, url, RETRY_ATTEMPTS);
        }
    };
};

MediaPlayer.dependencies.ManifestLoader.prototype = {
    constructor: MediaPlayer.dependencies.ManifestLoader
};

MediaPlayer.dependencies.ManifestLoader.eventList = {
    ENAME_MANIFEST_LOADED: "manifestLoaded"
};

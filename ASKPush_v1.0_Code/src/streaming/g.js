var cur=0,acur=0,v,ct,sdflag=0,ctflag=0,nbs=0,hs=0,mf=0,lflag=0,rbe=0,rbflag=0,brsum=0,vrepflag=0,mimeflag=0,mtflag=0,vrmax;
//cur-current video representation id,current audio representation id,v-chunk size.
var aR  = [],aaR  = [],rb=[],vrep=[],rbflag=0,bstop,bstart,time=0,bitrateflag=0,mimetypecounter=0,repcounter=0;
function sleep(milliseconds) {
  		var start = new Date().getTime();
  		for (var i = 0; i < 1e7; i++) {
    		if ((new Date().getTime() - start) > milliseconds){
      		break;
    			}
  		}
		}
//aR-videoRepresentation array
//aaR-audioRepresentation array

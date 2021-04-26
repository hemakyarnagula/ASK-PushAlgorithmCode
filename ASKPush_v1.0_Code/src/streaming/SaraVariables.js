/* New Variables Decared for SARA Algorithm*/

/*Variable that has to be changes with change in DATASET*/
var segment_Duration = 10;		/*Change this value accoring to the segment duration dataset you are using.*/

var segmentSizes=[];		/* Contains the Segment size to estimate the H_n. Change the corresponding file according to the Dataset*/

/***************************************/
/*One time initilatization variables*/
var lastSegmentFetchedIndex=-1;

var segmentVsQuality=[];

var segmentVsAvgThroughput=[];

var RED_log = [];

var current_Segment_Being_Downloaded = 0;

var total_Number_of_Segments = 0;

var number_Of_BSE = 0;

var H_n = 0;

var buffer_Current = 0;		/*Current Buffer Length.*/

/*SARA Buffer Constants (in Seconds). These values are set for 10_sec Segment Duration. Need to change the values according to the segment duration*/
var I = 2*segment_Duration;
var b_A = 5*segment_Duration;
var b_B = 10*segment_Duration;
var b_Max = 12*segment_Duration;

var available_bitrates=[];	/* This array contains the available set of bitrates */

var r_Max = 0;
var r_Min = 0;
var r_Current_No = 0;
var delta = 0;

var start_time = 0;
var starttime_flag = 0;
var console_Print_Time = 0;








//By default it is set to zero. Once it is set to one, that means, we are downloading the Init segments. This flag will allow to make thing smoothly in Fetching.




var IsItInitSegmentFlag=0; 
var myflag=0; //for temp use
var ctflag=0;
var v=0;
var mtflag=0;
var ct=0;
var nbs=0;
var hs=0;
var rmflag=0;
var vid=0;
var mf=0;
var bitrateflag=0;
var time=0;
var rbflag=0;
var rbe=0;

var sdflag=0;
var ctflag=0;
var vrepflag=0;

var n=1;
var rcurr=0;
var rcurr1=0;

var next=0;
var vrmin=0;
var vrmax;
var delay=0;
var wsum=0;
var wbdsum=0;
var wbd=0;
var sflag=0;
var sflagloop=0;
var mimeflag=0;



/*Declaration of Necessary Araays for SARA*/
var vrep=[]
var w=[];












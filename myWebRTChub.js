'use-strict'

//localUsers (lu) send camera and microphone to peers
//peers (o) receive video and audio from peers

//MANY TRICKS TO SAVE BANDWIDTH AND RECEIVING PEERS PROCESSING
// draw all things in local canvas that is broadcast 
// saves receivers object-fit for we just send the size needed
// saves receivers clipping to circle
// ...

//EXPORTS so that CLOSURE compiler in ADVANCED preserves function // https://developers.google.com/closure/compiler/docs/api-tutorial3
//window['myWebRTChub'] = myWebRTChub
//window['myWebRTChub.inviteToInstantTalk'] = myWebRTChub.inviteToInstantTalk


/*INTERFACES/Plugins
	afterMyWebRTChubInitialisationDoThis()
	getDefaultImageForWebRTChub(meetObj, index, canRollOver)
	getTotalImagesForWebRTChub(meetObj)
	adjustWidthHeightOfPeersInMyWebRTChub(width, height)
	adjustWidthHeightOfMySelfInMyWebRTChub(width, height)
*/
																//in Safari without ALL then initiator does not fire SIGNAL event
const onlyUseRelayInWebRTC =  /* true && isInLocalhost//    */ !isSafari && false //only works locally and good for testing if TURN server is working
const onlyUseSTUNservers = false //true does not use TURN servers		
		
const newMediaStreamWithTracks = false

var DEBUGtrueToFalse = true

var show3DaccessWebRTChub = true || isInLocalhost || location.host.toLowerCase().indexOf("classes3d.") != -1
	  // || location.host.toLowerCase().indexOf("aratschool.") != -1
	  // || location.host.toLowerCase().indexOf("eupasseio.") != -1)

var speechRecognition

const webRTC_useCacheCanvas2 = false //CPU true: 12 %   false: 11% do not detect flickering

//REPLICATED in WebRTChub.java
const SENTENCES_OF_MY_WEBRTC_HUB = [
	"waiting for others" //0
	, "request video and audio" //1
	, "close this participant" //2
	, "share screen" //3
	, "page" //4
	, "not enabled for current page" //5
	, "make others fetch this screen (results depend on permissions)" //6
	, "allow local access" //7
	, "No" //8
	, "Yes" //9
	, "Never" //10
	, "Always" //11
	, "microphones off" //12
	, "Camera and microphone access failed" //13
	, "send to all" //14
	, "apply settings" //15
	, "share file with others" //16
	, "show question" //17
	, "question of" //18
	, "close meetings" //19
	, "screen capture failed" //20
	, "screen sharing" //21
	, "click image corners to select" //22
	, "search" //23
	, "choose color" //24
	, "to close" //25
	, "question" //26
	, "answering"  //27
	, "answer" //28
	, "solution" //29
	, "name" //30
	, "me" //31
	, "yes" //32
	, "no" //33
	, "to return to video conference" //34
	, "meeting link" //35
	, "edit" //36
	, "shows" //37
	, "nothing to see" //38
	, "please wait" //39
	, "manage local users and cameras" //40
	, "end all" //41
	, "participants" //42
	, "create" //43
	, "please wait for the answer type" //44
	, "student" //45
	, "detected emotion" //46
	, "add user or camera" //47
	, "face detection technology is being loaded" //48
	, "image" //49
	, "add automatically" //50
	, "Can not remove first user" //51
	, "Manage meetings and peers" //52
	, "all" //53
	, "add to meeting" //54
	, "send to others" //55
	, "no one to send to" //56
	, "login as" //57
	, "attendant (not host)" //58
	, "accept" //59
	, "waiting for host" //60
	, "eject" //61
	, "refuse" //62
	, "wait" //63
	, "standby" //64
	, "Guests" //65
	, "Chat center" //66
	, "rename" //67
	, "remove" //68
	, "add user" //69
	, "choose initial camera" //70
	, "share" //71
	, "filter" //72
	, "Already present." //73
	, "Merge both?" //74
	, "choose initial microphone" //75
	, "show or select" //76
	]


const useThisCheckforConnections = true //true to activate

const ALG_ENCRYPTDECRYPT = "A256CTR"

const openMojis =
["1F44B"
,"1F44C"
,"1F44D"
,"1F44E"
,"1F44F"
,"1F468-200D-1F3EB"
,"1F469-200D-1F393"
,"1F469-200D-1F3EB"
,"1F4AA"
,"1F590"
,"1F596"
,"1F90F"
,"1F919"
,"1F91D"
,"1F91E"
,"1F932"
,"1F9D1-200D-1F393"
,"261D"
,"270A"
,"270B"
,"270C"
]

const trianglesCircleColor_hex = [
	"#fff", // white
	"#000", // black
	"#f00", // red
	"#0f0", // green
	"#00f", // blue
    "#FFB300", // # Vivid Yellow
    "#803E75", //# Strong Purple
    "#FF6800", //# Vivid Orange
    "#A6BDD7", //# Very Light Blue
    "#C10020", //# Vivid Red
    "#CEA262", //# Grayish Yellow
    "#817066", //# Medium Gray

    // The following don't work well for people with defective color vision
    "#007D34", //# Vivid Green
    "#F6768E", //# Strong Purplish Pink
    "#00538A", //# Strong Blue
    "#FF7A5C", //# Strong Yellowish Pink
    "#53377A", //# Strong Violet
    "#FF8E00", //# Vivid Orange Yellow
    "#B32851", //# Strong Purplish Red
    "#F4C800", //# Vivid Greenish Yellow
    "#7F180D", //# Strong Reddish Brown
    "#93AA00", //# Vivid Yellowish Green
    "#593315", //# Deep Yellowish Brown
    "#F13A13", //# Vivid Reddish Orange
    "#232C16", //# Dark Olive Green
	]

var expresionToEmotionIcon = []
expresionToEmotionIcon["angry"] = 7
expresionToEmotionIcon["disgusted"] = 4
expresionToEmotionIcon["fearful"] = 8
expresionToEmotionIcon["happy"] = 3
expresionToEmotionIcon["neutral"] = 5
expresionToEmotionIcon["sad"] = 6
expresionToEmotionIcon["surprised"] = 2

const UseFirebaseToShareObjectsNotMessages = true

var encodedUniqueTokenForTurnServers
var umniverseTurnAssistantsResponses = new Map()
var umniverseTurnAssistantsPhase = new Map() 
const umniverseTurnAssistantsPhase_warmup = 0
const umniverseTurnAssistantsPhase_turnserver443 = 1
const umniverseTurnAssistantsPhase_turnserver8443 = 2
const umniverseTurnAssistantsPhase_error = 3
const umniverseTurnAssistantsPhase_umniverseServerData = 4
const umniverseTurnAssistantsPhase_end = 5

var meetingUUIDtoLocalUserInvited = new Map()
var toggleManageLocalUsersToSendTOP = false //do not reset
var manageLocalUsersIsShown 
var toggleShowMeetingLinksAndPeersTOP = false //do not reset

let COMMAND_SYMBOL = "#COM@$#"

// variables that do not reset
var closeMyWebRTCdivIfZero = 0
var lastDeviceInfos
var previousWebRTChubIdToDevices
var myWebRTChubEnumerateDevices_previous

var lastMeetingUUIDinMenuMoveMeetingToPlace

var countLocalUserMicrophoneMuteNotUnmute = 0

var alreadyInitializedInUpdateBottomBar

var maxWidthOfVerticalSidePanel = 224
var globalSidePanelDirectionVALUE = undefined
var widthOfVerticalSidePanel = maxWidthOfVerticalSidePanel
var heightOfVerticalSidePanel = "100px"
var webrtchub_numSideSize = 1
var webrtchub_numSideElements = 1
var waitingForResponseGetUserMedia = 0

var lastInitialVideoSelector
var lastAutoSelectFirst
var lastMeetingUUIDwaitingForOthers

var allTheStatusErrors = ""
var allTheUrlsOfErrors = ""
var numberOfUrlsOfErrors = 0

// other vars that never reset please place them in tapalife_fast next to var registerChannelForUUIDpeers !!!
var allPrivateMeetingUUID = []
var allPrivateMeetingUUIDimage = []

var numMeetingsGlobal
var numMeetingsGlobalHidden
var meetingIDselectedWebRTChub
var meetObjActive

var divWithWebRTChub

var mapMeetingToNumPlace3D

var nextNumberForMeeting = 1

var afterGotDevicesForPeers
var initialVideoID = windowLocalStorageRead("webRTChub_initialVideoID")
var initialAudioID = windowLocalStorageRead("webRTChub_initialAudioID")
var setInitial_addGlobalAudioVideoStream

var showingOrHidingTRspecificLocalUserAndObjectPeer = []

var localUserButtonToUpdateInputDevicesUUID

var numLocalUsersGlobal
const maxLocalUsersGlobalPerMeeting = 10
var enteredInitiateHTML = 0

var afterChangeToEmotionExecuteThis

var userChangedWhenNoSpaceBottomBar
var showingWhenNoSpaceBottomBar = true

var localUsersUUIDtoObject
var nextLocalUsersN

var resizeMadeInMyWebRTChubUUID
var manual_slideSwitchVerticalHorizontal = false
var afterSlideSwitchVerticalHorizontal
var adjustWidthHeightOfMySelfInMyWebRTChubUUID
var adjustWidthHeightOfPeersInMyWebRTChubUUID
var adjustNewLocalUserInMyWebRTChubUUID
var timerResizeElementsWithPeersParticipant

var extraPeersToShowInBottomTD
var receiversMessagesStartingWith
var addSettingsToSendAndReceive //receiving gets informed that a new user showed up
var informPluginsThatPeerHasClosed

var questionsControlCenterPOINTER
var tempFunctionToCall //must be global so that the compiler does not minify it

var lastTouchStart

var alreadyEnumeratedDevices
var videoIDsWebRTChub

var lastPrivateMeetingUUID

var firstTimeSendScreenToPeers

var isDebuggingWebRTCpeers
var nextFullLinkGlobal

var simplePeersObjects 
var peersSelectorsToUUID
var peersUUIDtoSelectors
var peersUUIDtoUserNames
var peersUUIDtoUserSubjects
var meetingWithUUIDtoPeersObjects 
var myMeetingRegisteredInFirebaseChannels

var authorisationsForRequestScreen

var meetingUuid_later = []

var localUserOverdraw

var lastActivateCorner
var beforeLeavingCorner

var alreadyCreatedPeersTopBar

var lastMenuUserCaptionLocaluserID

var showingPeersMyVideo
var showingPeersMyAudio 
var videoStreamToCopyToCanvas
var	lastVideoStreamToCopyToCanvas
var nextVideoStreamToCopyToCanvasLETTER
var lastVideoStreamLETTERandNUMBER
var screenStreamToCopyToCanvas

var myCanvasToSendIsInMainScreen 
var myCanvasInMainScreenSameSizeThanThePeersVideo 

var canvasToSendSizeBeforeScreenSharing

var showMyVideoInScreenSharing3x3pos
var zoomVideoCameraProjectingOverScreenSharing

var peersCameraActive
var peersMicrophoneActive 
var peersVideoActive = true
var peersSpeakersActive 

var mapVideoIDtoOrigStream = new Map() //map of videoID to {stream, uses = 0}

var onNewGetUserMediaChooseThisAudioInputDeviceID

var globalIsMutedBecauseOfSeveralReasons = 0  //subcontrols like youtube players

var mapUsePopupToChoosePeersForAction

var beforeDivEmcopassingAll_INSIDE_BGcolor

var lastObjectsMovedToSidePanel= new Set()
var objectsMovedToSidePanelBeforeAutomaticallyGoingTo3D = new Set()

var lastIDofVideoDevicePeers
var lastIDofAudioDevicePeers
var lastIDofAudioOutputPeers

var retriesToReachUmniverseTurnAssistants = 0

//when FALSE no need to stop coherent with audio that we can not SEE stoping and it is handy to see before enabling

var dxdyToSendToPeers
var lowerFrameRate
var audioRate
	
var jsonQUESTIONtoSendToOthers = ""
var oWhoseQuestionIsBeingShown
var currentMyQuestionUUID

var imagesOfEmotions
var emotionsRawData
var iconsRawData
var imagesOfIcons
var questionRawData
var URLlinkRawData

var numTransfersLateParticipants

var lastSelectorChosenInShowTopBar	
	
var audioInputSelectPeers
var audioOutputSelectPeers
var videoSelectPeers
var selectorsPeers

var lastSelectorPeersTopBar

var lastTimePlayedNewUserSoundPeers

var redButtonToReturnToVideoConference

var firstTimeLeavingDIVwithPeersWebRTChub

var rectForWetbRTChubFaceDetection
var nextRectOfHeadForAvatarWebRTChub
var lastDetectionAll
var deltaTimeForNextRectForAvatarWebRTChub
var objectsForFaceTrackingJS
var intervalFaceDetectionWebRTChub
var lastEmotionThatWasDetected
var augmentAutomaticallyNextHeadsDetection

var optionsWebRTChubHigh
var optionsWebRTChubMedium

var optionsWebRTChubLow
var optionsWebRTChubDONOTCHANGE

var peersMainVideoWidth
var peersMainVideoHeight
var peersSmallVideoWidth
var peersSmallVideoHeight
var currentWidthHeightPeersGlobalVideoSendDIV
var currentWidthToHeightRatioForCanvasVideoSend

var dxdyIconCornersReceive
var dxdyBigReceiving

functionsToCallWhenToogle3D.add(toCallWhenToogle3DmyWebRTChub)

if(numMeetingsGlobal === undefined)
	initiateVarsMyWebRTChub()


//-----------------------------------------------------------
function resizeElementsWithPeersParticipant()
{
  myWebRTChub.resizeElementsWithPeersParticipant(undefined, undefined, undefined, undefined, true)
}
//-------------------------------------------------------
function toCallWhenToogle3DmyWebRTChub(to3D)
{
if(to3D)
{
	for(let elem of objectsMovedToSidePanelBeforeAutomaticallyGoingTo3D)
	  if(elem)
		  myWebRTChub.addOrRemoveFromMainScreen(undefined, elem.meetingUUID, "#" +elem.getId(), true)
	objectsMovedToSidePanelBeforeAutomaticallyGoingTo3D.clear()
}
}
//-------------------------------------------------------
function meetObjEmcompassingElement(elem)
{
		let encompassingDiv = $(elem).closest(".divEmcopassing_meetings")[0]
		if(encompassingDiv)
			return meetingsUUIDtoObject.get(encompassingDiv.getId())
}
//-------------------------------------------------------
function initiateVarsMyWebRTChub()
{

numMeetingsGlobal = 0
numMeetingsGlobalHidden = 0
meetingIDselectedWebRTChub = undefined
nextNumberForMeeting = 1

mapMeetingToNumPlace3D = new Map()

numLocalUsersGlobal = 0
localUsersUUIDtoObject = new Map()
activeLocalUser = {} //to be used when no video conf
nextLocalUsersN = 1
activeOtherUserSELECTOR = undefined

resizeMadeInMyWebRTChubUUID = []
afterSlideSwitchVerticalHorizontal = []
adjustWidthHeightOfMySelfInMyWebRTChubUUID = []
adjustWidthHeightOfPeersInMyWebRTChubUUID = []
adjustNewLocalUserInMyWebRTChubUUID = []

extraPeersToShowInBottomTD = []
receiversMessagesStartingWith = []
addSettingsToSendAndReceive = [] //receiving gets informed that a new user showed up
informPluginsThatPeerHasClosed = []

questionsControlCenterPOINTER = undefined
tempFunctionToCall //must be global so that the compiler does not minify it

lastTouchStart = undefined

alreadyEnumeratedDevices = undefined
videoIDsWebRTChub = []

firstTimeSendScreenToPeers = true

isDebuggingWebRTCpeers = true && isInLocalhost
nextFullLinkGlobal = undefined

simplePeersObjects = new Map() //selectorsToObjects
peersSelectorsToUUID = []
peersUUIDtoSelectors = []
peersUUIDtoUserNames = [] //local usernames
peersUUIDtoUserSubjects = [] //local subject
meetingWithUUIDtoPeersObjects = new Map()
myMeetingRegisteredInFirebaseChannels = []

authorisationsForRequestScreen = []

meetingUuid_later = []

lastActivateCorner = ""

alreadyCreatedPeersTopBar

showingPeersMyVideo = true
showingPeersMyAudio = false
videoStreamToCopyToCanvas = new Map()
lastVideoStreamToCopyToCanvas = undefined
nextVideoStreamToCopyToCanvasLETTER = "A" //always increment letter
lastVideoStreamLETTERandNUMBER = "A1"


screenStreamToCopyToCanvas = undefined

myCanvasToSendIsInMainScreen = true
myCanvasInMainScreenSameSizeThanThePeersVideo = false

canvasToSendSizeBeforeScreenSharing = undefined

showMyVideoInScreenSharing3x3pos = undefined
zoomVideoCameraProjectingOverScreenSharing = 1

peersCameraActive = showingPeersMyVideo
peersMicrophoneActive = showingPeersMyAudio
peersSpeakersActive = true

mapUsePopupToChoosePeersForAction = []


beforeDivEmcopassingAll_INSIDE_BGcolor = undefined

//when FALSE no need to stop coherent with audio that we can not SEE stoping and it is handy to see before enabling

const testingWithManyUsers = isInLocalhost && false

dxdyToSendToPeers = testingWithManyUsers ? 80 : 480
lowerFrameRate = 15
audioRate = 16
	
jsonQUESTIONtoSendToOthers = ""
oWhoseQuestionIsBeingShown
currentMyQuestionUUID

imagesOfEmotions = []
emotionsRawData = []
iconsRawData = []
imagesOfIcons = []
questionRawData = undefined
URLlinkRawData = undefined

numTransfersLateParticipants = 0

lastSelectorChosenInShowTopBar = undefined	
	
selectorsPeers = []

lastSelectorPeersTopBar = undefined

lastTimePlayedNewUserSoundPeers = 0

redButtonToReturnToVideoConference = undefined

firstTimeLeavingDIVwithPeersWebRTChub = true


rectForWetbRTChubFaceDetection = undefined
nextRectOfHeadForAvatarWebRTChub = []
lastDetectionAll = undefined
deltaTimeForNextRectForAvatarWebRTChub = 333;
objectsForFaceTrackingJS = undefined
intervalFaceDetectionWebRTChub = undefined
lastEmotionThatWasDetected = undefined
augmentAutomaticallyNextHeadsDetection = false

const optionsWebRTChubHighX = testingWithManyUsers ? 640 : 1280
const optionsWebRTChubHighY = testingWithManyUsers ? 480 : 720

optionsWebRTChubHigh =	  
{ video: 
	{
	 width: { ideal:optionsWebRTChubHighX },
	 height: { ideal:optionsWebRTChubHighY },
	 facingMode: { ideal:'user' },
	 frameRate: {ideal: lowerFrameRate}
	}
	, 
audio: 
	{
	sampleSize: {ideal: 16},
	echoCancellation: {ideal: true},
	noiseSuppression: {ideal: true},
	sampleRate: {ideal:16000},
	channelCount: {ideal:1}
	}
}

if(false)
optionsWebRTChubHigh =	  
{ video: {} ,
audio: {}
}

optionsWebRTChubMedium =	  
{ video: 
	{
	 width: { ideal:320 },
	 height: { ideal:240 },
	 facingMode: { ideal:'user' },
	 frameRate: {ideal: lowerFrameRate}
	}
	, 
audio: 
	{
	sampleSize: {ideal: audioRate},
	echoCancellation: {ideal: true},
	noiseSuppression: {ideal: true},
	sampleRate: {ideal:16000},
	channelCount: {ideal:1}
	}
}

optionsWebRTChubLow =	  
{ video: 
	{
	 width: { ideal:160 },
	 height: { ideal:120 },
	 facingMode: { ideal:'user' },
	 frameRate: {ideal: lowerFrameRate}
	}
	, 
audio: 
   {
	sampleSize: {ideal: audioRate},
	echoCancellation: {ideal: true},
	noiseSuppression: {ideal: true},
	sampleRate: {ideal:16000},
	channelCount: {ideal:1}
   }
}

optionsWebRTChubDONOTCHANGE = optionsWebRTChubHigh

peersMainVideoWidth =  dxdyToSendToPeers + "px"
peersMainVideoHeight = dxdyToSendToPeers + "px"
peersSmallVideoWidth = "72px"
peersSmallVideoHeight = "72px"
currentWidthHeightPeersGlobalVideoSendDIV = 72
currentWidthToHeightRatioForCanvasVideoSend = 1

dxdyIconCornersReceive = 44
dxdyBigReceiving = dxdyToSendToPeers

}
//----------------------------------------------------
async function myWebRTChub_showEffects(localUser, effectParam)
{
        const player = await Banuba_constructors.Player.create({ clientToken: "f43+AiEqdAm2vCi/OpLbJTRKfEC8pkAjGbiOTzWLmBLc9QyYpAJuYDqQQ+jEWLEr8a9SahzxN70aRjbkRhS+A/AQwa/bZvSZHNBmJuLGiR4vkeduOkiyj2ishAS93++xAVPwZNIR9KcS1HH/GlwNQg6u0g1AdP1Vjsmzl42bsQtyeH0fVn39NhGFdgSNRuFxRfUudqRggIeJLIK3xnDDZAZmaV+sQfOFFh7Qlibd9Am8Vb17w4r7Kf1X+sRZ+ya6nDx/5rEdjLOSv+x96Z68/Ok1q1gFhkBYzPrwpYAZ0UNCaTC1v7V5YqBDsWTpw7YyA16cDL3040EWxqfZMj2EZ6EQ3sTE1G1Te3NNjE70zn4sKRhQ33KimEoXw/4yFk1uFd0eoAqujSLxr9eDcQJbK7YzsqfjRMmtAxd6rrMWIZpq3AYUnFTejrCJKQQ0Fo3TP1aI7e8CTIniZMR83wE31cjx8Rcips+uyGAIbY5krQrhqk9jUyWOPxB0wv1jqUEGEz9KAYBs60X/Wv7wiB6rStL/Sj5WSjw3W+cWQnv1KnTQK/XumDjHihrxrw+3r2ZHHqx+onuB+A/0d8btABYImSkFD8hte8uycTRHWpQEpfmuFzVVg4dsWvpo3zCmMl0RKHmPvvc9QWqfo/MG908RtN3y1L9ywXd2faUYj+4Yq9M2ME0HY00mcCgFIjS5CmnSStTMHaW17uRAHbQCNdpYEP0pf+SXDNw3oix7cO51NV8w/NW8HpGdSy9Dn0FJ1lNnW59wXqgrpEzyWnjCvOPTOH5kvsFFtyiamL29FbE32bFL7KfL02XfmNeDDzm+nMsXM8rxfoNFFLGLHAaqKLI1vAmo1mIYtEcGD2tKAaVemEJIURsAaI5UiT604vNtvT80JFr6BBZfq+dKKq7QpQZ1aEV/3ZNnkBe5Vk2nMwZL7wFYc98wDqx7CSYLnMSmMRr4slJIsIP1u/8UvvX8vBcmUCMlzGgOFMCF8qzWqBIZuMBp5+TW3rBadEPvlvShzrQleldoSHahZxkzSyD7OLFsOP4j/+Y60dF7+1wk1PJz8o5f6py6ujsDa+BoSm0Me52IDpsIhKmnnn6Uru68ZWRbDbUQglF1umvBhHhzc019/btFVUXNpnAIuXtGomVLMgyUMP15YWlHUbud+NW9lVuqez18Q4OpsAlXvjmjz+cQ3hVAs0lW7XAPtfeImRtHI5jOzcPJarE73Dgsko6qrND6844NPumW8UqCwfKgU+Bz8baeFThMCgZ1ZkpJUsmwlD0qIuAq5f4C2s08dK40VRHYH/ES3LLuDr38HXpzU4OSWHpH/bofCKC7lUDtXyrRzmCB5R3lIdmMi7yXZKszjzK4fPBMP8IES7C2b4bKNPvsaC2smirSFaXyZ7HaYpvzsb4nlfABoidKkcnZuH3q7c0kbdkzGrO2Tt56OwR3GyXMS62inTjciKS5fe8yGsH+nQ4qK6NdLM/6NbTkWyG3/PXDHbHWRhKk7WqB56AfHhNemfr1QFBjxzTIAEv/yIN7mURQRbPnK7S6+qDYcMIbno/kskZ61Y/dz+ks9M7tY0/dmlR/hiQG1CbYjFdXIqq4eZqN35Upl7si5hk3InE6EBu/zXg/6cIJqNVAKVqpp992bPFFvY3Awr2fqvIBn7j7lD/qmearugU4JUQi1K07HM8YuzSuUWPtIEX01SXxvSeb6z5ql5NxBYF3XMx/ElHsneo+H/m/a+HQ0BY9VPqPPfkQgKPk8lxGelmPkvfQpVG5NTg8/A/JymqyOUwJhuC82cOW3YOqp9s0EZY1C4gF+o0hTismt2XhGZ3tD2gLFG+aPOKNKiJhQGGkI2DYFOljzuI8DE1RZtqdYst0oCjQ5eFy2gx6e/YV0u2xQkcewrQm27tixwbvoIYMRy9hw9q0IUK30Bom2T3c3QxIaMYAW5b1Nl9qqZGKGBT6sLlf1sW7m3JBNjcwMR7jUTVZdgon9sqFQz9DTBjcPdGXliaJuxvdyWzKMPNmxxWUdQ9gxt0ZmMtyq+dYjdiBiZQvewfJOTu11KxkvWaSRPLVdj5g3XAmzrnoFecNc/HyXjoLWY/d2ialja27TvMzTjz2xnaCYlhzEPDfVQ9WIXUtC1S89wVqJa+dIPgNHnM1hjpvKnoJ2DH39QhdzVdsrdxOF6iRUkRg4pum3GtFHEvP6tw5ebNLSxrLTAiU8q5Gyrx+hdByDP7neYYmDwL+2nEhepYrbNA+z8gm3WpcUE2H1KdsQSk5ya8R5iLsyus7jG0pMjU3dXNhPo91V4MRYszkmp9BGCBVh82UI4XQcIfOCiJwWZDFeAvanln5iD3oOYR831LEjNiOflr0l7KN36XWdq7NVCG09pGyvRgOGs/SanLb" })

		//const camera = await navigator.mediaDevices.getUserMedia({ audio: false, video: {deviceId:localUser.videoStream.deviceID} })
		player.use(new Banuba_constructors.MediaStream(localUser.videoStream.video.srcObject))

		let moduleURL
		let effectURL

		switch(effectParam)
		{
        case "Background 1": 
			moduleURL = "https://cdn.jsdelivr.net/npm/@banuba/webar/dist/modules/background.zip"
			effectURL = "https://storage.googleapis.com/cdniverse/banuba-quickstart-web/effects/BackgroundPicture.zip"	    	
			break
        case "Hat+Glasses": 
			moduleURL = "https://cdn.jsdelivr.net/npm/@banuba/webar/dist/modules/face_tracker.zip"
			effectURL = "https://storage.googleapis.com/cdniverse/banuba-quickstart-web/effects/BigPinkGlasses.zip"
			break
		}
		
		let module = banubaModules.get(moduleURL)
		if(!module)
		{
		module = await new Banuba_constructors.Module(moduleURL)
		banubaModules.set(moduleURL, module)	
		}
		await player.addModule(module)

		let effect = banubaEffects.get(effectURL) 
		if(!effect)
			{
			effect = await new Banuba_constructors.Effect(effectURL)
			banubaEffects.set(effectURL, effect)
			}
		await player.applyEffect(effect)
        
		Banuba_constructors.Dom.render(player, "#webar")
	
}
//-------------------------------------------------------
//HERE AND NOT IN tapalife_youte.js because of loading
function tapalifeYouTube_addToSettingsToSendToOther(sendingNotReceiving, settings, o)
{
	
let meetingUUID = o.meetingUUID
let meetObj = meetingsUUIDtoObject.get(meetingUUID)

if(sendingNotReceiving)
   {
	if(!tapalifeYouTube) 
		return
	let s = ""
		for(let [uuid, player] of youtubePlayers)
		{
			if(!player.sharedAmongAll || player.myLastTime == 0)
			  if(player.meetingWithUUID || !player.shared)
			    continue

			if(player.myLastTime > 0)
				player.sharedAmongAllAlreadySynced = true
			let h = tapalifeYouTube.stringToSharePlayer(player)
			s += h.length + " " + h 
		}
	if(s != "")
		settings.tapalifeYouTube_settings = s
    }
else if(!settings.tapalifeYouTube_settings)
  return
else if(!tapalifeYouTube) 
   loadScripts([compiledOrNotPathJS + "/static/tapalife_youtube"+ compiledOrNotJS +".js", "https://www.youtube.com/iframe_api"], undefined, undefined, undefined, function(){tapalifeYouTube_addToSettingsToSendToOther(sendingNotReceiving, settings, o)})
else
  {
   let s = settings.tapalifeYouTube_settings
   let lastPos = 0
   while(lastPos < s.length)
	{	
		let pos = s.indexOf(' ', lastPos)
		let numberW = parseInt(s.slice(lastPos, pos))
		lastPos = pos + 1 + numberW
		let parameters = s.slice(pos + 1, lastPos)
		tapalifeYouTube.processReceivedFromPeer(meetingUUID, o, parameters)
    }
  }
}
//------------------------------------------
function createAudioMeter(meetObj, clipLevel, averaging, clipLag) 
{
 let audioContext = meetObj.audioContext	
	
  const processor = audioContext.createScriptProcessor(256, 1, 1)
  processor.meetObj = meetObj
  processor.onaudioprocess = volumeAudioProcess
  processor.clipping = false
  processor.lastClip = 0
  processor.volume = 0
  processor.clipLevel = clipLevel || 0.98
  processor.averaging = averaging || 0.95
  processor.clipLag = clipLag || 750

  // this will have no effect, since we don't copy the input to the output,
  // but works around a current Chrome bug.
  processor.connect(audioContext.destination)

  processor.checkClipping = function () {
    if (!this.clipping) {
      return false
    }
    if ((this.lastClip + this.clipLag) < window.performance.now()) {
      this.clipping = false
    }
    return this.clipping
  }
  
  return processor
}
//---------------------------------
function webrtcDivName(meetingUUID)
{
	return meetingUUID ? webrtc_div_name + meetingUUID.replaceAll("-", "") : undefined
}
//---------------------------------------------------
const observer_webrtchub = new ResizeObserver(function()
	   {
		myWebRTChub.resizeElementsWithPeersParticipant(undefined, undefined, undefined, undefined, true)
		})
//---------------------------------
function volumeAudioProcess(event) 
{
let processor = event.srcElement
let meetObj = 	processor.meetObj

if(!meetObj.audioLocalUser)
	return
	
	
  const buf = event.inputBuffer.getChannelData(0)
  const bufLength = buf.length
  let sum = 0
  let x

  // Do a root-mean-square on the samples: sum up the squares...
  for (let i = 0; i < bufLength; i++) {
    x = buf[i]
    if (Math.abs(x) >= this.clipLevel) {
      this.clipping = true
      this.lastClip = window.performance.now()
    }
    sum += x * x
  }

  // ... then take the square root of the sum.
  const rms = Math.sqrt(sum / bufLength)

  // Now smooth this out with the averaging factor applied
  // to the previous sample - take the max here because we
  // want "fast attack, slow release."
  this.volume = Math.max(rms, this.volume * this.averaging)
  // document.getElementById('webrtc_audio_volume').innerHTML = Math.min(10, Math.round(this.volume * 20))
  let vol80 = peersMicrophoneActive && !meetObj.disabled && meetObj.microphoneActive && !meetObj.activeLocalUser.microphoneMuted ? Math.round(this.volume * 250) : 0
  let speaking = (vol80 > 20)
  let localUser = meetObj.audioLocalUser
  if(localUser.isSpeaking != speaking)
	{
		localUser.isSpeaking = speaking
		if(speaking)
			{
			if(localUser.timerOffSpeaking)
			  clearTimeout(localUser.timerOffSpeaking)
			myWebRTChub.sendMyMicInfoToOthers(localUser, true)
			}
		else
			localUser.timerOffSpeaking = setTimeout(function(){localUser.timerOffSpeaking = undefined; myWebRTChub.sendMyMicInfoToOthers(localUser, true)}, 1500)
			
	}
  $("#rowOfLocalUser_"+meetObj.audioLocalUser.uuid).css("background-color", "rgb(" + (100 + vol80 * 2) + ", "+(100 - vol80)+","+ (100 - vol80) + ")")

}
//---------------------------------
function updateTrackCount(event) 
{
	let stream = event.srcElement
	//alert("1 type="+ event.track.kind + " count=" + stream.getVideoTracks().length)
}
//---------------------------------
function updateTrackCount2(event) 
{
	let stream = event.srcElement
	//alert("2 type="+ event.track.kind + " count=" + stream.getVideoTracks().length)
}
//----------------------------------------------------------------------------
function globalSidePanelDirection()
{
const panel = $("#globalSidePanel_" + globalSidePanelDirectionVALUE)[0]

if(globalSidePanelDirectionVALUE === undefined
     || (!manual_slideSwitchVerticalHorizontal && (panel.offsetWidth === 0 || panel.offsetHeight === 0)))
	globalSidePanelDirectionVALUE = windowWidth()  >= windowHeight() ? "vertical" : "horizontal"
return globalSidePanelDirectionVALUE
}
//---------------------------------
function meetingSelectedWebRTC()
{
	let meetObj = meetingsUUIDtoObject.get(meetingIDselectedWebRTChub)
	if(!meetObj)
	  for([meetingIDselectedWebRTChub, meetObj] of meetingsUUIDtoObject)
       	if(!meetObj.notYetUsable)
		  break //selects first
	
	return meetObj
	
}
//---------------------------------------
function SVG_XML_cleanAndComplete(svgxml)
{
let pos = svgxml.indexOf("<svg ")
if(pos > 0)
	svgxml = svgxml.slice(pos)

return svgxml
}
//---------------------------------------
function changeToColorTrianglesCircle(color)
{
let changed = false
let appliable= false

if(activeLocalUser.circledGlobalVideoForPeers != 0)
	{
    appliable= true
	if(activeLocalUser.circledAndTrianglesColors[0] != color)
		{
		changed = true
		activeLocalUser.circledAndTrianglesColors[0] = color
		}
	}
else	
  for(let i = 1; i <= 4; i++)
    if(activeLocalUser.showNotHideCornersOfVideoToSend[i])	
    {
      appliable= true
      if(activeLocalUser.circledAndTrianglesColors[i] != color)
	  {
    	changed = true
    	activeLocalUser.circledAndTrianglesColors[i] = color
	  }
    }

if(changed)
	myWebRTChub.toggleCornersVisibility()
else if(!appliable) //changes all colors!!!  (hidden but can be shown later)
  for(let i = 0; i <= 4; i++)
	activeLocalUser.circledAndTrianglesColors[i] = color
	
	
$("#buttonsPeersTrianglesCircleColors").css("backgroundColor",color)

myWebRTChub.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "circledAndTrianglesColors", activeLocalUser.circledAndTrianglesColors, undefined)


return changed
}
//---------------------------------------
function chooseColorTrianglesCircle()
{
	
	if(dismissPopup1("chooseColorTrianglesCircle"))
		return
	
	let element = getPopup1("chooseColorTrianglesCircle")
	element.style.color = "#000"
	element.style.width = ""
	element.style.height = ""
	element.style.backgroundColor = "#fff"
	
	let s = "<div onClick='dismissPopup1(\"chooseColorTrianglesCircle\")'><br><b> &nbsp &nbsp " + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[24])+"</b>" 
		   + " &nbsp <b style='cursor:pointer; color:#800'> &nbsp X &nbsp </b><br><br><table border='1' >"
		   
		   for(let r = 0; r < 5; r++)
			   {
			   s += "<tr>"
			   for(let c = 0; c < 5; c++)
				   {
				   let color = trianglesCircleColor_hex[r*5 + c];
				   s += "<td onClick='if(changeToColorTrianglesCircle(\""+color+"\")) event.stopPropagation()' style='cursor:pointer;width:3em;height:3em;background-color:"+color+"'> &nbsp;</td>"
				   }
			   s += "</tr>"	   
			   }
		   
		   s += "</table>"
		     + "</nobr><br></div>"

	$(element).html(s).show()

}
//---------------------------------------
function CTXtriangle(c, bkColor, color, x1, y1, x2, y2, x3, y3)
{
c.beginPath();
c.moveTo(x1, y1);
c.lineTo(x2, y2);
c.lineTo(x3, y3);
c.closePath();

if(bkColor !== undefined)
	{
	c.fillStyle = bkColor;
	c.fill();
	}

if(color !== undefined)
{
c.lineWidth = 2;
c.strokeStyle = color;
c.stroke();
}
}
//---------------------------------------------
function addTextToReceiveBox(selector, html, selectorColorYellow)
{
if(selectorColorYellow)
	$(selectorColorYellow).css("backgroundColor","#e75480")
let arr = $(selector)
arr[0].insertAdjacentHTML("beforeend", html)
arr.stop().animate(({scrollTop: arr[0].scrollHeight}))

}
//------------------------------------------------
function handleErrorForPeers(error) 
{
console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}
//-------------------------------------------
function showThisSelectorTopBar(selector)
{
if(lastSelectorPeersTopBar == "#topMenuChoicesPeers" && selector != "#topMenuChoicesPeers")
	$("#topMenuChoicesPeers").slideUp(500)
else if(lastSelectorPeersTopBar == "#selectorPeersTD" && selector != "#selectorPeersTD")
	$("#selectorPeersTD").slideUp(500)
else if(lastSelectorPeersTopBar == "#topMenuQuestionsPeers" && selector != "#topMenuQuestionsPeers")
	$("#topMenuQuestionsPeers").slideUp(500)
else if(lastSelectorPeersTopBar == "#topMenuQuestionsForOthers" && selector != "#topMenuQuestionsForOthers")
	$("#topMenuQuestionsForOthers").slideUp(500)
else if(lastSelectorPeersTopBar == "#topMenuGeneralUseMyWebRTChub" && selector != "#topMenuGeneralUseMyWebRTChub")
	$("#topMenuGeneralUseMyWebRTChub").slideUp(500)
	

if(selector)
	{
	$("#topMenuRelativeFitContent").css("display", "inline-table")
	$(selector).slideDown(500)
	}
else
	setTimeout(function(){$("#topMenuRelativeFitContent").hide()}, 500)
	
lastSelectorPeersTopBar = selector
recomputeScrollElementSize()
}
//--------------------------------------------------
function buttonSendChatPeers(e)
{
let arr = $("#chatSendToPeers")
let s = replaceAll(replaceAll(arr.val(), '\n', ""), '\r',"");
if(s != "") 
  {
	arr.show()
	myWebRTChub.sendChatText($("#selectorOfWHoToSendChat").val(), arr.val())
	arr.val("")
  }
  
}
//---------------------------------------------
function leavingDIVwithPeersWebRTChub(meetingUUID)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)

if(!meetObj || isIn3D || meetObj.alreadyLeftDIVwithPeersWebRTChub || numMeetingsGlobal == 0)
	return
meetObj.alreadyLeftDIVwithPeersWebRTChub = true	
	
beforeLeavingCorner = lastActivateCorner
showTopBar("")	
	
if(meetingsUUIDtoObject.size === 1) //if many then use meetings divs
{
$("#mywebrtc_buttonPlusMinusNOBR").hide()
	
$("#cellForExtraElementsOutsideMyWebRTChub").show()
$("#showMeetingLinksTD").hide()

if(firstTimeLeavingDIVwithPeersWebRTChub)
	{
	showMessageOnSOSforDuration("<table><tr><td>"+ TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[34]) +"</td><td> &nbsp; &nbsp; </td><td>" + redButtonToReturnToVideoConference + "</td></tr></table>", 3000)
	firstTimeLeavingDIVwithPeersWebRTChub = false
	}
}
	
/*let arr = $(".all_webrtc_DIV_videoReceive")
for(let i = 0; i <arr.length; i++)
	myWebRTChub.addOrRemoveFromMainScreen(undefined, arr[i].meetingUUID,"#" + arr[i].id, true)
*/	
if(!meetObj.notYetUsable)
  myWebRTChub.addOrRemoveFromMainScreen(undefined, meetingUUID, "SHOW_MAIN_IN_SIDE_PANEL")


}
//---------------------------------------------
function enteringDIVwithPeersWebRTChub(meetingUUID, newID)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)
if(isIn3D || !meetObj.alreadyLeftDIVwithPeersWebRTChub || numMeetingsGlobal == 0)
	return

meetObj.alreadyLeftDIVwithPeersWebRTChub = false	
$("#mywebrtc_buttonPlusMinusNOBR").show()
$("#cellForExtraElementsOutsideMyWebRTChub").hide()
$("#showMeetingLinksTD").show()

if(!meetObj.notYetUsable)
	myWebRTChub.addOrRemoveFromMainScreen(undefined, meetingUUID, "SHOW_MAIN_IN_MAIN")

$("#videoReceivingWhenOnOtherDIVs").hide()

resizeREALLY()

}
//---------------------------------------------
function expandMoreNotLessViewingQuestionFromOther(moreNotLess)
{
	showHideSelector("#expandLessViewingQuestionFromOther", moreNotLess)
	showHideSelector("#expandMoreViewingQuestionFromOther", !moreNotLess)
	
	if(moreNotLess)
		$("#questionThatIscurrentlyBeingAnsweredTo").slideDown()
	else
		$("#questionThatIscurrentlyBeingAnsweredTo").slideUp()
	
}
//---------------------------------------------
function showTopBar(option = "", option2, toggleShowHide, localUserUUID) //called after accessing cameras
{
	
if(!alreadyCreatedPeersTopBar)
{
	let butonClose = "<button class='imageCell' onClick='showTopBar(\"\")'><b style='color:#800'>X</b></button>"
	
	addTopBarToDiv("webrtchub_main", " ")
		
	alreadyCreatedPeersTopBar = true
	document.body.insertAdjacentHTML("afterbegin",														//z-index > container2 (20000)
    "<div id='topMenuRelativeFitContent' style='display:none;position:fixed; pointer-events:none;z-index: 100000; top:0; bottom: 0;left: 0;width: 100%;text-align: center;'>"
		+"<div id='topMenuRelativeFitContentWithScroll' onClick='showTopBar(\"\")' style='display:inline-grid;padding:0.5em;background-color:#ffd;overflow-y:auto;pointer-events:all;max-height:"+windowHeight()+"px'>"	 //inline-grid does not occupy all width and show vertical scroll bar
			+ "<div onClick='event.stopPropagation()' style='display:inline-table;background-color:#fff;border:1px solid #000'>"		

	+"<div id='topMenuChoicesPeers' style='display:none'>"
        	+ "<button onClick=';showTopBar(\"enumerateDevices\")'> AV setup </button>"
        	+ " &nbsp; <button onClick='if(confirm(\"SWITCH OFF OTHERS MICROPHONES?\")) myWebRTChub.sendCommandToPeers(\"\",\"MIC_OFF\")' style='color:#800'> "+TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[12])+" </button>"
        	+ " &nbsp; <button onClick='landingPageAll()' style='color:#d30080'><b>Umniverse</b></button>"
    + "</div>"
    
    //NEEDED DIV for slideUp slideDown ?
 	+"<div id='selectorPeersTD' style='display:none'>"
	    + "<table onClick='showTopBar(\"\", undefined, true)' style='background-color:#ffa'>"
	    + "<tr id='rowIndicatingNoCameraAccessPeersWebRTC'><td style='color:#800'>"+ TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[13]) +"</td><td></td></tr>"
		+ "<tr><td><select onClick='event.stopPropagation()' id='videoSourcePeers' style='width:90%;max-width:400px'></select></td></tr>"
		+ "<tr><td><select onClick='event.stopPropagation()' id='audioSourcePeers' style='width:90%;max-width:400px'></select></td></tr>"
		+ "<tr><td><select onClick='event.stopPropagation()' id='audioOutputPeers' style='width:90%;max-width:400px'></select></td></tr>"
	    + "<tr><td>"
	    		+ "<button class='save' id='buttonToUpdateInputDevices' onClick='myWebRTChub.addGlobalAudioVideoStream(undefined, true, $(\"#videoSourcePeers\").val(), undefined, undefined, $(\"#audioSourcePeers\").val(), localUserButtonToUpdateInputDevicesUUID)' style='display:none'>"+ TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[15]) +"</button>"
	    		+ " &nbsp; <button onClick='event.stopPropagation();myWebRTChubEnumerateDevices()'>"+ TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[23]) +"</button>"
	    + "</td></tr>"
		+ "</table>"
	+ "</div>"	

    //NEEDED DIV for slideUp slideDown ?
    + "<div id='topMenuQuestionsPeers' style='display:none'>"
    + "<table><tr><td class='imageCell'> &nbsp; <img src='"+ cdniverse +"images/talkisi/question_mark.svg' style='height:1.5em'> &nbsp;" 
	+ "</td><td>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[18]) + " <b class='username_question_of'></b>"
	+ "</td><td> &nbsp;</td><td style='cursor:pointer'><img id='expandLessViewingQuestionFromOther' onClick='expandMoreNotLessViewingQuestionFromOther(false)' src='"+cdniverse + "images/expand_less-black-18dp.svg' style='height:1.2em'>"
		     + "<img  id='expandMoreViewingQuestionFromOther' onClick='expandMoreNotLessViewingQuestionFromOther(true)' src='"+cdniverse + "images/expand_more-black-18dp.svg' style='display:none;height:1.2em'>"
	+ "</td><td> &nbsp;</td><td onclick='showTopBar()'><b style='color:#800;cursor:pointer'> &nbsp; X &nbsp; </b>"
	+ "</td></tr></table>"
    + "<br><div id='questionThatIscurrentlyBeingAnsweredTo'></div>"
    + "</div>"
 	
    //NEEDED DIV for slideUp slideDown ?
    + "<div id='topMenuQuestionsForOthers'  style='display:none'>"
    + "</div>"

    //NEEDED DIV for slideUp slideDown ?
    + "<div id='topMenuGeneralUseMyWebRTChub'  style='display:none'>"
    + "</div>"

    + "</div></div></div>"  //absolute
 	
    )
	
	  audioInputSelectPeers = $('#audioSourcePeers')[0]
	  audioOutputSelectPeers = $('#audioOutputPeers')[0]
	  videoSelectPeers = $('#videoSourcePeers')[0]
	  selectorsPeers = [audioInputSelectPeers, audioOutputSelectPeers, videoSelectPeers]

}

let selector


switch(option)
{
case "menu" : 
	selector = "#topMenuChoicesPeers"
	break
case "enumerateDevices": 
	  showNotHideSelector("#rowIndicatingNoCameraAccessPeersWebRTC", meetObjActive.globalEmptyMediaStream && videoStreamToCopyToCanvas.size == 0)
	  $(".selectorsAcessPeers").hide()
	  showNotHideSelector("#buttonToUpdateInputDevices", meetObjActive.globalEmptyMediaStream)
	  myWebRTChubEnumerateDevices(localUserUUID)
	selector = "#selectorPeersTD";
	break
case "topQuestion":
	let o = option2
	oWhoseQuestionIsBeingShown = o
	$(".username_"+o.meetingWithUUID).html(o.username)
	questionsControlCenterPOINTER("DRAW_ON_TOP_QUESTION_FROM_OTHERS", o)
	selector = "#topMenuQuestionsPeers"
	myWebRTChub.sendCommandToPeers(o, "TOP_QUESTION_SHOWN", o.meetingUUID + "_" + myUUID(meetObjActive) + " " + o.questionFromUser.questionUUID)
	break
case "questionToOthers":
	questionsControlCenterPOINTER("QUESTION_TO_OTHER", option2)
	selector = "#topMenuQuestionsForOthers"
	break
default: selector = option || ""
}

if(toggleShowHide)
	{
	if($(selector).is(":visible"))
		selector = ""
	}


	
showThisSelectorTopBar(selector)


if(selector != "#topMenuQuestionsPeers")
  {
	if(lastSelectorChosenInShowTopBar == "#topMenuQuestionsPeers")
	  myWebRTChub.sendCommandToPeers(oWhoseQuestionIsBeingShown, "TOP_QUESTION_HIDDEN", oWhoseQuestionIsBeingShown.meetingUUID + "_" + myUUID(meetObjActive) + " " + oWhoseQuestionIsBeingShown.questionFromUser.questionUUID)
	oWhoseQuestionIsBeingShown = undefined
  }

  
if(selector && selector.length > 9)
	lastSelectorChosenInShowTopBar = selector

lastSelectorChosenInShowTopBar == selector
	
recomputeScrollElementSize()

}
//-------------------------------------------
function myWebRTChubEnumerateDevices(localUserUUID)
{
localUserButtonToUpdateInputDevicesUUID = localUserUUID	
if(!navigator.mediaDevices)	
	alreadyEnumeratedDevices = true
	
if(!alreadyEnumeratedDevices)	
 navigator.mediaDevices.ondevicechange = function() 
  {
	
  navigator.mediaDevices.enumerateDevices()  //chrome about:flags to allow insecure local url https://github.com/jmcker/WebRTC-Audio-Stream-Example/issues/2
    .then(function(devices) 
    {
	  gotDevicesForPeers(devices, $("#audioSourcePeers")[0], false, $("#videoSourcePeers")[0], true)
	  myWebRTChub.toggleSecondCameraShare(undefined, lastInitialVideoSelector, lastAutoSelectFirst, true)
	 
	  let devices_original = []
	  for(let i = devices.length - 1; i >= 0; i--)
	  	{
		let device = devices[i]
		devices_original.push(device)
		if(myWebRTChubEnumerateDevices_previous)
	  	   for(let p = 0; p < myWebRTChubEnumerateDevices_previous.length; p++)
			 if(myWebRTChubEnumerateDevices_previous[p].deviceId == device.deviceId)
				{
				devices.splice(i, 1)
				break
				}
		}
		
	  let myWebRTChubIdToDevices = []
	  for(let [uuid, localUser] of localUsersUUIDtoObject)
	   {
	    for(let i = 0; i < devices.length; i++)
		 {
			let device = devices[i]
			let key = device.deviceId + " " + device.kind
			myWebRTChubIdToDevices[key] = device
	   		if(previousWebRTChubIdToDevices && !previousWebRTChubIdToDevices[key])
			  {
			  if(localUser.deviceIDvideoOrigStream == device.deviceId && device.kind == "videoinput")
			  	localUser.reconnectDeviceVideo = device
			  else  if(device.kind == "audioinput")
			  		if(localUser.deviceIDaudioOrigStream == device.deviceId
			     		|| (localUser.deviceIDaudioOrigStream == "default" && localUser.reconnectDeviceVideo && localUser.reconnectDeviceVideo.label == device.label))
			     		localUser.reconnectDeviceAudio = device
			  }
		  }
		  if(localUser.reconnectDeviceVideo && localUser.reconnectDeviceAudio)
				{
				myWebRTChub.reconnectVideoAudioOfUser(localUser, localUser.reconnectDeviceVideo, localUser.reconnectDeviceAudio)
				localUser.reconnectDeviceVideo = undefined
				localUser.reconnectDeviceAudio = undefined	
				}
		  else if(localUser.reconnectDeviceVideo && !localUser.deviceIDaudioOrigStream)
				{
				myWebRTChub.reconnectVideoOfUser(localUser, localUser.reconnectDeviceVideo)
				localUser.reconnectDeviceVideo = undefined	
				}
		  else if(localUser.reconnectDeviceAudio && !localUser.deviceIDvideoOrigStream)
				{
				myWebRTChub.reconnectAudioOfUser(localUser, localUser.reconnectDeviceAudio)
				localUser.reconnectDeviceAudio = undefined	
				}
		}
	   previousWebRTChubIdToDevices = myWebRTChubIdToDevices
	   myWebRTChubEnumerateDevices_previous = devices_original
    })

}
	alreadyEnumeratedDevices = true
	navigator.mediaDevices.enumerateDevices().then(gotDevicesForPeers).catch(handleErrorForPeers);
}
//-------------------------------------------
function gotDevicesForPeers(deviceInfos
		, audioInputSelectPeersParam = audioInputSelectPeers
		, audioOutputSelectPeersParam = audioOutputSelectPeers
		, videoSelectPeersParam = videoSelectPeers
		, doNotInsertFirst
		)
{
  if(!deviceInfos)
	deviceInfos = [...lastDeviceInfos] //copy array
  else
    lastDeviceInfos = [...deviceInfos] //copy array
	
  // Handles being called several times to update labels. Preserve values.
  const values = selectorsPeers.map(select => select.value);
  selectorsPeers.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  
  videoIDsWebRTChub = []
  
  let microphones = 0
  let speakers = 0
  let videos = 0

  let groupIDs = []

  //ONLY LISTS ALL WITH NAMES AFTER ALLOW CAMERA USE!!!!!
  for (let i = 0; i < deviceInfos.length; i++) 
  {
    const deviceInfo = deviceInfos[i]
	const option = document.createElement('option')
    option.value = deviceInfo.deviceId
    option.groupId = deviceInfo.groupId
	switch(deviceInfo.kind)
    {
    case 'audioinput':
      let already = groupIDs[deviceInfo.groupId]
	  if(already )
		{
		if(deviceInfo.deviceId.length <= already.deviceId.length)
			continue //avoids repeating microphones
		if(audioInputSelectPeersParam)
			audioInputSelectPeersParam.removeChild(already.option)
		}
	  groupIDs[deviceInfo.groupId] = deviceInfo
	  deviceInfo.option = option
      option.text = deviceInfo.label || `microphone ${audioInputSelectPeers.length + 1}`;
      if(audioInputSelectPeersParam)
	  	audioInputSelectPeersParam.appendChild(option)
      microphones++
      break;
    case 'audiooutput':
      option.text = deviceInfo.label || `speaker ${audioOutputSelectPeers.length + 1}`;
      if(audioOutputSelectPeersParam)
		audioOutputSelectPeersParam.appendChild(option)
      speakers++
      break
    case 'videoinput':
      option.text = deviceInfo.label || `camera ${videoSelectPeers.length + 1}`;
	  if(videoSelectPeersParam)
      	videoSelectPeersParam.appendChild(option)
      videoIDsWebRTChub.push(deviceInfo.deviceId)
      videos++
      break;
    default:
      console.log('Some other kind of source/device: ', deviceInfo)
    }
  }
  
if(!doNotInsertFirst)
{
  audioInputSelectPeersParam.insertAdjacentHTML("afterbegin","<option value='-1'>" +microphones+ " microphones</option")	
  audioOutputSelectPeersParam.insertAdjacentHTML("afterbegin","<option value='-1'>" +speakers+ " speakers</option")	
  videoSelectPeersParam.insertAdjacentHTML("afterbegin","<option value='-1'>" +videos+ " cameras</option")

  $("#videoSourcePeers")[0].value = lastIDofVideoDevicePeers || -1
  $("#audioSourcePeers")[0].value = lastIDofAudioDevicePeers || -1
  $("#audioOutputPeers")[0].value = lastIDofAudioOutputPeers || -1
}  

if(afterGotDevicesForPeers)
{
  let h = afterGotDevicesForPeers
  afterGotDevicesForPeers = undefined
  eval(h)
}
  
}	
//-------------------------------------------	
function newSimplePeersObject(selector, meetingUUID) 
{
let o = simplePeersObjects.get(selector)
if(!o)
{
o = new SimplePeersObject()
o.peer = undefined 
o.meetingUUID = meetingUUID
o.chatSendText = ""
o.chatReceivedText = ""
o.signalData = ""
o.uuid = generateUUID()
o.privateLinkFromUser = ""
o.privateQuestionFromUser = ""
o.cameraMuted = []
o.microphoneMuted = []
o.askForTranslateLanguage = new Set()

simplePeersObjects.set(selector, o)

let meetObj = meetingsUUIDtoObject.get(meetingUUID)
meetObj.simplePeersObjects.set(o.uuid, o)

o.isSpeaking = false
}

return o
}
//---------------------------------------------------------
function simplePeersObjectsOfMeetingFromParticipantUUID(meetingUUID, meetingWithUUID)
{
for(let [key, o] of simplePeersObjects)	
  if(o.meetingUUID == meetingUUID && o.meetingWithUUID == meetingWithUUID)
	return o
}
//---------------------------------------------------------
function treatCommandReceived(o, command)
{
//comes from data channel so it MUST be for this o

let meetingUUID = o.meetingUUID
let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	
let pos = command.indexOf(' ')
pos = command.indexOf(' ')
if(pos == -1)
	pos = command.length
parameters = decodeURIComponent(command.slice(pos + 1))
command = command.slice(0, pos)

let arr
let pos2
 
let joinMineUUID 
let invitedToMeetingUUID
let fullLink
let localUserInvited
let uniqueUUID
let object3d
let divName

switch(command)
{
case "CLOSE" : 
	otherPeerRemovedUser(o.meetingWithUUID)
		break
case "MIC_OFF" : myWebRTChub.meetingsMicrophoneMuteNotUnmute(undefined, true); break
case "DIV_REFRESH": peersShowOrRefreshDiv(o,parameters); break
case "COMMAND_FOR_REMOTE": if(typeof myRemoteUmniverse === "object")
								myRemoteUmniverse.commandByMeeting(parameters)
						   break
case "VIDEO_ROTATE": o.video_rotated_parameters =  parameters//now it is rotated at the origin myWebRTChub.rotateVideoGlobalPeers("#videoReceive_"+o.uuid, parameters); 
	  break
case "VIDEO_ROUNDED": o.circlePercentage = parameters; break
case "SWITCH_VIDEO_TRACK_TO": alert(parameters); break
case "MY_MIC":
		pos = parameters.indexOf(' ')
		let fromUserUUID = parameters.slice(0, pos)
		let p = simplePeersObjects.get("#" + meetingUUID + "_" + fromUserUUID)
		if(!p)
		   break
		let offOnSpeak = parameters.slice(pos + 1)
		showHideSelector("#micReceived_"+p.uuid, offOnSpeak == "OFF")
		if(p.isSpeaking != (offOnSpeak == "SPEAK"))
		  {
			p.isSpeaking = offOnSpeak == "SPEAK"
			myWebRTChub.refreshOrdenateSenderOrReceiver(meetObj)
			p.isSpeakingTimeChange = new Date().getTime()
		  }
		$("#videoReceive_" + p.uuid).css("border", "2px solid " + (p.isSpeaking ? "#f00" : "#000"))
		break
case "MY_EMOTION": 
	 if(false) //in the future will be for PERSONAL icons to this user
	 {
	 arr = $("#videoReceive_"+o.uuid+"EMOTION")
	 if(parameters == "")
		 arr.hide()
	  else
		 arr.show()
	  arr[0].src = parameters
	 }
	  break
case "MY_ICON": 
	 if(false) //in the future will be for PERSONAL icons to this user
	 {
	 arr = $("#videoReceive_"+o.uuid+"ICON")
	 if(parameters == "")
		 arr.hide()
	  else
		 arr.show()
	  arr[0].src = parameters
	 }
	  break
case "MY_QUESTION": 
case "TOP_QUESTION_SHOWN": 
case "TOP_QUESTION_HIDDEN":
case "TOP_QUESTION_ANSWER_CHANGED":
	  questionsControlCenterPOINTER(command, o, parameters)
	  break
case "MY_URL": 
	 if(false) //in the future will be for PERSONAL icons to this user
	 {
	 arr = $("#videoReceive_"+o.uuid+"URL")
	 if(parameters == "")
		 arr.hide()
	 else
		 arr.show()
	 }
	 o.linkFromUser = parameters
	 break
case "SCREEN_MODE": otherPeerChangedScreenMode(o, parameters, true)
     break
case "USERNAME": o.username = parameters
				 pos2 = parameters.indexOf(' ')
				 let o2 = meetingWithUUIDtoPeersObjects.get(parameters.slice(0, pos2))
				 let newname = parameters.slice(pos2 + 1);
				 $(".username_"+o2.meetingWithUUID).html(newname)
				 $(".username_title_"+o2.meetingWithUUID).prop("title", newname)
     break
case "REMOVE_PEER_USER": otherPeerRemovedUser(parameters)
     break
case "CAPTION": otherPeerChangedCaption(0, parameters)
     break
case "CAPTION_ANSWER": myWebRTChub.otherPeerAnsweredToCaption(o, parameters)
     break
case "ASK_TRANSLATE_LANGUAGE": myWebRTChub.otherPeerAsksForTranslateLanguage(o, parameters)
	 break
case "MY_IS_IN_3D":
	myWebRTChub.otherChangedOrNotTo3Dconference(o, parameters == "true")
	break
case "INSERT_HTML":
        pos = parameters.indexOf(" ")
 		let selector = parameters.slice(0, pos)
 		let html = parameters.slice(pos + 1)
		let element = getPopup1(selector)

		let close = "dismissPopup1(\""+ selector +"\")"	
		html += "<br><br><button onClick='myWebRTChub.addExtraInfoToMeeting(\"" + meetingUUID + "\",`" + replaceCharsForInsideQuotes(html) + "`,\""+selector+"\");"+close+"'>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[54]) + " <b>" + meetingsUUIDtoObject.get(meetingUUID).name  + "</b></button> &nbsp; <button onClick='"+close+"'><b style='color:#f00'>X</b></button>"
		
		$(element).html(html)
	break
case "ADDED_EXTRA_USER": //to join existing user from that peer
    {
	let pos = parameters.indexOf(' ')
	let meetingUUIDparam = parameters.slice(0, pos)
	pos++
	pos2 = parameters.indexOf(' ', pos)
	let localUserUUIDparam = parameters.slice(pos, pos2)
	let stringMySettingsParam = parameters.slice(pos2 + 1)
	myWebRTChub.addExtraUser(meetingUUIDparam, localUserUUIDparam, stringMySettingsParam)
	break
	}
case "YOUTUBE_SHARE":
	loadScripts([compiledOrNotPathJS + "/static/tapalife_youtube"+ compiledOrNotJS +".js","https://www.youtube.com/iframe_api"], undefined, undefined, undefined, function(){tapalifeYouTube.processReceivedFromPeer(meetingUUID, o, parameters)})
    break
case "YOUTUBE_NOTSHARE": 
	if(typeof tapalifeYouTube === "object")
		tapalifeYouTube.removePlayer(parameters)
  break;
case "YOUTUBE_STATE":
    loadScripts([compiledOrNotPathJS + "/static/tapalife_youtube"+ compiledOrNotJS +".js", "https://www.youtube.com/iframe_api"], undefined, undefined, undefined, function(){tapalifeYouTube.processReceivedFromPeer(meetingUUID, o, parameters, true)})
  break
case "YOUTUBE_SYNC_ME_BACK":
    if(typeof youtubePlayers === "object")
    {
    let player = youtubePlayers.get(parameters)
  	myWebRTChub.sendCommandToPeers(o, "YOUTUBE_STATE" , tapalifeYouTube.stringToSharePlayer(player))
    }
    break
case  "INVITE_TO_MEETING": 
   pos = parameters.indexOf(" ")
   joinMineUUID = parameters.slice(0, pos)
   parameters = parameters.slice(pos +1)
   pos = parameters.indexOf(" ")
   invitedToMeetingUUID = parameters.slice(0, pos)
   fullLink = decodeURIComponent(parameters.slice(pos + 1))
   localUserInvited = localUsersUUIDtoObject.get(joinMineUUID)

  sosConfirm(o.username + " -> " + localUserInvited.username + " : accept meeting invitation?", 
	  function()
	  {
	  meetingUUIDtoLocalUserInvited.set(invitedToMeetingUUID, localUserInvited)
	  myWebRTChub.treatNewMeetingLink(fullLink)
	  })
    break
case "INVITE_TO_PRIVATE_MEETING":
   pos = parameters.indexOf(" ")
   joinMineUUID = parameters.slice(0, pos)
   parameters = parameters.slice(pos + 1)
   pos = parameters.indexOf(" ")
   invitedToMeetingUUID = parameters.slice(0, pos)
   localUserThatInvited = parameters.slice(pos + 1)
   localUserInvited = localUsersUUIDtoObject.get(joinMineUUID)
   fullLink = "?meet=" + invitedToMeetingUUID

  sosConfirm(o.username + " -> " + localUserInvited.username + " : accept private meeting invitation?",
     function()
	  {
	  meetingUUIDtoLocalUserInvited.set(invitedToMeetingUUID, localUserInvited)
	  let peer = meetingWithUUIDtoPeersObjects.get(localUserThatInvited)
	  let imageURL = videoToImageURL(peer.videoReceive)
	  myWebRTChub.treatNewMeetingLink(fullLink, undefined, imageURL)
	  myWebRTChub.sendCommandToPeers(o, "ACCEPTED_PRIVATE_MEETING", invitedToMeetingUUID)
	  })
  break
case "ACCEPTED_PRIVATE_MEETING":
  invitedToMeetingUUID = parameters
  let localUser =  localUsersUUIDtoObject.get(allPrivateMeetingUUID[invitedToMeetingUUID])
  if(localUser) //security
  {
  fullLink = "?meet=" + invitedToMeetingUUID
  myWebRTChub.treatNewMeetingLink(fullLink, localUser.username, allPrivateMeetingUUIDimage[invitedToMeetingUUID])
  }
  break
case "GET_DIV_UNIQUE_UUID_THIS_DATA":
   if(UseFirebaseToShareObjectsNotMessages)
	 break
    object3d = meetObj.mapFromUniqueUUIDtoObject3Ddivs.get(parameters)
	divName = getDivNameFromObject3d(object3d)
	const basicsAndS = getDataOfThisDivName(divName, object3d)
    if(basicsAndS)
	{
	  let result = basicsAndS.basics + " " + basicsAndS.s	
      myWebRTChub.sendCommandToPeers(o, "ADDED_DIV_TO_PLACE", object3d.uniqueUUID + " " + divName + " " + result)
	}
   break
case  "ADDED_DIV_TO_PLACE":
   if(UseFirebaseToShareObjectsNotMessages)
	 break
    myWebRTChub.processNewDivObject(meetingUUID, parameters, o)
  break
case "REMOVED_DIV_FROM_PLACE":
   if(UseFirebaseToShareObjectsNotMessages)
	 break

        if(UseFirebaseToShareObjectsNotMessages)
			return
		if(!meetObj.mapFromUniqueUUIDtoObject3Ddivs)
			break
		object3d = meetObj.mapFromUniqueUUIDtoObject3Ddivs.get(parameters)
		if(!object3d)
			break
			
		divName = getDivNameFromObject3d(object3d)
		if(divName)
			closeCurrentDiv(divName)	
	  
		meetObj.mapFromUniqueUUIDtoObject3Ddivs.delete(parameters)
		break 
default: 
	for(let starting in receiversMessagesStartingWith)
		if(command.startsWith(starting))
			{
			eval("tempFunctionToCall = " + receiversMessagesStartingWith[starting])
			tempFunctionToCall(command, parameters, o);
			}
	
	//do not alert for older versions  may not know new commands  alert("COMMAND NOT KNOWN:" + command)	
}
}
//---------------------------------------------------------
function checkNewObject3dOrDivNameObject3d(meetingUUID, object3DuniqueUUID, divName, object3d)
{
    let meetObj = meetingsUUIDtoObject.get(meetingUUID)

	let data = loaded3Dinfo.get(divName)
	if(!data || meetObj.mapFromUniqueUUIDtoObject3Ddivs.get(data.uniqueUUID) === undefined)
	  return
	//loaded3Dinfo.delete(data.divName)
	object3d.name = data.name

	object3d.uniqueUUID = data.uniqueUUID
	meetObj.mapFromUniqueUUIDtoObject3Ddivs.set(object3d.uniqueUUID, object3d) //indicates it is waiting	  
	
	meetObj.numWaitingAtMapCheckNewObject--
	if(!meetObj.numWaitingAtMapCheckNewObject)
		mapCheckNewObject3dWithUniqueUUIDorDivName.delete(meetObj.meetingUUID)


	myWebRTChub.refreshInformationAboutDIVSinMeeting(meetingUUID)

	arrangeDivsInThisPlace(undefined, data.IDSplace, true)

}
//---------------------------------------------------------
function otherPeerChangedScreenMode(o, parameters, callResize)
{
	let pos = parameters.indexOf(' ')
	let meetingWithUUID = parameters.slice(0, pos)
	o = meetingWithUUIDtoPeersObjects.get(meetingWithUUID) || o //changes to specific o !!!

	parameters = parameters.slice(pos + 1)

	pos = parameters.indexOf(' ')
	if(pos != -1)
		o.screenMode = parameters.slice(0, pos)
	pos++
	let pos2 = parameters.indexOf(' ', pos)
	o.screenModeDx = parseInt(parameters.slice(pos, pos2))
	pos2++
	pos = parameters.indexOf(' ', pos2)
	o.screenModeDy = parseInt(parameters.slice(pos2, pos))
	o.videoTrackID = parameters.slice(pos + 1)
	
	let video = $("#videoReceive_" + o.uuid)
	video.videoWidth = o.screenModeDx
	video.videoHeight = o.screenModeDy
	
	if(callResize)
		{
		myWebRTChub.resizeElementsWithPeersParticipant(undefined, undefined, true)
		for (let [letter, videoStream] of videoStreamToCopyToCanvas)	
		  if(videoStream.videoFromThisPeer == o) 
			{
			videoStream.screenModeDx = o.screenModeDx
			videoStream.screenModeDy = o.screenModeDy
			myWebRTChub.fitManyCameraRects(videoStream)
			myWebRTChub.refreshManageLocalUsersToSend()
			}
		}
	for(let starting in receiversMessagesStartingWith)
	{
	eval("tempFunctionToCall = " + receiversMessagesStartingWith[starting])
	tempFunctionToCall("SCREEN_MODE", parameters, o);
	}

}
//---------------------------------------------------------
function otherPeerChangedCaption(oIgnore, parameters)
{

let pos = parameters.indexOf(' ')
let oUUID = parameters.slice(0, pos)
let o = meetingWithUUIDtoPeersObjects.get(oUUID)
	
let lastPos = pos + 1
pos = parameters.indexOf(' ', lastPos)
let counterUUID = parameters.slice(lastPos, pos)
lastPos = pos + 1

pos = parameters.indexOf(' ', lastPos)
let numTranslationsMissing = parseInt(parameters.slice(lastPos, pos))
lastPos = pos + 1

if(numTranslationsMissing > 0)
	return //other message with all translated will be received

if(o.captionInWideScreen === undefined)
   o.captionInWideScreen = initializationOfCaptionInWideScreen
let divCaptionJQ = $("#caption_receive_" + (o.captionInWideScreen ? "WIDESCREEN": oUUID))

let extra = ""

o.captionsActiveLanguage = new Set()
divCaptionJQ.html("")

o.lastCounterOfCaption = counterUUID

const globalMicWasActive = peersMicrophoneActive
let mutedMicrophone = false

let answerToCaption = ""

let textOriginal
let languageOriginal

while(lastPos < parameters.length)
{
const finalOrTemp = parameters.charAt(lastPos)
lastPos++

pos = parameters.indexOf(' ', lastPos)
let language = parameters.slice(lastPos, pos)
lastPos = pos + 1
pos = parameters.indexOf(' ', lastPos)
let numChars = parseInt(parameters.slice(lastPos, pos))
lastPos = pos + 1

let text = 	parameters.slice(lastPos,  lastPos + numChars)
lastPos += numChars

if(textOriginal === undefined)
  textOriginal = text
if(languageOriginal === undefined)
  languageOriginal = language

  if(o.captionsActiveLanguageSelected === undefined 
    || o.captionsActiveLanguageSelected === "ALL_LANGUAGES"
	|| o.captionsActiveLanguageSelected === language)
 	{
	
	answerToCaption = "Y"+language + " "

	if(text)
		{
		if(o.captionsSpeak)
			{
			if(globalMicWasActive && !mutedMicrophone)
				{
				myWebRTChub.meetingsMicrophoneMuteNotUnmute(undefined, true, undefined, true)
				mutedMicrophone = true
				}
			speakThisMessage(text, language, undefined, globalMicWasActive ? function(){myWebRTChub.meetingsMicrophoneMuteNotUnmute(undefined, false)} : undefined)	
			}
		divCaptionJQ.prepend("<div language='"+language+"' " + attributeWithTranslation("title", dialectToLanguageCounterCodeMAP.get(language)) +" style='margin-top:15px;display:inline-table;width:fit-content;background-color:rgb(192, 192, 192, 0.9);color:#fff'><b style='padding:5px'>" + (!extra && o.captionInWideScreen ? "<i style='color:#444;font-size:70%'>" + o.username + "</i> &nbsp;" : "") +  text.trim() + "</b></div>"
							+ extra)
	    extra = "<br>"
		}//text
	}
	else answerToCaption = "N"+language + " "


if(language === "STOP")
  o.captionsActiveLanguage = undefined
else 
  o.captionsActiveLanguage.add(language)

}//while	


if(textOriginal && languageOriginal !== "STOP")
  myWebRTChub.sendCommandToPeers(o, "CAPTION_ANSWER", o.meetingWithUUID + " " + counterUUID +" " + answerToCaption)

myWebRTChub.updateCaptionReceived(o)

}
//---------------------------------------------------------
function otherPeerRemovedUser(meetingWithUUID)
{
	let o = meetingWithUUIDtoPeersObjects.get(meetingWithUUID)
	if(!o)
	  return false//error?
    let meetObj = meetingsUUIDtoObject.get(o.meetingUUID)
	meetingWithUUIDtoPeersObjects.delete(meetingWithUUID)
	simplePeersObjects.delete(o.selector)
	delete peersSelectorsToUUID[o.selector]
	meetObj.simplePeersObjects.delete(o.uuid)
	myWebRTChub.closeStream(o.videoReceive)
	
	if(o.selector == activeOtherUserSELECTOR && $("#peersControlXYzoomOfOthersCamera").is(":visible"))
       myWebRTChub.activateCorner("")
   
	for(let key in closeInMyWebRTChubOfPeer)
		closeInMyWebRTChubOfPeer[key](o)

    myWebRTChub.updateLanguagesOfferedAndAskedForInMeeting(o.meetingUUID)
	
	for(let [uuid, localUser] of localUsersUUIDtoObject)
		if(localUser.translationsOthersAskedFor)
		{
		  let needsUpdate = false
		  for(let [language, peersThasAskedForLanguage] of localUser.translationsOthersAskedFor)
			{
			if(peersThasAskedForLanguage.delete(meetingWithUUID))
				needsUpdate = true
			}
		  if(needsUpdate)
			myWebRTChub.updateLanguagesOfferedAndAskedFor(uuid)
		}

if(!o.sentCloseToSubPeers)
{
	let video = $("#videoReceive_" + o.uuid)[0]
	if(!video)
	   return false
	   
	//myWebRTChub.closeStream(o.stream)
 
	   
	removeAndEmpty(video.parentNode) //can be on bottom bar on other DIVs
	removeAndEmpty(o.selector)
	o.sentCloseToSubPeers = true
	addTextToReceiveBox("#chatReceivedGlobalPeers", "<p style='width:100%;text-align:center'><b class='username_"+o.meetingWithUUID+"'>" + o.username + "</b><font style='color:#f00'> EXITED</font></p>")
	if(o.objectIDSinUmniverse)
		deleteObjectIndex(o.objectIDSinUmniverse)
	if(o.meetingWithUUID.indexOf("_") == -1)
	  for(let [key, o2] of simplePeersObjects)
        if(o2.meetingWithUUID.startsWith(o.meetingWithUUID + "_"))
          setTimeout(function(){otherPeerRemovedUser(o2.meetingWithUUID)}, 5)

	}

   removeAndEmpty(o.selector)

   if(meetObj && meetObj.optionsObject && meetObj.optionsObject.endMeetingWhenLastUserCloses)
     if($(".elementsWithPeersParticipant_" + o.meetingUUID).length == 0)
		closeThisMeetingID(o.meetingUUID)

	myWebRTChub.showUsersWaitingForHostAcceptance(true)
	
	if(o.videoTrackReceiving)
   		{
		o.videoTrackReceiving.myAlreadyPlaced = false
		}

    myWebRTChub.refreshShowMeetingLinksAndPeers()
	myWebRTChub.close(o)
	
	myWebRTChub.firebaseBroadcastToPossiblePeersNotMoreThan5seconds(o.meetingUUID, o.fromUUID)

  return true
}
//---------------------------------------------------------
function peersShowOrRefreshDiv(o, refresh)
{
let meeting = meetingsUUIDtoObject.get(o.meetingUUID)
   	
if(authorisationsForRequestScreen[o.fromUUID] === true
   || meeting.optionsObject.acceptsPeerScreenCommands)	
		setTimeout(refresh, 10)	
else if(authorisationsForRequestScreen[o.fromUUID] === false)	
	{
	
	}
else
	{
	let closeJS = "dismissPopup1(\"remote_JAVASCRIPT_PERMISSION\")"
	refresh	= replaceCharsForInsideTag(refresh)
		
	let element = getPopup1("remote_JAVASCRIPT_PERMISSION")
	element.style.color = "#000"
	element.style.width = ""
	element.style.height = ""
	element.style.backgroundColor = "#fff"
	element.innerHTML = "<div onClick='"+closeJS+"'><nobr><b class='username_"+o.meetingWithUUID+"' style='color:red'>"+o.username +": "+TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[7])+"</b>" 
		   + "<br><br><table>"
		   		+ "<tr><td><button style='padding:2em;background-color:#800;color:#fff'>"+TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[8])+"</button></td><td><button onClick='"+refresh+"' style='padding:2em;background-color:#080;color:#dfd'>"+TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[9])+"</button></td></tr>"
		   		+ "<tr><td><button onClick='authorisationsForRequestScreen[\""+o.fromUUID+"\"]=false' style='background-color:#fdd;'>"+TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[10])+"</button></td><td><button onClick='authorisationsForRequestScreen[\""+o.fromUUID+"\"]=true;"+refresh+"' style='background-color:#dfd'>"+TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[11])+"</button></td></tr>"
		   + "</table>"
		   + "</nobr><br></div>"
		    
	$(element).show()
	}
}
//---------------------------------------------------------
function closeThisMeetingID(meetingUUID)
{
  let meetObj = meetingsUUIDtoObject.get(meetingUUID)
  if(!meetObj)
  	return

  unregisterThisFirebaseChannel(registerChannelForUUIDpeers[meetingUUID] + "/ALL") 
  unregisterThisFirebaseChannel(registerChannelForUUIDpeers[meetingUUID] + "/DIVS") 
  unregisterThisFirebaseChannel(registerChannelForUUIDpeers[meetingUUID] + "/" +myUUID(meetObj)) 
  myMeetingRegisteredInFirebaseChannels[meetingUUID] = false
	
  if(meetObj.mapFromUniqueUUIDtoObject3Ddivs)
   for (let [uniqueUUID, object3d] of meetObj.mapFromUniqueUUIDtoObject3Ddivs)
	  {
		let divName = mapFromObject3dUniqueUUIDtoDivName.get(uniqueUUID)
		if(divName)
			closeCurrentDiv(divName)
	  }  
	
   if($("#divEmcopassingAll_" + meetingUUID).css("display") == "none")
	  numMeetingsGlobalHidden--

  removeAndEmpty("#buttonsOfEachMeeting_" + meetingUUID)
  removeAndEmpty("#divEmcopassingAll_" + meetingUUID)
  removeAndEmpty(".belongs_to_meeting_" + meetingUUID) //all that must be closed of this meetingUUID
	
  delete peersUUIDtoUserNames[meetingUUID]
  delete myMeetingRegisteredInFirebaseChannels[meetingUUID]

  let map = new Map(localUsersUUIDtoObject)
  for(let [uuid, localUser] of map)
  {
  if(localUser.meetingUUID == meetingUUID)
    myWebRTChub.removeLocalUser(localUser, true)
  }

  removeMeetingFromPlace(meetObj)

//delete peers
let peers = new Map()
for(let [key, o] of simplePeersObjects)
  if(o.meetingUUID == meetingUUID)
  	{
	this.otherPeerRemovedUser(o.meetingWithUUID)
	peers.set(key, o)	  
	}
for(let key in peers)
	simplePeersObjects.delete(key)

myWebRTChub.exit(undefined, peers)

if(activeLocalUser.meetingUUID == meetingUUID)
	myWebRTChub.setActiveLocalUser(myWebRTChub.firstGlobalLocalUser())

cameraCSS3Dchanged = true 

if(meetingUUID == lastMeetingUUIDwaitingForOthers && $("#bottomMenuWaitingForOthers").is(":visible"))
  myWebRTChub.activateCorner()
	   
//at the end not to break other methods
meetingsUUIDtoObject.delete(meetingUUID)
if(!meetObj.notYetUsable)
  numMeetingsGlobal--

removeOneOfTheDIVSbyID(webrtcDivName(meetingUUID), false, true)

for (let [letter, videoStream] of videoStreamToCopyToCanvas)	
  myWebRTChub.closeStreamOfdeviceID(meetingUUID, videoStream.deviceID)


if(numMeetingsGlobal > 0)
     {
	if(activeLocalUser.meetingUUID == meetingUUID)
			myWebRTChub.setActiveLocalUser(firstMeetingObj().firstLocalUser)
	
	 myWebRTChub.refreshManageLocalUsersToSend()
	 myWebRTChub.arrangeBottomBarWithEachMeeting()
	 myWebRTChub.resizeElementsWithPeersParticipant(undefined)
	 }
else
   {
	myWebRTChub.closeManageLocalUsersToSend()
    myWebRTChub.closeShowMeetingLinksAndPeers()
    myWebRTChub.closeMyWebRTCdiv()
    }

myWebRTChub.call_mapOfFunctionCallsWhenMeetingsChange()

}          
//---------------------------------------------------------
function removeMeetingFromPlace(meetObj, futurePlaceIDS = "undefined:151:U")
{
  if(meetObj.numPlace3D === undefined)
	return
  let IDSplace = meetObj.numPlace3D + ":151:U"
  let place = places.get(IDSplace)
  if(!place)
	 return

  removeImageFrom3Dplace(place.IDSplace)
  delete callMoveNotCopyObjectFromNotToPlace[IDSplace]

  let objects = objectsInThisPlace(IDSplace, true, true, futurePlaceIDS)
  for(let i = 0; i < objects.length; i++)
	{
		//already changed to futurePlaceIDS
	}
  placeDefaultOriginalTexts(IDSplace)
}
//---------------------------------------------------------
function myUUID(meetObj)
{
	if(!meetObj)
	  return console.log("ERROR myUUID(meetObj) meetObj NOT DEFINED")
	
	if(false && isFirefox)
		meetObj.uuidForMeetings = "461661b5-c5b1-44c5-acfd-1fdc82a93e1f"
	if(!meetObj.uuidForMeetings)    //Safari is considered earlier
		meetObj.uuidForMeetings =  (isSafari ? "0" : "") + (deltaInitialServerTime + new Date().getTime()) +"_" +generateUUID()
	return meetObj.uuidForMeetings
}
//-----------------------------------------------
function orderTurnServersByIncreasingTimes(a, b)
{
if(a.deltaTime < b.deltaTime)
	return -1	
if(a.deltaTime > b.deltaTime)
	return 1
	
return 0	
}
//-----------------------------------------------
function myWebRTChub_simple_peer(selector, o, meetingUUID, info, RECURSIVE_CALL) 
  {

 const initiateSend = !info 

  o = o || simplePeersObjects.get(selector) || newSimplePeersObject(selector, meetingUUID)

  //if(!RECURSIVE_CALL)
  // umniverseTurnAssistantsResponses.clear()
  
  if(umniverseTurnAssistantsResponses.size == 0)
  {
	retriesToReachUmniverseTurnAssistants++
	
	if(retriesToReachUmniverseTurnAssistants == 5)
		showMessageErrorOnSOSforDuration("CONNECTION TO TURN SERVERS FAILED<br>only Peer-to-Peer connections are possible", 5000) 
	else if(retriesToReachUmniverseTurnAssistants < 5)
	{
	myWebRTChub.reachUmniverseTurnAssistants()
	setTimeout(function(){myWebRTChub_simple_peer(selector, o, meetingUUID, info, true)}, 1000)
	return
	}
  }

  let turnServersOrderedForConnection = []
  for(let [turnAssistant, objTextObj] of umniverseTurnAssistantsResponses)
	try
	{
		if(!objTextObj.obj)
		  objTextObj.obj = JSON.parse(objTextObj.text)
		let infoResult = objTextObj.obj.result	
		let taInfo = {}
//		taInfo.urls = "turn:" + infoResult.serverInfo.ip + (isInLocalhost ? ":3478" : ":5349")  // + "?transport=tcp"
		taInfo.urls = "turn:" + objTextObj.domain + (isInLocalhost ? ":3478" : ":5349")  // + "?transport=tcp"
		if(infoResult.serverInfo.userPassArray)
		{
			if(infoResult.serverInfo.nextIndex == undefined 
				|| infoResult.serverInfo.nextIndex == infoResult.serverInfo.userPassArray.length)	
			  infoResult.serverInfo.nextIndex = 0
			const upa = infoResult.serverInfo.userPassArray[infoResult.serverInfo.nextIndex]
			taInfo.username = upa.username
			taInfo.credential = upa.password
			infoResult.serverInfo.nextIndex++
		}
		
		if(!taInfo.username)
		{
		taInfo.username = infoResult.serverInfo.username
		taInfo.credential = infoResult.serverInfo.password
		}
		taInfo.deltaTime = objTextObj.deltaTime
		if(o.turnServerDistances)
		for(let tsd = 0; tsd < o.turnServerDistances.servers.length; tsd++)
		  {
			let turnServerDistance = o.turnServerDistances.servers[tsd]
			if(objTextObj.clusterNum === turnServerDistance.clusterNum)
				{
				taInfo.deltaTime += turnServerDistance.time
				break
				}
		  }
		if(taInfo.deltaTime == objTextObj.deltaTime) //not found from other peer
			taInfo.deltaTime += 5000  //to make last choice
		turnServersOrderedForConnection.push(taInfo)
	}
	catch(error)
	{
		console.log(error)
	}		
	
	//strange: locally (client localhost:8080) some turn servers who are close (germany & germany2) respond with huge differences in time
	turnServersOrderedForConnection.sort(orderTurnServersByIncreasingTimes)
	if(turnServersOrderedForConnection.length > 2)
	  turnServersOrderedForConnection.length = 2 //only 2 turn servers are used
	for(let tso = 0; tso < turnServersOrderedForConnection.length; tso++)
		delete turnServersOrderedForConnection[tso].deltaTime

    if (onlyUseSTUNservers || turnServersOrderedForConnection.length == 0)
    {
    turnServersOrderedForConnection = []
    turnServersOrderedForConnection.push({urls: 'stun:stun.l.google.com:19302'}) //my COTURN servers also return same info 
    
	//stun:global.stun.twilio.com is not a valid stun or turn URL.
	//turnServersOrderedForConnection.push({urls: 'stun:global.stun.twilio.com:3478?transport=udp'}) //my COTURN servers also return same info
    }
  

  let p
  confirmBeforeUnload = true //to enable exit prevention

  /*different outGoingSignal
  else if(o.peer)
	  return o
  */

  let meetObj = meetingsUUIDtoObject.get(meetingUUID)

						//when Safari problems are solved this should be the opposite?
  if(false && initiateSend != (o.fromUUID > myUUID(meetObj)))
	{
		//consoleLogIfIsInLocalhost("SHOULD NEVER HAPPEN initiateSend = " + initiateSend + " != o.fromUUID > myUUID(meetObj)")
		myWebRTChub_simple_peer(selector, o, meetingUUID)
		//myWebRTChub.firebaseBroadcastToPossiblePeersNotMoreThan5seconds(meetingUUID, o.fromUUID)
		return 
	}
	
  try
  {
	  
   p =  o.peer

   if(p)
	console.log("STRANGE? if(p)")
	
  let uuid = o.uuid
	  
  let outgoingSelector = "#outgoing_" + uuid

  //if(isSafari)
    //$("#soundOfPeerArrived")[0].play()

  if(o.stream) //should never happen
  	  return
  	  
  o.msid = []

   o.globalTracksToSend = []
   for(let track of meetObj.globalTracksToSend)
			o.globalTracksToSend.push(track.clone())	
   o.stream  =  new MediaStream(o.globalTracksToSend) //more flexible 
	

  let origTracks = meetObj.globalTracksToSend
//will be cloned and this way it may save resources and CPU BUT I think it makes peer video blink!!!
 // for(let track of origTracks)
//	track.enabled = false 

  	for(let track of meetObj.globalTracksToSend)
	{
		if(track.kind == "video")
		  track.enabled = peersCameraActive && !meetObj.disabled && meetObj.cameraActive 
		else if(track.kind == "audio")
		  track.enabled = peersMicrophoneActive && !meetObj.disabled && meetObj.microphoneActive 
	}

    let numTrack = 0
  	for(let track of o.globalTracksToSend)
	{
		let localUser = myWebRTChub.localUserOfThisMeetingAndNumTrack(meetingUUID, numTrack)
		if(track.kind == "video")
		  track.enabled = peersCameraActive && !meetObj.disabled && meetObj.cameraActive && (!localUser || (!localUser.cameraMuted && !o.cameraMuted[localUser.uuid]))
		else if(track.kind == "audio")
		  track.enabled = peersMicrophoneActive && !meetObj.disabled && meetObj.microphoneActive && (!localUser || (!localUser.microphoneMuted && !o.microphoneMuted[localUser.uuid]))
		 numTrack++
	}
	
  o.globalTracksOrigToPeerToSend = new Map()
 	
  let matches = 0
  
  let labelsToTracksMap = new Map()
  for(let track of o.globalTracksToSend)
	{
		labelsToTracksMap.set(track.label, track)
	//	track.enabled = true //has already been cloned and origTracks track.enabled = false
	}
	
  if(labelsToTracksMap.size === o.globalTracksToSend.length) //means all labels are different (Chrome, ...)
  	for(let track of origTracks)
	{		
		let gtts = labelsToTracksMap.get(track.label)
		if(gtts)
		{
	  	 o.globalTracksOrigToPeerToSend.set(track.id, gtts.id)
		 track.matched = true	
		 gtts.matched = true
		 matches++
		}
	}
  if(matches < o.globalTracksToSend.length)
  for(let num = 0; num < o.globalTracksToSend.length; num++)
	{
	let num2 = num
	let found = false
	//let settings = o.globalTracksToSend[num].getSettings()
	let canvas = o.globalTracksToSend[num].canvas
	if(canvas !== undefined)
	  for(let n2 = 0; n2 < origTracks.length; n2++)
		if(canvas === origTracks[n2].canvas)
		  {
			origTracks[n2].matched = true
			matches++
			num2 = n2
			found = true
			o.globalTracksToSend[num].matched = true
			break
		  }
    //if not matched then use the same number expecting the order is kept on stream cloning
    if(found || (!origTracks[num2].matched && !o.globalTracksToSend[num].matched)) //so that unmatched do not overlaped matched ones
	  o.globalTracksOrigToPeerToSend.set(origTracks[num2].id, o.globalTracksToSend[num].id)
	}
  if(matches >= maxLocalUsersGlobalPerMeeting - 1) //can be maxLocalUsersGlobalPerMeeting or maxLocalUsersGlobalPerMeeting depending on the first video track
    for(let num = 0; num < o.globalTracksToSend.length; num++)
	 if(!o.globalTracksToSend[num].matched)	
	  for(let n2 = 0; n2 < origTracks.length; n2++)
		if(!origTracks[n2].matched && o.globalTracksToSend[num].kind === origTracks[n2].kind)
		  {
			o.globalTracksOrigToPeerToSend.set(origTracks[n2].id, o.globalTracksToSend[num].id)
		    break
		  }

  //reset orig tracks
  for(let track of origTracks)
	track.matched = false //for next peer

   
	let newSimplePeer = function(){ 
    p = new SimplePeer({
      initiator: initiateSend,
      stream: o.stream,
	  reconnectTimer: 1000,
	  objectMode: true,
//	  sdpTransform: function (sdp) { return sdp },
	  config: { 
		//here goes the manual standard WebRTC configurations
		constraints: {offerToReceiveVideo:true, offerToReceiveAudio:true}, 
		iceTransportPolicy: (onlyUseRelayInWebRTC && isInLocalhost ? "relay" : "all"),  
		iceServers: turnServersOrderedForConnection
/*			   [
				//TEST AT https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
//				{ urls: 'stun:stun.l.google.com:19302' }, 
//				{ urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
            	{
                urls: "turn:nl.passear.me:5349", //3478  5349 TLS 
                username: "freeuser",
                credential: "freepass"
            	}
			/*	,
            	{
                urls: "turn:usa.passear.me:5349", //3478 or 5349 work
                username: "freeuser",
                credential: "freepass"
            	}
			   ] 
			*/
			 },
      

		//config: { iceServers: [{ urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] },
      
	  channelName: "CN_" + generateUUID(),
	  allowHalfTrickle: false, 
      trickle: false //when "true" more careful the functions must be implemented!!!
    })
    
   p.creationTime - new Date().getTime()

   o.peer = p
   o.meetingInitiator = initiateSend
   p.meetingInitiator = initiateSend
  
   p.on('error', function(err) //instead of (err =>)
   {
	   console.log('error', err)
   })
   
   p.on('close', function() {
	   //console.log('WEBRTC close')
	   otherPeerRemovedUser(o.meetingWithUUID)
	   p.destroy()
	   o.peer = undefined
   })

   p.on('signal', function(data) {

		o.signalData = JSON.stringify(data)
		
	  //  if(o.signalData.length > 10000)
			o.sentMSIDtoMIDmap = myWebRTChub.extractMSIDtoMIDmap(data.sdp)	
	
	  //addTextToReceiveBox("#chatReceivedGlobalPeers", "SL=" + o.signalData.length + "<br>")
       if(!o.meetingUUID || !o.meetingWithUUID)
	   {
 		  console.log('SIGNAL', o.signalData)
 	      $(outgoingSelector).html(o.signalData)
 	   }
       else if(p.meetingInitiator || o.sentMSIDtoMIDmap)
       {
		   o.sentFirebaseMessage = true
		   let startedOrComplete = p.meetingInitiator ? "startedConnection" : "completeConnection"
	
		   if(isDebuggingWebRTCpeers)
			  addTextToReceiveBox("#chatReceivedGlobalPeers", "<b style='color:"+(p.meetingInitiator ? "#550" : "#055")+"'>" + startedOrComplete+"</b><br>")
	
		   //IMPORTANT: develop using wired connection, not wifi (exhausts connections?)
		   //USING DEVTOOLS DEBUGGER then must put a breakpoint here!!! Without DevTOOLS it works!!!
	
		   consoleLogIfIsInLocalhost("CALL " + startedOrComplete + " THIS " + meetObj.firstLocalUser.uuid + " TO " + o.meetingWithUUID + " " + " INITIATESEND = " + p.meetingInitiator)
	
		   let callThisFunction = function(signalDataEncrypted){myWebRTChub.sendFireBaseMessage(registerChannelForUUIDpeers[o.meetingUUID] + "/" + o.fromUUID
    	  	      , evaljscriptCommand("myWebRTChub."+startedOrComplete+"(\""+ myUUID(meetObj) + "\",\""+meetObj.firstLocalUser.meetingUUID+"\",  \""+ meetObj.firstLocalUser.uuid+"\", \""+o.meetingWithUUID+"\", \""+meetObj.keyKeepPrivateSendPublicJWK+"\""
					+ ",\"" + signalDataEncrypted + "\""
					+ ",\"" + myWebRTChub.stringMySettings(meetObj.firstLocalUser, true, undefined, o, true) + "\""
					+ (p.meetingInitiator 
						?  ",'" + myWebRTChub.myTurnServerDistances() + "'"
						: "")
					+")")
				  , undefined
				  , o.fromUUID
				  ) 
				}

		myWebRTChub.sendToOtherWithAsymetricAndSymetricKeys(o, callThisFunction, o.signalData)
		
}
	
})//p.on('signal'         	     

     o.midToTrack = []

     p.on('track', function(track, stream, transceiver) 
     {
	    //console.log('WEBRTC track')

		o.midToTrack[transceiver.mid] = track
		let debug = track + "çlkçlk"
		debug = debug + debug
     })
     
    p.on('stream', origStream => 
     {
	    //console.log('WEBRTC stream')

		o.origStream = origStream
		o.trackIDtoTrackofOrigStream = new Map()
		for(let track of origStream.getTracks())
		  o.trackIDtoTrackofOrigStream.set(track.id, track)


    	if(o.videoReceive && o.videoReceive.srcObject)
    		return
    	if(isDebuggingWebRTCpeers)
    	  addTextToReceiveBox("#chatReceivedGlobalPeers", "STREAM<BR>")

		$(o.selector).css("display", 'inline-table')
				
	 	
		})
    /*
    $(formSelector)[0].addEventListener('submit', ev => {
      ev.preventDefault()
      p.signal(JSON.parse($(incomingSelector)[0].value))
    })
    */

    p.on('connect', function() {
	  console.log('WEBRTC connected to ' + o.fromUUID)
      o.isConnected = true
      if(isDebuggingWebRTCpeers)
    	addTextToReceiveBox("#chatReceivedGlobalPeers", "CONNECT<BR>")
   	  //myWebRTChub.addAudioVideoStream(o.selector, true)
      //p.send(info)

		let lastPos = 0
		if(o.receivedMapFromUniqueUUIDtoObject3Ddivs)
		  while(lastPos < o.receivedMapFromUniqueUUIDtoObject3Ddivs.length)
		  {
			if(!meetObj.mapFromUniqueUUIDtoObject3Ddivs)
			  meetObj.mapFromUniqueUUIDtoObject3Ddivs = new Map()
			let pos = o.receivedMapFromUniqueUUIDtoObject3Ddivs.indexOf(' ')
			let uniqueUUID = o.receivedMapFromUniqueUUIDtoObject3Ddivs.slice(lastPos, pos)
			lastPos = pos + 1
	        if(undefined === meetObj.mapFromUniqueUUIDtoObject3Ddivs.get(uniqueUUID))
				{
				meetObj.mapFromUniqueUUIDtoObject3Ddivs.set(uniqueUUID, false) //waiting for data
	            myWebRTChub.sendCommandToPeers(o, "GET_DIV_UNIQUE_UUID_THIS_DATA", uniqueUUID) 
				}
		  }


    })

    p.on('data', data => {
      //console.log('WEBRTC data')
      data = data.toString()
      let pos = data.indexOf(' ')
      if(pos != -1 && data.slice(0, pos) == COMMAND_SYMBOL)
    	  treatCommandReceived(o, data.slice(pos + 1))
      else if(data.length > 0)
		{
    	  let privateMessage = data.charAt(0)=='P'
    	  data = data.slice(1)
    	  if(privateMessage)
    		  data = "<font style='color:#800'>" + data + "</font>"
    	  addTextToReceiveBox("#chatReceivedGlobalPeers", "<p style='width:100%;text-align:left'><b><a class='username_"+o.meetingWithUUID+"' onClick='showGlobalChat(undefined,undefined,\""+o.uuid+"\")'>" + o.username + "</a>"+(privateMessage ? "->ME" : "")+"</b>: " + data + "</p>", privateMessage ? undefined : "#buttonShowGlobalChatWebRTCpeers")
		}
    	  
      o.chatReceivedText = data
    })
    
    if(info)
      p.signal(info) //Safari with Adapter-JS error assigning to readonly element
    
} //newSimplePeer

  // test TURN server:  https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/			
   if(p)
	  console.log("STRANGE: p exists in new SimplePeer")
   else if(false && initiateSend)
	   setTimeout(newSimplePeer, 10) //does not solve Safari hanging if initiateSend is TRUE
   else newSimplePeer()
	
  }
  finally
	{
    return o
   }
}
//---------------------------------------------------------
class SimplePeersObject
{
  getMeetingInitiator(placeDescription = "none")
  {
	return this.meetingInitiator
  }	
	
}//class SimplePeersObject
//---------------------------------------------------------
class MyWebRTChub  
{

//------------------------	
constructor() 
{
this.lastMeetingHeight = 1
this.lastMeetingWidth = 1    

this.videoDevicesIDthatFailed = []
this.defaultNameAddNewUser = ""

this.reachUmniverseTurnAssistants()
	

}//constructor

//-----------------------------------------------
localUserOfThisMeetingAndNumTrack(meetingUUID, numTrack)
{
	for(let [key,localUser] of localUsersUUIDtoObject)
	  if(localUser.meetingUUID == meetingUUID && localUser.numTrack == numTrack)
		return localUser
}
//-----------------------------------------------
warmupTurnServers(UMNIVERSE_TURN_ASSISTANT, turnServerInfo)
{

  let pos = UMNIVERSE_TURN_ASSISTANT.indexOf(" ")	
  let clusterNum = UMNIVERSE_TURN_ASSISTANT.slice(0, pos)
  let urls = []
  let lastPos = pos + 1
  while(lastPos < UMNIVERSE_TURN_ASSISTANT.length)
  {
	pos = UMNIVERSE_TURN_ASSISTANT.indexOf(" ", lastPos)
	if(pos == -1)
		pos = UMNIVERSE_TURN_ASSISTANT.length
	urls.push(UMNIVERSE_TURN_ASSISTANT.slice(lastPos, pos))
	lastPos = pos + 1
  }

let tryToReachClusterTurnServer_warmup = function (numAssistant)
  {
	    //ALSO WARMS UP THE SSL PART
	    
	   // /?command=userhome is to avoid CORS policy error & requesting FAVICON.ico !!! 
  const url = "https://" + urls[numAssistant] + "/WebUmniverseTurnAssistant/?command=userhome"

  $.ajax({
    url: url,
    type: 'GET',
	async: true,
  	cache: false,
	success: function()
     { 
	  myWebRTChub.reachUmniverseTurnAssistant_phases(UMNIVERSE_TURN_ASSISTANT, turnServerInfo)
     },
    error: function(err) 
	{
	  //normal to return error! It awakes TomcatServlet just the same
	  myWebRTChub.reachUmniverseTurnAssistant_phases(UMNIVERSE_TURN_ASSISTANT, turnServerInfo)
    }

 })
	
		
}

tryToReachClusterTurnServer_warmup(0)
	
	
	
}
//-----------------------------------------------
reachUmniverseTurnAssistants()
{
encodedUniqueTokenForTurnServers = encodeURIComponent(uniqueTokenForTurnServers)

for(let UMNIVERSE_TURN_ASSISTANT of UMNIVERSE_TURN_ASSISTANTS)
  if(!umniverseTurnAssistantsResponses.get(UMNIVERSE_TURN_ASSISTANT))
  {
	let turnServerInfo = umniverseTurnAssistantsPhase.get(UMNIVERSE_TURN_ASSISTANT) 
	if(!turnServerInfo)
		{
			  turnServerInfo = {phase: -1, numAssistant: 0}
			
			  let pos = UMNIVERSE_TURN_ASSISTANT.indexOf(" ")
			  turnServerInfo.clusterNum = UMNIVERSE_TURN_ASSISTANT.slice(0, pos)
			  turnServerInfo.urls = []
			  let lastPos = pos + 1
			  while(lastPos < UMNIVERSE_TURN_ASSISTANT.length)
			  {
				pos = UMNIVERSE_TURN_ASSISTANT.indexOf(" ", lastPos)
				if(pos == -1)
					pos = UMNIVERSE_TURN_ASSISTANT.length
				turnServerInfo.urls.push(UMNIVERSE_TURN_ASSISTANT.slice(lastPos, pos))
				lastPos = pos + 1
			  }
			umniverseTurnAssistantsPhase.set(UMNIVERSE_TURN_ASSISTANT, turnServerInfo)
			
		}
	if(turnServerInfo.phase === -1 || turnServerInfo.phase === umniverseTurnAssistantsPhase_end)
		this.reachUmniverseTurnAssistant_phases(UMNIVERSE_TURN_ASSISTANT, turnServerInfo)
  }
	
}
//-----------------------------------------------
reachUmniverseTurnAssistant_phases(UMNIVERSE_TURN_ASSISTANT, turnServerInfo)
{
	
	switch(turnServerInfo.phase)
	{
	case -1: 
		turnServerInfo.phase = umniverseTurnAssistantsPhase_warmup
		this.warmupTurnServers(UMNIVERSE_TURN_ASSISTANT, turnServerInfo) 
		break	
	case umniverseTurnAssistantsPhase_warmup: 
		turnServerInfo.phase = umniverseTurnAssistantsPhase_turnserver443
		this.callTurnServers443or8443(UMNIVERSE_TURN_ASSISTANT, turnServerInfo, "") 
		break	
	case umniverseTurnAssistantsPhase_turnserver443: 
		turnServerInfo.phase = umniverseTurnAssistantsPhase_turnserver8443
		this.callTurnServers443or8443(UMNIVERSE_TURN_ASSISTANT, turnServerInfo, ":8443") 
		break	
	case umniverseTurnAssistantsPhase_turnserver8443: 
		turnServerInfo.phase = umniverseTurnAssistantsPhase_error
		myWebRTChub.sendReachTurnServersErrorsToServer(turnServerInfo.err.status + " " + turnServerInfo.err.statusText, turnServerInfo.urls[turnServerInfo.numAssistant])
		break	
	case umniverseTurnAssistantsPhase_error: 
		turnServerInfo.phase = umniverseTurnAssistantsPhase_umniverseServerData

		break	
	case umniverseTurnAssistantsPhase_umniverseServerData: 
		turnServerInfo.phase = umniverseTurnAssistantsPhase_end
		break	
	case umniverseTurnAssistantsPhase_end:
		//nothing more, all has been tried!!!
		break 
	}
}
//-----------------------------------------------------------------------
callTurnServers443or8443(UMNIVERSE_TURN_ASSISTANT, turnServerInfo, port443or8443)
{

let tryToReachClusterTurnServer = function ()
  {
  const domain = turnServerInfo.urls[turnServerInfo.numAssistant]
  let url = "https://" + domain + port443or8443 + "/WebUmniverseTurnAssistant/?command=ip2location&utfts=" + encodedUniqueTokenForTurnServers
  const sendTime = new Date().getTime()

  $.ajax({
    url: url,
    type: 'GET',
	async: true,
  	cache: false,
	dataType: 'text',
	success: function(text)
      { 
		let objTextObj = {}
		objTextObj.text = text //to be quick
		objTextObj.deltaTime = new Date().getTime() - sendTime
		objTextObj.clusterNum = turnServerInfo.clusterNum
		objTextObj.domain = domain
		umniverseTurnAssistantsResponses.set(UMNIVERSE_TURN_ASSISTANT, objTextObj)
		turnServerInfo.phase = umniverseTurnAssistantsPhase_end
		myWebRTChub.sendReachTurnServersErrorsToServer_now() //important!!!
		//strange error converting back to JSON!!!  console.log("Turn Assistant "+UMNIVERSE_TURN_ASSISTANTS[i]+" Anwser=" + JSON.stringify(objClean))
    },
    error: function(err) 
	{
		turnServerInfo.err = err
		if(turnServerInfo.urls.length > turnServerInfo.numAssistant + 1)
		  {
			  turnServerInfo.numAssistant++
			  turnServerInfo.phase = -1 //restarts warmup!
		  }
		myWebRTChub.reachUmniverseTurnAssistant_phases(UMNIVERSE_TURN_ASSISTANT, turnServerInfo)
	}

 })
	
}//tryToReachClusterTurnServer
tryToReachClusterTurnServer()
	
}
//--------
sendReachTurnServersErrorsToServer(status , url)
{
allTheStatusErrors += url + ": " + status + "     "
allTheUrlsOfErrors += url + " "
numberOfUrlsOfErrors++
myWebRTChub.sendReachTurnServersErrorsToServer_now()
}
//---------------------------------------------------------
sendReachTurnServersErrorsToServer_now()
{
if(!allTheStatusErrors || numberOfUrlsOfErrors + umniverseTurnAssistantsResponses.size < UMNIVERSE_TURN_ASSISTANTS.length)
  return

localSubmit(TURN_RELATED_COMMANDS, undefined, undefined, "FETCH_ERROR", allTheStatusErrors, uniqueTokenForTurnServers + " " + allTheUrlsOfErrors)
allTheStatusErrors = ""
allTheUrlsOfErrors = ""
}
//--------
turnServerCommandFromUmniverseServer(command, data)
{
	switch(command)
	{
		case "error_missing_info":
			let lastPos = 0
			while(lastPos < data.length)
			{
				let pos = data.indexOf(' ', lastPos)
				let turnServer = data.slice(lastPos, pos)
				lastPos = pos + 1 
				pos = data.indexOf(' ', lastPos)
				let numChars = parseInt(data.slice(lastPos, pos))
				lastPos = pos + 1 
				let text = data.slice(lastPos, lastPos + numChars)
				lastPos += numChars 

				let turnServerInfo 
				let UMNIVERSE_TURN_ASSISTANT
				for(let[turnServerCluster, turnServerInfo2] of umniverseTurnAssistantsPhase)
				  if(turnServerCluster.indexOf(" " + turnServer) !== -1)
					{
						UMNIVERSE_TURN_ASSISTANT = turnServerCluster
						turnServerInfo = turnServerInfo2
						turnServerInfo.phase = umniverseTurnAssistantsPhase_end
						break
					}	
					
				let objTextObj = {}
				objTextObj.domain = turnServer
				objTextObj.text = text //to be quick
				objTextObj.deltaTime = 3000 //long not to be ahead of successful ones
				objTextObj.clusterNum = turnServerInfo.clusterNum
				umniverseTurnAssistantsResponses.set(UMNIVERSE_TURN_ASSISTANT, objTextObj)
				
			}
			
			break
		
		
		
	}
	
	
}
//--------
	initiateHTML(selector, meetingWithUUID, settingsParam, meetingUUID)
	{
		//this.updateBottomBar(meetingUUID)

		try
		{
		enteredInitiateHTML++
		
		
		let o = simplePeersObjects.get(selector)
		if(peersSelectorsToUUID[selector])
		{
			if(o)
			   return o
			peersSelectorsToUUID[selector] = undefined //THIS SHOULD NEVER HAPPEN
		}	
		jsGlobalBeforeClosingTab["myWebRTChub.exit()"] = true
			
		if(!o)
			o = newSimplePeersObject(selector, meetingUUID)
		o.oFirstOfPeer = o
		for(let [key, oFirst] of simplePeersObjects)
	  	  if(meetingWithUUID.startsWith(oFirst.meetingWithUUID + "_"))
	        o.oFirstOfPeer = oFirst
		
		let uuid = o.uuid
		o.meetingWithUUID = meetingWithUUID
	
		let meetObj = meetingsUUIDtoObject.get(meetingUUID)
		o.speakersActive = meetObj.speakersActive //received audio
		o.videoActive = meetObj.videoActive //received video
		o.cameraMuted = [] //sent video
		o.microphoneMuted = [] //sent audio
		
		o.selector = selector
			
		peersSelectorsToUUID[selector] = uuid
		peersUUIDtoSelectors[uuid] = selector
		
		let settings = isString(settingsParam) 
				? JSON.parse(revertReplaceCharsForInsideQuotes(settingsParam))
				: settingsParam
		
		o.username = settings.username
		o.screenMode = settings.screenMode
		
		let rotatedVideo = settings.rotatedGlobalVideoForPeers
		o.circlePercentage = settings.circledGlobalVideoForPeers
		let microphoneOnOff = settings.peersMicrophoneActive == "OFF"
		o.isSpeaking = settings.peersMicrophoneActive == "SPEAK"
		o.isSpeakingTimeChange = new Date().getTime()
		let iconSelected = "" //settings.iconSelectedGlobalForPeers // in the future for PERSONAL ICON FROM USER   = rotatedCircledVideo.slice(pos, pos2)
		o.linkFromUser = settings.myURLtoSendToOthers
		let emotionSelected = "" //settings.emotionSelectedGlobalForPeers // in the future for PERSONAL QUESTION FROM USER  = rotatedCircledVideo.slice(pos, pos2)
			
		let pos = settings.questionMarkCornerShow.indexOf(' ')
		o.questionFromUserUUID = settings.questionMarkCornerShow.slice(0, pos)
		o.questionFromUser = JSON.parse("{" + decodeURIComponent(settings.questionMarkCornerShow.slice(pos + 1)) + "}")
		o.isIn3DinThisVideoConference = settings.isIn3DinThisVideoConference
		o.receivedMapFromUniqueUUIDtoObject3Ddivs = settings.mapFromUniqueUUIDtoObject3Ddivs
		o.askForTranslateLanguage = new Set(JSON.parse(decodeURIComponent(settings.askForTranslateLanguage))) 
	
		//at the end calls addSettingsToSendAndReceive
		
		let html = ""
	      + "<table class='username_title_"+o.meetingWithUUID+" height100PercentWhenIn3D' style='width:100%;vertical-align:middle' title='"+replaceCharsForInsideTag(o.username)+"'>"
          + "<tr class='wm'><td class='imageCell'>"
          + "  <table class='wm' style='width:100%;font-size:80%;background-color:#eef'>" 
          		+ "<tr class='wm'>" 

				+ "<td class='imageCell' style='width:1px'>"
            	+ "<button class='wm' id='buttonSend_"+uuid+"' onClick='$(this).css(\"background-color\",\"#bfb\");myWebRTChub.showGlobalChat(undefined,undefined,\""+uuid+"\", this)' style='background-color:#bfb'><img src='"+ cdniverse +"images/chat-black-18dp.svg' style='height:1.5em;'></button>"
            	+ "</td><td onClick='myWebRTChub.showBottomMenuOfOthers(\""+ o.selector + "\")'><img src='" + cdniverse + "images/settings-black-18dp.svg' style='height:1.5em' class='myImgLoadEventAdded'></td>"
			
          	html += 
				"<td class='imageCell' style='width:1px'><nobr>"
		  	    	+ myWebRTChub.buttonsExpandRetract(meetingUUID, o.selector)		
            	+ "</nobr></td>"
		/*		+ "<td class='imageCell' style='width:1px'>"
            	+ "<button class='wm' onClick='if(confirm(\""+TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[2])+"\"))myWebRTChub.exit(\""+selector+"\")' ><b style='color:#800'>X<b></button>"
            	+ "</td>"
			*/	+ "</tr></table>"
          + "</td></tr>"
	      + "<tr><td class='imageCell' id='videoReceive_"+uuid+"TD' "+(o.isSpeaking ? "style='2px solid #f00'" : "")+">"
	      		//+ "<button onClick='myWebRTChub.sendCommandToPeers(\""+meetingWithUUID+"\",\"REQUEST_AV\")'>"+TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[1])+"</button>"
					                                                        //grid works in 3D and centering screen_share in toWalkMe
	      		+ "<div class='wm all_webrtc_DIV_videoReceive' style='display:grid;position:relative;vertical-align:middle;width:100%;height:100%'>" //so that position absolute of IMG icon may work
	      		+   "<div class='imageCell' id='videoReceive_"+uuid+"DIV' style='overflow: hidden;-webkit-mask-image:-webkit-radial-gradient(white, black);background-color:#fff'>"
	      		+     "<video class='all_webrtc_hub_videoReceive' id='videoReceive_"+uuid+"' autoplay onClick='myWebRTChub.clickOnOtherPeersVideo(event, this, \""+uuid+"\")' style='width:160px;height:160px'></video>" //no longer used for rotated at origin: transform:rotate("+(-rotatedVideo * 90)+"deg)
				+      "<div class='CAPTION_SEND_OR_RECEIVE' id='caption_receive_"+meetingWithUUID+"' style='position:absolute;bottom:0px;left:0px;width:100%;color: #fff;text-align: center;display:block'></div>"
	      		+      "<div style='position:absolute;display:block;bottom:0px;width:100%'><table style='width:100%'><tr>"
						+ "<td class='imageCell' id='micReceived_"+uuid+"' style='"+(microphoneOnOff ? "display:none;":"")+"width:1px;background-color:#fbb'><img src='"+ cdniverse +"images/iconfinder_microphone-slash_1608549.svg' style='height:1em'></td>"
	          			+ "<td style='max-width:1px;text-align:left;white-space:nowrap;overflow:hidden'>&nbsp;<b class='username_"+o.meetingWithUUID+"' style='color:#fff;background-color:rgb(0, 0, 0, 0.3)'>"+o.username+"</b></td>"
	                 + "</tr></table></div>"
	      		+   "</div>"
	      		+   "<img class='videoReceive_CORNERS videoReceive_"+uuid+"CORNERS' id='videoReceive_"+uuid+"EMOTION' src='"+emotionSelected+"' style='"+(emotionSelected == "" ? "display:none;":"")+"position:absolute;top:1px;left:1px;width:"+dxdyIconCornersReceive+"px;height:"+dxdyIconCornersReceive+"px'>"
	      		+   "<img class='videoReceive_CORNERS videoReceive_"+uuid+"CORNERS' id='videoReceive_"+uuid+"ICON' src='"+iconSelected+"' style='"+(iconSelected == "" ? "display:none;":"")+"position:absolute;top:1px;right:1px;width:"+dxdyIconCornersReceive+"px;height:"+dxdyIconCornersReceive+"px'>"
	      		+   "<img class='videoReceive_CORNERS videoReceive_"+uuid+"CORNERS' id='videoReceive_"+uuid+"QUESTION' onClick='event.stopPropagation();myWebRTChub.clickedOtherUserQuestion(\""+selector+"\")' src='"+ cdniverse +"images/talkisi/question_mark.svg' style='"+(o.privateQuestionFromUser == "" ? "display:none;":"")+"position:absolute;bottom:1px;left:1px;width:"+dxdyIconCornersReceive+"px;height:"+dxdyIconCornersReceive+"px'>"
	      		+   "<img class='videoReceive_CORNERS videoReceive_"+uuid+"CORNERS' id='videoReceive_"+uuid+"URL' onClick='event.stopPropagation();myWebRTChub.clickedOtherUserLink(\""+selector+"\")' src='"+ cdniverse +"images/iconfinder_link-rounded_4417094.svg' style='"+(o.privateLinkFromUser != "" ? "" : "display:none;")+"position:absolute;bottom:1px;right:1px;width:"+dxdyIconCornersReceive+"px;height:"+dxdyIconCornersReceive+"px'>"
          		+ "</div>"
	      + "</td></tr>"
	      + "</table>"
		   
	     
		$(selector)
		    .css("min-height","1px")
		    .css("vertical-align","middle")
		    .addClass("wm webrtchub_senderOrReceiver_"+meetingUUID+" elementsWithPeersParticipant elementsWithPeersParticipant_"+meetingUUID)
		    .attr("UUID", uuid)
			
		let cell = $(selector).find(".1x1")
		if(cell.length)
			cell.html(html)
		else 
		  $(selector).html(html)
	
		meetingWithUUIDtoPeersObjects.set(meetingWithUUID, o)
		$("#selectorOfWHoToSendChat").append("<option class='username_"+o.meetingWithUUID+"' id='selectorOfWHoToSendChat_option_"+o.meetingWithUUID+"' value='"+o.meetingWithUUID+"'>"+o.username+"</option>")
		
		myWebRTChub.otherChangedOrNotTo3Dconference(o)
		

		//after the elements are in the DOM
		otherPeerChangedScreenMode(o, o.meetingWithUUID + " " + settings.currentScreenModeToSendToPeers)
		o.midOfAudioTrack = settings.midOfAudioTrack
		o.midOfVideoTrack = settings.midOfVideoTrack

		for(let key in addSettingsToSendAndReceive)
		{
		eval("tempFunctionToCall = " + addSettingsToSendAndReceive[key])
		tempFunctionToCall(false, settings, o) //false means is receiving
		}

		if(settings.extraUsers)
		  for(let i = 0; i < settings.extraUsers.length; i++)
			myWebRTChub.addExtraUser(meetingUUID, settings.extraUsers[i].meetingWithUUID, settings.extraUsers[i], o)

		o.videoReceive = $("#videoReceive_"+uuid)[0]
		o.videoReceive.addEventListener('play', (event) =>
			{
				//CHROMIUM (Chrome, Edge) fires PLAY when becomes visible
				if(!event.target.myPauseTimestamp 
				   || event.timeStamp - event.target.myPauseTimestamp > 20)
					myWebRTChub.resizeElementsWithPeersParticipant(undefined)
			})
		o.videoReceive.addEventListener('stop', (event) =>
			{
				event.target.myPauseTimestamp = event.timeStamp
			})
		o.videoReceive.addEventListener('pause', (event) =>
			{
				//CHROMIUM (Chrome, Edge) fires PAUSE when becomes hidden
				event.target.myPauseTimestamp = event.timeStamp
			})

		//myWebRTChub.resizeElementsWithPeersParticipant(undefined)
		
		if(typeof questionsControlCenterPOINTER == "function")
			questionsControlCenterPOINTER("USERS_HAVE_CHANGED")

	    this.refreshShowMeetingLinksAndPeers()
		this.updateLanguagesOfferedAndAskedForInMeeting(meetingUUID)

		if(meetObj.numDivsNORMALInMainScreen == 0
		   	&& o.screenMode == "NORMAL"
			&& meetObj.numDivsInMainScreen > 0)
				$(selector)[0].isInSidePanel = true
	
	    return o  

	}
	catch(error)
	{
		console.log(error.stack)	
	}
	finally
	{
		enteredInitiateHTML--
		if(enteredInitiateHTML == 0) //first call
		  {
			myWebRTChub.addOrRemoveFromMainScreen(undefined, meetingUUID)
  			for(let [uuid, localUser] of localUsersUUIDtoObject)	
				this.localUserMicrophoneMuteNotUnmute(uuid, undefined, meetingUUID, true)
		  }
	}
}
//------------------------------------------
updateCaptionReceived(o)
{
let s = ""
if(o.captionsActiveLanguage)
{
 if(!o.captionsActiveLanguageSelected && o.captionsActiveLanguage.has(preferredLanguage))
   o.captionsActiveLanguageSelected = preferredLanguage
 s = "<table><tr><td>CAPTION <label title='captions in wide screen'><input type='checkbox' onClick='myWebRTChub.toggleCaptionFromUserInWideScreen(\""+o.meetingWithUUID+"\", this.checked)' "+(o.captionInWideScreen ? "checked" : "")+">screen</label>"
	+"<br><select onChange='myWebRTChub.changeSelectedLanguageToReceive(this, \""+ o.meetingWithUUID +"\", this.value)' ><option value='ALL_LANGUAGES'>ALL</option>"
 for(let language of o.captionsActiveLanguage)
   s += "<option value='"+language+"' "+ (o.captionsActiveLanguageSelected == language ? "selected" : "") +">" + dialectToLanguageCounterCodeMAP.get(language) + "</option>"
 s += "<option value=''> -- non selected --</option></select></td>"
 if(o.captionsActiveLanguageSelected)
   s += "<td><img onClick='myWebRTChub.setSpeakOfCaptionReceived(\""+o.meetingWithUUID+"\")' src='"+cdniverse+"images/" + (o.captionsSpeak ?"baseline-volume_up-24px":"baseline-volume_off-24px")+ ".svg' style='height:2.5em'></td></tr></table>"	
}

$("#menuOtherUserCAPTION_"+o.meetingWithUUID).html(s)
}
//------------------------------------------
changeSelectedLanguageToReceive(selectElement, meetingWithUUID, language)
{
let o = meetingWithUUIDtoPeersObjects.get(meetingWithUUID)
o.captionsActiveLanguageSelected = language	
if(!o.captionsActiveLanguageSelected)
   this.setSpeakOfCaptionReceived(meetingWithUUID, false)
else
   this.updateCaptionReceived(o)

let answerToCaption = ""
for(let option of selectElement)
  if(option.value && option.value !== "ALL_LANGUAGES")
	answerToCaption += (selectElement.value === option.value 
						|| selectElement.value === "ALL_LANGUAGES" ? "Y":"N") + option.value + " "
	
myWebRTChub.sendCommandToPeers(o, "CAPTION_ANSWER", o.meetingWithUUID + " 0 " + answerToCaption)

}
//------------------------------------------
toggleCaptionFromUserInWideScreen(meetingWithUUID, wideNotWide)
{
let o = meetingWithUUIDtoPeersObjects.get(meetingWithUUID)
o.captionInWideScreen = wideNotWide

let divCaptionJQ1 = $("#caption_receive_" + (wideNotWide ? meetingWithUUID : "WIDESCREEN"))
let divCaptionJQ2 = $("#caption_receive_" + (wideNotWide ? "WIDESCREEN" : meetingWithUUID))
divCaptionJQ2.html(divCaptionJQ1.html())
divCaptionJQ1.html("")

}
//------------------------------------------
setSpeakOfCaptionReceived(meetingWithUUID, speakNotSpeak)
{
let o = meetingWithUUIDtoPeersObjects.get(meetingWithUUID)
if(speakNotSpeak === undefined)
  speakNotSpeak = !o.captionsSpeak
o.captionsSpeak = speakNotSpeak
this.updateCaptionReceived(o)	
}
//------------------------------------------
showBottomMenuOfOthers(selector) 
{
if(activeOtherUserSELECTOR == selector && $("#peersControlXYzoomOfOthersCamera").is(":visible"))
  return  myWebRTChub.activateCorner("")
activeOtherUserSELECTOR = selector
myWebRTChub.activateCorner("peersControlXYzoomOfOthersCamera")
}
//------------------------------------------
myCreateAudioMeter(meetObj)
{
let stream = meetObj.destStreamDestination.stream
if(meetObj.alreadyInitiatedMyCreateAudioMeter 
//  || !peersMicrophoneActive
  || !stream)
  return
meetObj.alreadyInitiatedMyCreateAudioMeter = true	
if(meetObj.meter)
	{
	meetObj.meter.onaudioprocess = null
	meetObj.meter.disconnect(meetObj.audioContext.destination)
	meetObj.meter = null	
	}

meetObj.meter = createAudioMeter(meetObj)
meetObj.activeMediaStreamSource.connect(meetObj.meter)
}
//-------------------------------------------------  
buttonsExpandRetract(meetingUUID, selector)
{		
return "<button class='button_addRemoveMainScreen' onClick='myWebRTChub.addOrRemoveFromMainScreen(undefined, \""+meetingUUID+"\",\"" + selector + "\", true)' ></button>"
  + "<button class='webrtchub_hideIfOnlyInMain webrtchub_hideIfOnlyOne webrtchub_hideIfNoneOnMainScreen' onClick='myWebRTChub.addOrRemoveFromMainScreen(undefined, \""+ meetingUUID + "\",\"" + selector + "\");myWebRTChub.returnTo2DifMeetObjHasOnlyOneInMainDiv(\""+ meetingUUID + "\")'><img src='"+ cdniverse +"images/fullscreen_black_24dp.svg' style='height:1.5em'></button>"
  + "<button class='webrtchub_showIfOnlyInMain webrtchub_hideIfOnlyOne' onClick='myWebRTChub.addOrRemoveFromMainScreen(undefined, \""+ meetingUUID + "\",\"" + selector + "\");myWebRTChub.returnTo2DifMeetObjHasOnlyOneInMainDiv(\""+ meetingUUID + "\")'><img src='"+ cdniverse +"images/fullscreen_exit_black_24dp.svg' style='height:1.5em'></button>"
}
//-------------------------------------------------  
returnTo2DifMeetObjHasOnlyOneInMainDiv(meetingUUID)
{
    let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	
	if(isIn3D && meetObj.numDivsInMainScreen == 1)
	{
	toggle3D(undefined, false)
	typesDivsSelect(undefined, webrtcDivName(meetingUUID))
	objectsMovedToSidePanelBeforeAutomaticallyGoingTo3D = lastObjectsMovedToSidePanel
	}
}
//-------------------------------------------------  
otherChangedOrNotTo3Dconference(o, inNotOut)
{
if(inNotOut !== undefined)
	o.isIn3DinThisVideoConference = inNotOut
	
let arr = $(".buttonOtherThisVideoConference_" + o.uuid)
if(o.isIn3DinThisVideoConference)
	arr.css("backgroundColor", "#c9211e").css("color", "#fff")
else
	arr.css("backgroundColor", "#fff").css("color", "#c9211e")
}
//-------------------------------------------------  
clickedOtherUserQuestion(selector)
{
	showTopBar("topQuestion", simplePeersObjects.get(selector))
}
//-------------------------------------------------  
clickedOtherUserLink(selector)
{
	let o = simplePeersObjects.get(selector)
	openBrowser(o.privateLinkFromUser)
}
//-------------------------------------------------  
toggleBigSmallImage(uuid)
{
	let video = $("#videoReceive_" + uuid)
	let large = $(video).attr("enlarged")
	video.attr("enlarged", large == "true" ? "false" : "true")
	
	this.resizeElementsWithPeersParticipant(undefined)
}
//-------------------------------------------------  
getArrayOfOthersObjectsO()
{
	let oArr = []
	let arr = $(".elementsWithPeersParticipant")
	for(let i = 0; i < arr.length; i++)
	  oArr.push(simplePeersObjects.get("#" + arr[i].id))
	
	return oArr	
}
//---------------------------------------------------------
addExtraUser(meetingUUIDparam, localUserUUIDparam, stringMySettingsParam)
{
	let divID = meetingUUIDparam+"_"+localUserUUIDparam
	let pos = localUserUUIDparam.indexOf("_")
	let firstClass = meetingUUIDparam+"_" + (pos == -1 ? localUserUUIDparam : localUserUUIDparam.slice(0, pos))
	let html =  "<div style='display:inline-table;border:1px solid #000;align-self:center;vertical-align:top'></div>"
	html = surroundByTableFor3D(undefined, html, divID, "contentsAndNoHeight " + firstClass, "display:inline-table;border:1px solid #000;align-self:center;vertical-align:top")
	if(pos == -1)
		$("#divEmcopassingAll_INSIDE"+meetingUUIDparam)[0].insertAdjacentHTML("beforebegin",html);	
	else
		$("." + firstClass).last()[0].insertAdjacentHTML("afterend",html);	
	let o = this.initiateHTML("#" + divID, localUserUUIDparam, stringMySettingsParam, meetingUUIDparam)
	
	this.refreshManageLocalUsersToSend()

		
}
//-------------------------------------------------  
adjustPercentagesOfUserExtraUsers(to3DnotBack = isIn3D)
{

//first those sending
if(false && numLocalUsersGlobal > 1)
{
	let elem = firstLocalUser.canvasToSendToPeers
	if(to3DnotBack)
	{
	elem.style.width = ""
	elem.in3DplaceThisWidth = ""		
	}
	else
    {
	elem.style.transform = ""		
	elem.in3DplaceThisWidth = undefined		
	}
}		
	
	let alreadySentTimeout = false
//now those receiving	
	for(let [key, o] of simplePeersObjects)
	  {
			let oMain = o.oFirstOfPeer
			if(!oMain.origStream || !oMain.midToTrack || !oMain.trackIDtoTrackofOrigStream
			  || oMain.trackIDtoTrackofOrigStream.size !== oMain.midToTrack.length)
			  {
				if(!alreadySentTimeout)
					setTimeout(function(){myWebRTChub.adjustPercentagesOfUserExtraUsers(to3DnotBack)},100)
				alreadySentTimeout = true
				continue  //if this happens forever means simplePeersObjects
			  }
	
			let video = $(o.videoReceive)
			if(video.length > 0 && !video[0].srcObject) //separated for debugging
			  if (o.midOfAudioTrack || o.midOfVideoTrack)
				{
				let tracks = []
				let track = oMain.midToTrack[o.midOfAudioTrack]
				if(track)
					{
						o.audioTrackReceiving = track
						track.enabled = true
						tracks.push(track)
					}
				track = oMain.midToTrack[o.midOfVideoTrack]
				if(track)
					{
						o.videoTrackReceiving = track
						track.enabled = true
						tracks.push(track)
					}

				this.addStreamToElement(video[0], new MediaStream(tracks))
				
				video[0].muted = (o.audioTrackReceiving && peersSpeakersActive) ? false : true
		  		video[0].play()
				.then(()=>{
					 if(!o.videoReceive.alreadyPlayed)
						{
						o.videoReceive.play()
						o.videoReceive.alreadyPlayed = true
						}
						myWebRTChub.resizeElementsWithPeersParticipant(undefined)
				})
				.catch((error) => 
						{
							video[0].pause()
							this.closeStream(video[0])
							console.log("CATCH video[0].play() " + error)
						})
				
				video.videoWidth = o.screenModeDx
				video.videoHeight = o.screenModeDy
			    }


			
			let elem = video[0]
			if(!elem)
			{
				
			}
			else if(!$(elem).hasClass("doNotResizeVideoInWebRTC"))
				{
				}
			else if(to3DnotBack)
				{
				 elem.parentNode.style.width = elem.style.width
				 elem.style.width = ""
				 elem.in3DplaceThisWidth = ""		
				 //elem.style.transform = "translate(-" + (i * 100 / arr.length) + "%, 0%)"
				 elem.parentNode.style.overflow = "hidden"
				}
			else 
			    {
				 elem.style.transform = ""		
				 elem.parentNode.style.overflow = ""
				 elem.in3DplaceThisWidth = undefined		
				}
			/*
							 elem.parentNode.style.width = elem.style.width
				 elem.style.width = ""
				 elem.in3DplaceThisWidth = ""		
				 //elem.style.transform = "translate(-" + (i * 100 / arr.length) + "%, 0%)"
				 elem.parentNode.style.overflow = "hidden"
				}
			else 
			    {
				 elem.style.transform = ""		
				 elem.parentNode.style.overflow = ""
				 elem.in3DplaceThisWidth = undefined		
			*/
			
	} //for
	
	
}
//-------------------------------------------------  
/* marginToAdjustWhenIsIn3D(numExtraPlus1) //it worked!!!
{
if(numExtraPlus1 == 1)
  return 0
if(numExtraPlus1 == 2)
  return 8
let h = 33.33 //value is for 3
for(let i = 3; i < numExtraPlus1; i++)	
	h *= i / (i-1) //formula calculated from experience (took picture of calculations 24 august 2020)
	
return h / numExtraPlus1
}
*/
//-------------------------------------------------  
showNotHideWhenNoSpaceBottomBar(showNotHide)
{
showNotHide = true //no longer hides
showHideSelector(".mywebrtc_hide_whenNoSpaceBottomBar", showNotHide)
if(showingWhenNoSpaceBottomBar !== showNotHide)
	{
	showingWhenNoSpaceBottomBar = showNotHide	
	resizeREALLY()
	}
}
//-------------------------------------------------  
meetingIsIn3D(meetingUUID)
{
let div = myGetElementByName(webrtcDivName(meetingUUID))
return isIn3D && !div.divIn3DthatReplacesThisIn2Dof3D 
}
//-------------------------------------------------  
resizeElementsWithPeersParticipant(rri, noDelay, commandFromPeers, miliSeconds = 0, isResizing)
{
for(let [meetingUUID, meetObj] of meetingsUUIDtoObject)
	this.resizeElementsWithPeersParticipantMEETING(rri, meetingUUID, meetObj, noDelay, commandFromPeers, miliSeconds, isResizing)
}
//-------------------------------------------------  
resizeElementsWithPeersParticipantMEETING(rri, meetingUUID, meetObj, noDelay, commandFromPeers, miliSeconds = 0, isResizing)
{

//if(typeof windowOnresizeUmniverse === "function")
//  windowOnresizeUmniverse()

let arr = $(".elementsWithPeersParticipant")

$(".classForNumberofParticipantsWebRTC").html(arr.length)

$("#topMenuRelativeFitContentWithScroll").css("max-height", windowHeight())	

//IMPORTANT: disabled for it becomes confusing. Only manual change is now allowed
if(false && !isIn3D && !userChangedWhenNoSpaceBottomBar)
	{
	if(windowWidth() > 550)
	   this.showNotHideWhenNoSpaceBottomBar(true)
	if(windowWidth() < 450)
	   this.showNotHideWhenNoSpaceBottomBar(false)
	}
	
if(!isResizing)
	recomputeScrollElementSize()		
	
let meetingHeight
let meetingWidth
let meetingAll = $("#divEmcopassingAll_" + meetingUUID)

for(let ma = 0; ma < meetingAll.length; ma++)
{
let meeting = meetingAll[ma]
if(meeting.style.display == "none")
	continue
	
let widerThanTaller = divWithWebRTChub.offsetWidth  >= divWithWebRTChub.offsetHeight
let widerThanTallerAndWiderIsIn3D = widerThanTaller || this.meetingIsIn3D(meetingUUID)

if(true || numMeetingsGlobal - numMeetingsGlobalHidden <=1)
   $(meeting).css("width", "100%").css("height","100%").css("top","0%").css("left","0%")	
else
  {
  let perc = 100 / (numMeetingsGlobal - numMeetingsGlobalHidden)
  $("divEmcopassingPAGE_" + meetingUUID).css("max-height",heightMeuBody).css("flex-direction", widerThanTallerAndWiderIsIn3D ? "row" : "column")
  if(this.meetingIsIn3D(meetingUUID))
    $(meeting).css("width", perc +  "%").css("height", "100%").css("top","0%").css("left", ma * perc + "%")
             .css("position", "").css("max-height", "100%")
  else if(widerThanTallerAndWiderIsIn3D)
    $(meeting).css("width", perc +  "%").css("height", divWithWebRTChub.offsetHeight + "px").css("top","0%").css("left", ma * perc + "%")
             .css("position", "").css("max-height", "100%")
  else
	$(meeting).css("height", perc +  "%").css("width",divWithWebRTChub.offsetWidth + "px").css("left","0%").css("top", ma * perc + "%")
             .css("position", "")
  }
  meetingHeight = meeting.offsetHeight || this.lastMeetingHeight
  meetingWidth = meeting.offsetWidth || this.lastMeetingWidth 

}	

if(meetingHeight && meetingWidth)
{
this.lastMeetingHeight = meetingHeight
this.lastMeetingWidth = meetingWidth
}

let width
let height

if(!meetObj.notYetUsable)
{
	
arr = $(".webrtchub_senderOrReceiver_" + meetingUUID)

let o
let vs = []
let videosCanvas = []
let objects = []
let numInMain = 0
for(let i = 0; i < arr.length; i++)
 {
 let div = arr[i]
 let v = $(div)
 let o = simplePeersObjects.get("#"+div.id) //object peer OR localUser
      || localUsersUUIDtoObject.get(div.id.slice("mySelfInMainScreen_".length))
	  || {}

 let uuid = $(v).attr("UUID")
 
let video = v.find(".webrtchub_resize_subElement")
if(video.length == 0)
  video = v.find("canvas") //canvas first
if(video.length == 0) 
  video = v.find("video") //video second
if(video.length == 0) 
  video = v.find("iframe")
if(video.length == 0)
  continue
else
  video = $(video[0])
 if(this.meetingIsIn3D(meetingUUID) || !v[0].isInSidePanel)
   {
	vs.push(v)
	videosCanvas.push(video[0])
	objects.push(o)
	numInMain++
   }
}
let screenModeDx = meetingWidth 
let screenModeDy = meetingHeight
let maxXY = 0
let maxNumX = 1
let maxNumY = 1
for(let numX = 1; numX <= numInMain; numX++)
{
	let numY = Math.ceil(numInMain / numX)
	let squareWH = Math.min(screenModeDx / numX, screenModeDy / numY)
	let totArea = 0
	
	let arr_dxTOdy_dyTOdx = []
	for(let y = 0; y < numY; y++)
	{
		let obj = {dxTOdy: 10, dyTOdx: 10, dxTOdyMax: 0, dyTOdxMax: 0}
		for(let n = y * numX; n < Math.min(numInMain, (y + 1) * numX); n++)
		{
		let video2 = videosCanvas[n]
		let o = objects[n]

		let offsetWidth = getAttributeInt(video2, "myoffsetwidth") || video2.offsetWidth || 100
		let offsetHeight = getAttributeInt(video2, "myoffsetheight") || video2.offsetHeight || 100
		
		obj.dxTOdy = Math.max(1, Math.min(obj.dxTOdy, offsetWidth / offsetHeight))
		obj.dyTOdx = Math.max(1, Math.min(obj.dyTOdx, offsetHeight / offsetWidth))
		obj.dxTOdyMax = Math.max(obj.dxTOdyMax, offsetWidth / offsetHeight)
		obj.dyTOdxMax = Math.max(obj.dyTOdxMax, offsetHeight / offsetWidth)
		}
		arr_dxTOdy_dyTOdx.push(obj)
	}

    let num = 0	
	for(let y = 0; y < numY; y++)
	{
		
		for(let n = y * numX; n < Math.min(numInMain, (y + 1) * numX); n++)
			{
			num++
				
			let o = objects[n]

			let offsetWidth = getAttributeInt(videosCanvas[n], "myoffsetwidth") || videosCanvas[n].offsetWidth || 100
			let offsetHeight = getAttributeInt(videosCanvas[n], "myoffsetheight") || videosCanvas[n].offsetHeight || 100
				
				
			let w = squareWH
			let h = squareWH
			if(y + 1 < numY || o.screenMode == "NORMAL")
  				h *= Math.min(1, offsetHeight / offsetWidth)
			else
			  {
				w = screenModeDx / (numInMain - numX * (numY - 1))
				h = Math.min(screenModeDy / numY, w * offsetHeight / offsetWidth)
				
				w = Math.min(w, h * offsetWidth / offsetHeight)
			  }
			totArea += w * h * arr_dxTOdy_dyTOdx[y].dxTOdy 
			if(false && numY > 1) //to compensate same heights in a row (DOES NOT WORK WELL)
			   totArea -= 500000 * (arr_dxTOdy_dyTOdx[y].dxTOdyMax - arr_dxTOdy_dyTOdx[y].dxTOdy) 
			}
	}
	
	if(totArea > maxXY)
	{
	maxXY = totArea
	maxNumX = numX
	maxNumY = numY
	}
}



let nInMain = 0
for(let i = 0; i < arr.length; i++)
 {
 let v = $(arr[i])
 let uuid = $(v).attr("UUID")

  v.css("margin", this.meetingIsIn3D(meetingUUID) ? "0px" : "1px")
		
 
let video = v.find(".webrtchub_resize_subElement")
if(video.length == 0)
  video = v.find("canvas") //canvas first
if(video.length == 0) 
  video = v.find("video") //video second
if(video.length == 0) 
  video = v.find("iframe")
if(video.length == 0)
  continue
else
  video = $(video[0])

 let offsetWidth = getAttributeInt(video[0], "myoffsetwidth") || video[0].offsetWidth || 100
 let offsetHeight = getAttributeInt(video[0], "myoffsetheight") || video[0].offsetHeight || 100

 let placeBRbeforeElement = false

 width = meetingWidth / maxNumX  - 22
 height = meetingHeight / maxNumY - 42
 let widthFinal = width
 let heightFinal = height
 
 if(o && o.screenMode == "SCREEN_SHARE")
	 imposeThisCameraSendResolution = 120

let isIn3Dhere = this.meetingIsIn3D(meetingUUID)
 
 if(v[0].isInSidePanel
	|| meetObj.addOrRemoveFromMainScreen_lastSelector == "SHOW_MAIN_IN_SIDE_PANEL"
	)
 {
	isIn3Dhere = false
	v[0].style.transform = ""
	myStylePosition(v[0], "")
	width = 130
	height = 130
	if(globalSidePanelDirection() == "vertical")
	{
	  let numColumns = Math.min(webrtchub_numSideElements, meetObj.numDivsInSidePanel)
	  widthFinal = Math.max(1, $("#globalSidePanel_inside_parent_vertical")[0].clientWidth / numColumns)
	  widthFinal -= 5 + numColumns * 2
      widthFinal = widthFinal
	}
	else
		widthFinal = Math.max(1, $("#globalSidePanel_inside_parent_horizontal")[0].clientHeight - 35)
	heightFinal = widthFinal
 }
 else if(isIn3Dhere)
 {
	widthFinal = 340
	heightFinal = 340
 }
 else if(meetObj.numDivsInMainScreen == 1 || this.meetingIsIn3D(meetingUUID))
    {
	width = Math.min(width, meetingWidth - 30)
	height = Math.min(height, Math.min(meetingHeight - 30, width * screenModeDy / screenModeDx))
	width = height * screenModeDx / screenModeDy
	let all = $("#divEmcopassingAll_" + meetingUUID)
	
	let marginW = 10
	let marginH = 40
	if(v.hasClass("addORremoveIsWH100PercentIfUniqueInMain"))
		{
			marginW = 0
			marginH = 0
		}
	
	widthFinal = ((width || 100) - marginW)
	heightFinal = ((height || 100) - marginH)
	}
else // in main
{
let x = nInMain % maxNumX
let y = Math.floor(nInMain / maxNumX)
if(y + 1 < maxNumY)
  width = screenModeDx / maxNumX
else
  {
	width = screenModeDx / (numInMain - maxNumX * (maxNumY - 1))
	height = Math.min(screenModeDy / maxNumY, width * offsetWidth / offsetHeight) - 42
  }
width -= 22
widthFinal = width
heightFinal = height


placeBRbeforeElement = nInMain != 0 && nInMain % maxNumX == 0

nInMain++	
}
 
 if(adjustWidthHeightOfPeersInMyWebRTChubUUID[meetingUUID])
    {
	 let widthHeight = adjustWidthHeightOfPeersInMyWebRTChubUUID[meetingUUID](width, height, o)
	 if(widthHeight)
	  {
	  widthFinal =  widthHeight.width
	  heightFinal =  widthHeight.height
      } 
    }
 
if(width !== undefined)
   {
	if(!v.hasClass("doNotResizeVideoInWebRTC"))
	{

	let aspectWidth
	let aspectHeight
	if(video[0].width && video[0].height)
		{
			aspectWidth = video[0].width
			aspectHeight = video[0].height	
		}
	else if(video[0].videoWidth && video[0].videoHeight)
		{
			aspectWidth = video[0].videoWidth
			aspectHeight = video[0].videoHeight	
		}
	if(aspectWidth && aspectHeight)
		{
		widthFinal = Math.min(widthFinal, heightFinal * aspectWidth / aspectHeight)
		heightFinal = Math.min(heightFinal, widthFinal * aspectHeight / aspectWidth)
		}
	
							// -1 to make red border visible when peer is talking
	video.css("max-width", isIn3Dhere ? "" : (widthFinal - 1) + "px")
	video.css("max-height", isIn3Dhere ? "" : (heightFinal - 1) + "px")
	video.css("width", isIn3Dhere ? "100%" : "")
	//video.css("min-height", isIn3Dhere ? "" : heightFinal + "px")
	video.css("height", isIn3Dhere ? "" : heightFinal + "px")
	}

	v.css("max-width", isIn3Dhere ? "" : widthFinal + "px")
	v.css("max-height", isIn3Dhere ? "" : heightFinal + "px")
	v.css("overflow", isIn3Dhere ? "visible" : "hidden")
	
	v.find(".maxWH100percent")
		.css("width", "100%")
		.css("height", "100%")	
		.css("max-width", "100%")
		.css("max-height", "100%")	
    v.find(".WHfinals_size_of_senderOrReceiver")
		   .css("width", widthFinal + "px")
		   .css("height", heightFinal + "px")

    let arrHeight = v.find(".WHfinals_size_of_height")
	for(let a = 0; a < arrHeight.length; a++)
		{
			let arrH = arrHeight[a]
			let lessH = $(arrH.getAttribute("WHfinals_less_of_height_SELECTOR"))
		    arrH.style.height = (heightFinal - lessH.height()) + "px"
		}
    
	arrHeight = v.find(".webrtchub_hide_when_less_than")
	for(let a = 0; a < arrHeight.length; a++)
		{
			let arrH = arrHeight[a]
			let lessH = getAttributeInt(arrH, "hideLessThanPixels")
		    showHideSelector(arrH, widthFinal > lessH)
		}

		

	let grid = v.find(".grid_template_rows_size_of_senderOrReceiver")
	if(grid.length > 0)
	   grid.css("grid-template-rows", heightFinal + "px")
		   .css("grid-template-columns", widthFinal + "px")
   }

/*
 video.animate({
	    width: widthFinal,
//	    "maxWidth": widthFinal,
	    height: heightFinal,
//	    "maxHeight": heightFinal,
	  }, noDelay ? 0 : 350);	 
 */

if(!this.meetingIsIn3D(meetingUUID))
{
  let brBefore = v[0].previousSibling
  if(placeBRbeforeElement)
  {
	if(!brBefore || brBefore.tagName !== "BR")
	  v[0].insertAdjacentHTML("beforebegin", "<br class='webrtchub_BR_BEFORE_senderOrReceiver_"+meetingUUID+"' style=''>")
  brBefore = v[0].previousSibling  
  }

  while(brBefore && brBefore.tagName == "BR")
  {
	let brBeforeBefore = brBefore.previousSibling 
    
	if(!placeBRbeforeElement)
	{
		$(brBefore).remove()
		brBefore = brBeforeBefore
		continue
	}
	
	if(!brBeforeBefore || brBeforeBefore.tagName != "BR")
		break;
	$(brBeforeBefore).remove()
  }
}

 let smallWidth = Math.min(width, height) / 13 * 2

 let widthCorners = smallWidth + "px"		 
 $(".videoReceive_"+uuid+"CORNERS").animate({
	    width: widthCorners,
//	    "maxWidth": widthCorners,
	    height: widthCorners,
//	    "maxHeight": widthCorners,
	  }, noDelay ? 0 : 350);	 
 
 }

while(true)
{
let jq = $("#divEmcopassingAll_INSIDE" + meetingUUID)
if(jq.length == 0) //not yet created?
	break
let lastElement = $("#divEmcopassingAll_INSIDE" + meetingUUID)[0].lastChild
if(!lastElement || lastElement.tagName != "BR")
  break
$(lastElement).remove();
}

}//meetingUUID

for(let uuid in resizeMadeInMyWebRTChubUUID)
	resizeMadeInMyWebRTChubUUID[uuid](uuid)

const captions = $(".CAPTION_SEND_OR_RECEIVE")
for(let caption of captions)
  {
	const fontSize = Math.min(40, caption.offsetWidth / 20)
	caption.style.fontSize = fontSize + "px"
	caption.style.lineHeight = (fontSize * 40 / 30) + "px"
	caption.style.marginBottom = (fontSize * 20 / 30) + "px"
  }

this.adjustPercentagesOfUserExtraUsers()

if(this.meetingIsIn3D(meetingUUID) && !isResizing) 
  treatSubDivUnderDIVfor3D(rri, $(myGetElementByDIVid(webrtcDivName(meetingUUID))).find(".tablesUnderDIVfor3D")[0], true, miliSeconds)

cameraCSS3Dchanged = true
}
//-------------------------------------------------  
recalculateVideoTosendDxDy (localUser, optimal)
{
	
return //sometimes SimplePeer connection stops (perhaps audio channels that are lost)
	
/*
if(screenStreamToCopyToCanvas)
	optimal = 320 // independently of optimal
else if(optimal !==	undefined) //second to be tested!!!!
	{
	}
else
{
let arr = $(".elementsWithPeersParticipant")

if(screenStreamToCopyToCanvas)
	optimal = 160
else if(arr.length <= 2)
	optimal = 320
else if(arr.length <= 8)
	optimal = 160
else
	optimal = 120
}

if(optimal != dxdyToSendToPeers)
	{
	if(!screenStreamToCopyToCanvas)
		myWebRTChub.resizeTwoCanvas(localUser)
	dxdyToSendToPeers = optimal
	}
*/
}
//-------------------------------------------------  
updateChatSend  (ta, selector)
{
	simplePeersObjects.get(selector).chatSendText = ta.value
}
//-----------------------------------------------
  startReceiving (selector, info)
  {
	  let o = simplePeersObjects.get(selector)
	  if(o) 
		  {
		  //download(info, "sdp.txt", "text/text")
		  o.receivedMSIDtoMIDmap = this.extractMSIDtoMIDmap(info)
		  myWebRTChub_simple_peer(selector,o, o.meetingUUID, info)
		  }
		else
		  alert("selector " + selector + " not found")
	  return o
  }
  //-----------------------------------------------
   sendCommandToPeers(uuidORo, command, parameters, meetingUUID, sendCaptionsWhenMicOn1orMicOffm1orBoth0)
   {
	   if(command.indexOf(COMMAND_SYMBOL) == -1)
		   command = COMMAND_SYMBOL + " " + command
	  if(parameters != undefined)
		  command += " " + encodeURIComponent(parameters)
		   
	  if(uuidORo && !isString(uuidORo))
		  this.sendText(uuidORo, command)
	  else	  
	    for(let [selector, o] of simplePeersObjects)
		 if(o.peer && o.oFirstOfPeer === o) //only send once per each participant === only sends to main object
		  if(!uuidORo || o.uuid === uuidORo)
		   if(!meetingUUID || o.meetingUUID === meetingUUID)
		    if(o.username && (!uuidORo || uuidORo== "" || uuidORo == o.meetingWithUUID || uuidORo == o.uuid))
			  if(!sendCaptionsWhenMicOn1orMicOffm1orBoth0 //undefined or 0
			   || (sendCaptionsWhenMicOn1orMicOffm1orBoth0 === 1 && !o.informedMicrophoneMuted)
			   || (sendCaptionsWhenMicOn1orMicOffm1orBoth0 === -1 && o.informedMicrophoneMuted)
			   )
			this.sendText(o, command)
   }
  //-----------------------------------------------
  sendChatText (uuid, text)
  {
	    let first = true
		for(let [key, o] of simplePeersObjects)
		  if(o.username && (!uuid || uuid== "-1" || uuid == o.meetingWithUUID))
			{
		    let privateMessage = uuid == o.meetingWithUUID 
			this.sendText(o, (privateMessage ? "P" : "p") + text)

			if(privateMessage)
    		  {
				text = "<font style='color:#800'>" + text + "</font>"
				myWebRTChub.changeToShape("hexagonal", true)
    		  }
    		if(first)
    			{
    			first = false
    			addTextToReceiveBox("#chatReceivedGlobalPeers", "<p style='width:100%;text-align:right'><b>ME->"+ (privateMessage ? "<a class='username_"+o.meetingWithUUID+"' onClick='showGlobalChat(undefined, undefined, \""+o.uuid+"\")'>" + o.username + "</a>" : "") +"</b>: " + text + "</p>","#buttonShowGlobalChatWebRTCpeers")
    			}
			}
  }
  //-----------------------------------------------
  sendText(selectorOrObject, text, command)
  {
	  
	  if(command)
		  text = COMMAND_SYMBOL + " " + text
	  let o = isString(selectorOrObject) ? simplePeersObjects.get(selectorOrObject) : selectorOrObject
	  if(!o)
		return 
	  if(!o.peer)
		o = o.oFirstOfPeer
		  
	  if(o && o.peer)
		try
		{
			o.peer.send(text)
	    }
		catch(e)
	  	{
		//channels already closed
	  	}
      
  }
//-----------------------------------------------
sentMSIDtoMIDmapCHECKglobalTracksToSend(trackID, o)
{
o = o.oFirstOfPeer //the first has all the information

if(!o.sentMSIDtoMIDmap)
  return //give a chance to get some data

let mid = o.sentMSIDtoMIDmap[trackID]
if(mid)
  return mid
let h =  o.globalTracksOrigToPeerToSend.get(trackID) 
mid = o.sentMSIDtoMIDmap[h]
if(mid)
  return mid

let t = 0
for(let [trackOrigID, trackToSendID] of o.globalTracksOrigToPeerToSend)
  if(trackOrigID == trackID) 
    return "" + t	
  else
    t++
}
//-----------------------------------------------
trackOrigOfLocalUserToTrackSentToObjectPeer(trackID, o)
{
o = o.oFirstOfPeer

if(!o.sentMSIDtoMIDmap)
  return //give a chance to get some data

let h = o.sentMSIDtoMIDmap[trackID]
if(!h)
  h =  o.globalTracksOrigToPeerToSend.get(trackID) 

for(let track of o.stream.getTracks())
  if(track.id == h)
    return track

/*
let t = 0
for(let [trackOrigID, trackToSendID] of o.globalTracksOrigToPeerToSend)
  if(trackOrigID == trackID) 
    return "" + t	
  else
    t++
*/
}
//-----------------------------------------------
 stringMySettings(localUser, appendExtraUsers, doNotJSONstringify, o, useStreamToSendToReplaceStreamToSend)
 {
    let meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)

	let stringMapFromUniqueUUIDtoObject3Ddivs = ""
	
	if(!UseFirebaseToShareObjectsNotMessages 
		&& meetObj.mapFromUniqueUUIDtoObject3Ddivs)
	  for (let [uniqueUUID, object3d] of meetObj.mapFromUniqueUUIDtoObject3Ddivs)
		 if(object3d)     
 		   stringMapFromUniqueUUIDtoObject3Ddivs += uniqueUUID + " "

		
	let settings = {
		username: localUser.username,
		meetingWithUUID: localUser.uuid, 
		screenMode: localUser.screenMode,
		rotatedGlobalVideoForPeers: localUser.rotatedGlobalVideoForPeers,
		circledGlobalVideoForPeers : localUser.circledGlobalVideoForPeers,
		peersMicrophoneActive: (localUser.microphoneMuted 
								|| !meetObj.microphoneActive
								|| meetObj.disabled
            					|| !peersMicrophoneActive
            					|| globalIsMutedBecauseOfSeveralReasons > 0
								  ? (localUser.isSpeaking ? "SPEAK" : "ON") : "OFF"),
		iconSelectedGlobalForPeers: (localUser.iconSelectedGlobalForPeers ? cdniverse +"images/OpenMoji/"+localUser.iconSelectedGlobalForPeers+".svg" : ""),
	    myURLtoSendToOthers: localUser.myURLtoSendToOthers,
	    emotionSelectedGlobalForPeers: (localUser.emotionSelectedGlobalForPeers ? cdniverse +"images/emotions/iconfinder_EMOJI_ICON_SET-"+ (localUser.emotionSelectedGlobalForPeers < 10 ? "0" : "") + localUser.emotionSelectedGlobalForPeers +".svg" : ""),
	    questionMarkCornerShow: currentMyQuestionUUID + " " + (localUser.questionMarkCornerShow ? jsonQUESTIONtoSendToOthers : ""),
	    currentScreenModeToSendToPeers: localUser.currentScreenModeToSendToPeers,
	    isIn3DinThisVideoConference: isIn3D,
		mapFromUniqueUUIDtoObject3Ddivs: stringMapFromUniqueUUIDtoObject3Ddivs,
		
		//what is here localUser.translationLanguagesAskedFor is o.askForTranslateLanguage on the peer
		askForTranslateLanguage: encodeURIComponent(JSON.stringify([...localUser.translationLanguagesAskedFor.keys()]))
	  }

	if(o)
	{ let streamToSend = localUser.streamToSend
	  if(useStreamToSendToReplaceStreamToSend && localUser.streamToSendToReplaceStreamToSend)
		streamToSend = localUser.streamToSendToReplaceStreamToSend
	  for(let track of streamToSend.getTracks())
		{
			if(track.kind == "audio")
				settings.midOfAudioTrack = this.sentMSIDtoMIDmapCHECKglobalTracksToSend(track.id, o)
			else if(track.kind == "video")
				settings.midOfVideoTrack = this.sentMSIDtoMIDmapCHECKglobalTracksToSend(track.id, o)
		}
	}
	if(appendExtraUsers && numLocalUsersGlobal > 1)
	{
	settings.extraUsers = []
	let first = true
	for(let [key, localUserExtra] of localUsersUUIDtoObject)
	   {
		if(localUser.meetingUUID != localUserExtra.meetingUUID)
		   continue
		   
		if(first)
			first = false	
	    else
          settings.extraUsers.push(this.stringMySettings(localUserExtra, false, true, o))
		}
	}
	
	if(doNotJSONstringify)
		return settings
		
	for(let key in addSettingsToSendAndReceive)
			{
			eval("tempFunctionToCall = " + addSettingsToSendAndReceive[key])
			tempFunctionToCall(true, settings, o); //true means is sending settings
			}
	
	return replaceCharsForInsideQuotes(JSON.stringify(settings))
 }
//-----------------------------------------------
extractMSIDtoMIDmap(s)
{	  let arr = []
	  let lastPos = 0
	  if(s)	
		while(true)
		{
			let pos = s.indexOf("a=mid:", lastPos)
			if(pos == -1)
			  break
			lastPos = pos
			pos = s.indexOf("\r\n", lastPos)
			if(pos == -1)
				pos = s.indexOf("\\r\\n", lastPos)
			if(pos == -1)
			  break
			let mid = s.slice(lastPos + 6, pos)
			lastPos = pos
			pos = s.indexOf("a=msid:", lastPos)
			if(pos == -1)
			  break
			lastPos = pos
		    pos = s.indexOf(" ", lastPos)
			if(pos == -1)
			  break
			lastPos = pos
			pos = s.indexOf("\r\n", lastPos)
			if(pos == -1)
				pos = s.indexOf("\\r\\n", lastPos)
			if(pos == -1)
			  break
	        let msid = s.slice(lastPos + 1, pos)
			lastPos = pos

			/*no need to remove {}
			if(msid.charAt(0) == '{')
		       msid = msid.slice(1, msid.length - 1)
			*/
			
			arr[msid] = mid				

		}
return arr
}
//-----------------------------------------------
sendToOtherWithAsymetricAndSymetricKeys(o, callThisFunction, dataToSend)
	{
		 generateKeySymetric()
 		  .then((symetricKey) => 
			{
			subtleExportKeySymetric(symetricKey)
			.then((publicKeyJWK) =>
			{
				//meetObj.keyKeepPrivateSendPublicJWK = publicKeyJWK
   				subtleEncryptSymetric(symetricKey, dataToSend)
			   .then((cipherText ) => 
				{
				let cipherTextSTRING = buf2hex(cipherText)
			  	subtleEncrypt(o.fromUUIDpublicKey, publicKeyJWK.k)
				.then((cipheredSymetricJWK) =>
				{
				let cipheredSymetricJWK_STRING = buf2hex(cipheredSymetricJWK)
//				let debug = hex2buf(cipheredSymetricJWK_STRING)
				let signalDataEncrypted = encodeURIComponent(cipheredSymetricJWK_STRING.length + " " + cipheredSymetricJWK_STRING
				                        	+ cipherTextSTRING)
	
				callThisFunction(signalDataEncrypted)
		})//subtleEncrypt(meetObj.keyPa
		 .catch(error => {
			console.error(error)
			})
      })//subtleEncryptSymetric(symetricKey, o.signalData)
 		.catch(error => {
			console.error(error)
			})
	 }) //subtleExportKey(symetricKey)
 		.catch(error => {
			console.error(error)
			})
	}) //generateKeySymetric()
	 .catch(error => {
			console.error(error)
			})
}
//-----------------------------------------------
  gotMedia (stream) {
	  var peer1 = new SimplePeer({ initiator: true, stream: stream })
	  var peer2 = new SimplePeer()

	  peer1.on('signal', data => {
	    peer2.signal(data)
	  })

	  var video = $(selVideo1)[0]
	  video.srcObject = stream
	  video.play()

	  
	  peer2.on('signal', data => {
	    peer1.signal(data)
	  })

	  peer2.on('stream', stream => {
	    // got remote video stream, now let's show it in a video tag
	    var video = $(selVideo2)[0]
	    video.srcObject = stream
	    video.play()
	  })
	}
//------------------------------------------
addTrackToStreamIfFirstOfKind(stream, track, onlyIfNotPlaced)
{
	if(track.kind == "video" && stream.getVideoTracks().length > 0)
	  return false
	if(track.kind == "audio" && stream.getAudioTracks().length > 0)
	  return false
	if(onlyIfNotPlaced && track.myAlreadyPlaced)
	  return false

	track.myAlreadyPlaced = true
	stream.addTrack(track)
	return true
}
//------------------------------------------
callChannelNameDIVSchanged(s)
{
//these variables are available
//processingThisOnFirebaseMessagePath
//processingThisOnFirebaseMessageNode
//processingThisOnFirebaseActionType ("value", "child_changed", "child_added", "child_removed", ...)

let pos = processingThisOnFirebaseMessagePath.indexOf("/DIVS")

let channelKey = processingThisOnFirebaseMessagePath.slice(0, pos)
if(channelKey[0] == "/")
   channelKey = channelKey.slice(1)
let meetingUUID = myWebRTChub.getMeetingUUIDfromChannelKey(channelKey)

let meetObj = meetingsUUIDtoObject.get(meetingUUID)
if(!meetObj)
	return

let uniqueUUID = processingThisOnFirebaseMessageNode.slice("uniqueUUID_".length)
if(!uniqueUUID)
	return //strange

let object3d = meetObj.mapFromUniqueUUIDtoObject3Ddivs ? meetObj.mapFromUniqueUUIDtoObject3Ddivs.get(uniqueUUID) : undefined

if(processingThisOnFirebaseActionType == "child_removed")
	s = ""

if(!object3d && !s)
  return

let divName = typeof object3d == "object" ? getDivNameFromObject3d(object3d) : undefined 

if(!s)
	{
	if(!divName)
	   divName = mapFromObject3dUniqueUUIDtoDivName.get(uniqueUUID)
	if(divName)
		closeCurrentDiv(divName)	
	if(meetObj.mapFromUniqueUUIDtoObject3Ddivs)
 	   meetObj.mapFromUniqueUUIDtoObject3Ddivs.delete(uniqueUUID)
	if(meetObj.mapNotProcessedNewDivObject)
     	meetObj.mapNotProcessedNewDivObject.delete(uniqueUUID)
    myWebRTChub.refreshInformationAboutDIVSinMeeting(meetingUUID)
	return
	}
	
pos = s.indexOf(' ')
let fromUUID = s.slice(0, pos)
let lastPos = pos + 1
pos = s.indexOf(' ', lastPos)

if(pos == -1) //old format
	return sendFireBaseMessageDeleteChannelKeyDIRECTLY(meetObj.channelKey + "/DIVS/uniqueUUID_" + uniqueUUID)

divName = s.slice(lastPos, pos)

myWebRTChub.processNewDivObject(meetingUUID, divName, decodeURIComponent(s.slice(pos + 1)))	
	
}
//------------------------------------------
getMeetingUUIDfromChannelKey(channelKey)
{
for(let meetingUUID in registerChannelForUUIDpeers)
  if(registerChannelForUUIDpeers[meetingUUID] == channelKey)
	return meetingUUID
}
//------------------------------------------
registerChannelForUUIDpeersREALLY(meetingUUID, forceDelay)
{
  let meetObj = meetingsUUIDtoObject.get(meetingUUID)
  if(!meetObj)
     return 
  if(!meetObj.keyKeepPrivateSendPublicJWK)
	return setTimeout(function(){myWebRTChub.registerChannelForUUIDpeersREALLY(meetingUUID, forceDelay)},100)
		
  let channelName = registerChannelForUUIDpeers[meetingUUID]
  if(forceDelay === undefined && myMeetingRegisteredInFirebaseChannels[meetingUUID])
  	 return


  //forceDelay was replaced on executing after registering to database
  myMeetingRegisteredInFirebaseChannels[meetingUUID] = true
  const listeningMode = 1 //with 2 repeats calls then must place onlyUseRelayInWebRTC = true
  registerThisFirebaseChannel(channelName + "/ALL", false, undefined
	,function() {
		  registerThisFirebaseChannel(channelName + "/DIVS" , false, undefined, undefined, 8 /*child_added*/ + 16 /*child_removed*/ + 32 /*child_changed*/, myWebRTChub.callChannelNameDIVSchanged)
		  registerThisFirebaseChannel(channelName + "/" + myUUID(meetObj), false, undefined
			,function() 
				{
					myWebRTChub.sendMakeConnectionMessage(meetingUUID)
				}
			, listeningMode
			)
		}
	, listeningMode
	)
		  
}	
//---------------------------------------------------------------
myTurnServerDistances()
{
  let turnServerDistancesJSON = ""
  for(let [turnAssistant, objTextObj] of umniverseTurnAssistantsResponses)
	try
	{
		if(!objTextObj.obj)
		  objTextObj.obj = JSON.parse(objTextObj.text)
		let info = objTextObj.obj.result	
		if(turnServerDistancesJSON != "")
		  turnServerDistancesJSON += ","
		turnServerDistancesJSON += "{\"clusterNum\":\""+objTextObj.clusterNum+"\",\"time\":"+objTextObj.deltaTime+"}"
		let taInfo = {}
		taInfo.urls = "turn:" + info.serverInfo.ip + ":5349"
		taInfo.username = info.serverInfo.username
		taInfo.credential = info.serverInfo.password
		taInfo.deltaTime = objTextObj.deltaTime
		taInfo.clusterNum = objTextObj.clusterNum
	}
	catch(error)
	{
		console.log("error")
	}
   return "{\"servers\":[" + turnServerDistancesJSON + "]}" 
}
//---------------------------------------------
sendMakeConnectionMessage(meetingUUID, optionalTargetUUID = false)
{
	
  const meetObj = meetingsUUIDtoObject.get(meetingUUID)
  if(!meetObj)
	return
  meetObj.channelKey = registerChannelForUUIDpeers[meetingUUID]

let object = meetingUuid_later[meetingUUID]

  sendFireBaseMessageDIRECTLY(meetObj.channelKey + (optionalTargetUUID ? "/" + optionalTargetUUID : "/ALL") 
			, evaljscriptCommand("myWebRTChub.makeConnection(\""+meetingUUID+"\",\""+ myUUID(meetObj) + "\",\"" +  meetObj.keyKeepPrivateSendPublicJWK+ "\",\""+ meetObj.firstLocalUser.uuid +"\",\""+(object ? object.inviteeNotAll_later : "")+"\",\""+ (object ? object.username_later : "")+"\",'" + this.myTurnServerDistances() +"')")
			)
}
//----------------------------------------
sendFireBaseMessage(channelKey, message, doNotEncodeMessage, optionalTargetUUID)
{
	//EACH INSTANCE WRITES AT A CERTAIN DATABASE CHILD SO NO OVERWRITING OCCURS (without multiple events being fired)
	sendFireBaseMessageDIRECTLY(channelKey + (optionalTargetUUID ? "/" + optionalTargetUUID : "/ALL")
				, message, doNotEncodeMessage)
}
//---------------------------------------------
initializeCanvasToSendToPeers(localUser)
{
	
if(localUser.canvasToSendToPeers)
	return
	
let meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)

//audio tracks must be added first becuase of Firefox reordering
if(meetObj.emptyMediaStream)
	{
	if(!meetObj.destStreamDestination)
		meetObj.destStreamDestination = meetObj.audioContext.createMediaStreamDestination()	
		
	localUser.audioMediaStreamSource = meetObj.audioContext.createMediaStreamSource(meetObj.emptyMediaStream)
	localUser.audioMediaStreamSource.connect(meetObj.destStreamDestination)
	meetObj.activeMediaStreamSource = localUser.audioMediaStreamSource	
		
	if(localUser.isFirstLocalUser)
		{
		for(let track of meetObj.destStreamDestination.stream.getAudioTracks()) 
		  //OS AUDIO TRACKS DEVEM SER INDEPENDENTES entre utilizadores dos meetings!!!
			{
			meetObj.globalTracksToSend.push(track)
			localUser.streamToSend.addTrack(track)
			}
		myWebRTChub.myCreateAudioMeter(meetObj)
		meetObj.audioContext.activeLocalUser = localUser
		}
		else if(localUser.emptyMediaStream)
		{
		if(meetObj.audioContext.activeLocalUser)
			meetObj.audioContext.activeLocalUser.audioMediaStreamSource.disconnect()
		localUser.audioMediaStreamSource = meetObj.audioContext.createMediaStreamSource(localUser.emptyMediaStream)
		localUser.audioMediaStreamSource.connect(meetObj.destStreamDestination)
		meetObj.activeMediaStreamSource = localUser.audioMediaStreamSource	
		meetObj.alreadyInitiatedMyCreateAudioMeter = false
		myWebRTChub.myCreateAudioMeter(meetObj)
		meetObj.audioContext.activeLocalUser = localUser
		}
			
	}

if(localUser.isFirstLocalUser && meetObj.spareCanvas.length == 0)
  for(let c = 0; c < maxLocalUsersGlobalPerMeeting; c++)
	{
	let canvas = document.createElement("CANVAS")
	addToParkedNeverShown(canvas)
	meetObj.spareCanvas.push(canvas)
	
    //ATTENTION: in FIREFOX must call getContext() BEFORE captureStream()   ERROR IN FIREFOX!!!
	canvas.getContext("2d",{alpha:false})
	let stream = canvas.captureStream()
	let track = stream.getTracks()[0]
	meetObj.spareTracks.push(track)
	meetObj.globalTracksToSend.push(track)
	}

let c = localUser.numTrack - 1 //first is audio
	

let canvas = meetObj.spareCanvas[c]
let track = meetObj.spareTracks[c]
canvas.usedBy = localUser
localUser.spareCanvasUsed = canvas
canvas.videoTrackUsed = track
if(DEBUGtrueToFalse)
	localUser.streamToSend.addTrack(canvas.videoTrackUsed)


let containerVideoCanvas = $("#peersGlobalVideoSendDIV_main_"+localUser.uuid)
if(localUser.videoToSendToPeers)
  localUser.videoToSendToPeers.insertAdjacentElement("afterend", canvas) //screen share
else
  containerVideoCanvas[0].insertAdjacentElement("afterbegin", canvas) //canvas of user

canvas.style= "overflow:hidden;z-index:10;width:" + peersMainVideoWidth + ";height:" + peersMainVideoHeight
canvas.id= "canvasForPeersWebRTC_"+localUser.uuid

this.updateAllBordersIndicatingLocalUserActive()

$(canvas).addClass("canvasForPeersWebRTC") 
canvas.width = '120'
canvas.height = '120'
localUser.canvasToSendToPeers = canvas

/*
track.id = "my_" + c
track.label = "my_" + c
//track.contentHint = "my_" + c
track.myData = "my_" + c

const constraints = {
  advanced: [
    {width: 1920, height: 1280},
    {aspectRatio: 2.333}
  ]
};

track.applyConstraints(constraints)
*/

canvas.videoTrackUsed.enabled = true //after applyConstraints



//localUser.canvasToSendToPeers = $("#canvasForPeersWebRTC_"+localUser.uuid).show()[0]

$(".mySelfInMainScreen").css("display","inline-table")

//ATTENTION: in FIREFOX must call getContext() BEFORE captureStream()   ERROR IN FIREFOX!!!
localUser.ctxCanvasToSendToPeers = localUser.canvasToSendToPeers.getContext("2d",{alpha:false})

for(let uuid in meetingUuid_later)
	setTimeout("myWebRTChub.registerChannelForUUIDpeersREALLY(\""+uuid+"\")", 10)
meetingUuid_later = []

$(".peersGlobalVideoINSTRUCTIONS").fadeIn(1000)

setTimeout("$('.peersGlobalVideoINSTRUCTIONS').fadeOut(1000)", 2000)

if(!alreadyEnumeratedDevices)
	myWebRTChubEnumerateDevices() // to be used later



}
//------------------------------------------
addPeerVideoAsLocalStream(peerUUID)
{
let o = simplePeersObjects.get(peerUUID)

let videoStream = {}
videoStream.videoFromThisPeer = o 
videoStream.screenModeDx = o.screenModeDx
videoStream.screenModeDy = o.screenModeDy
videoStream.video = document.createElement("VIDEO")
videoStream.video.srcObject = newMediaStreamWithTracks ? new MediaStream(o.videoReceive.srcObject.getTracks()) : new MediaStream()
if(!newMediaStreamWithTracks)
  for(let track of o.videoReceive.srcObject.getTracks()) 
	videoStream.video.srcObject.addTrack(track)
			
videoStreamToCopyToCanvas.set(nextVideoStreamToCopyToCanvasLETTER, videoStream) 
lastVideoStreamToCopyToCanvas = videoStream
videoStream.fitType = "C"
videoStream.screenMode = "SCREEN_SHARE" 

videoStream.id = "videoStreamOfScreen"			
videoStream.letter = nextVideoStreamToCopyToCanvasLETTER
videoStream.cameraRects = new Map()

nextVideoStreamToCopyToCanvasLETTER = String.fromCharCode(nextVideoStreamToCopyToCanvasLETTER.charCodeAt(0) + 1)

videoStream.video.muted = true //to avoid echo (my own video does not need my voice!)
videoStream.video.play()

videoStream.description = "PEER " + o.username

//myWebRTChub.addActiveUserToVideoStreamCameraRect(activeLocalUser, videoStream)

myWebRTChub.refreshManageLocalUsersToSend()
		

}
//------------------------------------------
closeInitialCamera(meetingUUID, selector, remove, willUseItImmediatelly)
{
	let initialVideo = $(selector)[0]
	if(initialVideo && initialVideo.srcObject)
		{
		initialVideo.pause()
		let streamAndUses = mapVideoIDtoOrigStream.get(initialVideoID)
		if(streamAndUses)
			{
				streamAndUses.uses.delete(meetingUUID)
				if(streamAndUses.uses.size == 0 && !willUseItImmediatelly)
					mapVideoIDtoOrigStream.delete(initialVideoID)
			}
		if(!willUseItImmediatelly && (!streamAndUses || streamAndUses.uses === 0))
		  this.closeStream(initialVideo)
		initialVideo.srcObject = null
		}
	if(remove)
		$(selector).remove()
}
//------------------------------------------
getInitialCamera(meetingUUID, videoSelector)
{
	this.closeInitialCamera(meetingUUID, videoSelector)
	
	let streamAndUses
	
	let optionsWebRTChub = clone(optionsWebRTChubDONOTCHANGE)
	if(initialVideoID && initialVideoID != -1) //Edge returns "" before ALLOW
	  optionsWebRTChub.video.deviceId = initialVideoID
	if(onNewGetUserMediaChooseThisAudioInputDeviceID)
		{
	  	optionsWebRTChub.audio.deviceId = onNewGetUserMediaChooseThisAudioInputDeviceID
		onNewGetUserMediaChooseThisAudioInputDeviceID = undefined
		}

	if(!alreadyEnumeratedDevices)
	  myWebRTChubEnumerateDevices() 

	let video = $(videoSelector)
	if(video.length == 0)
	  return

	video[0].pause()
	video[0].srcObject = undefined

	video.css("display", "inline-table")[0].srcObject = undefined
	
	let getUserMediaSuccess = function(origStream, localUser)
	{
		
   //STUPID Apple designers:
   //SAFARI only allows one WebPage to capture video/audio then others are managed using the red camera icon!!!
   // https://bugs.webkit.org/show_bug.cgi?id=223198 NOT AN ERROR, IT IS BY DESIGN!!!!   

  	  const tracksOrigStream = origStream.getTracks()

		   
    /*ON SAFARI ONE PEER STOPS THE OTHER!!! if(!meetObj.streamToBeCloned)
		 
  		 let stream =  new MediaStream() //more flexible 
		 for(let track of tracksOrigStream) 
		   		stream.addTrack(track)	
	*/
			
		let stream = origStream
					   
		   for(let track of tracksOrigStream)
			  if(track.kind == "video")
				{
					initialVideoID = track.getSettings().deviceId
					streamAndUses = mapVideoIDtoOrigStream.get(initialVideoID)
					if(streamAndUses)
					   streamAndUses.uses.add(meetingUUID)
					else 
						mapVideoIDtoOrigStream.set(initialVideoID, {stream: origStream, uses: new Set([meetingUUID])})
					windowLocalStorageWrite("webRTChub_initialVideoID", initialVideoID) 
				}
	
			    myWebRTChub.videoDevicesIDthatFailed[initialVideoID] = false
			video[0].srcObject = stream
			video[0].play()
	}
	
 if(optionsWebRTChub.video && optionsWebRTChub.video.deviceId && optionsWebRTChub.video.deviceId)
 	streamAndUses = mapVideoIDtoOrigStream.get(optionsWebRTChub.video.deviceId)
 if(streamAndUses)
	getUserMediaSuccess(streamAndUses.stream)	
 else	
   {
	waitingForResponseGetUserMedia++	
	 //trying to know if getUserMedia is available gives problems in FireFox ONLINE (in localhost it works...!!!)
	 navigator.mediaDevices.getUserMedia(optionsWebRTChub)
	  .then(function(stream) 
	  {
		waitingForResponseGetUserMedia--
		getUserMediaSuccess(stream)
	  })
	.catch(function(err) 
	  {
		waitingForResponseGetUserMedia--
		myWebRTChub.videoDevicesIDthatFailed[initialVideoID] = true

		let select = $("#videoSourcePeers")[0]
		let idBefore
		for(let i = 0; i < select.children.length; i++)
			{
			let option = select.children[i]
			if(option && option.value != -1)
			  if(!initialVideoID || idBefore == initialVideoID)
				{
					initialVideoID = option.value
					myWebRTChub.getInitialCamera(meetingUUID, videoSelector)
					return
				}
				else idBefore = option.value
			}
    		showMessageOnSOSforDuration(TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[13]), 3000)
			video.hide()
	  })
   }
}
//------------------------------------------
reconnectVideoAudioOfUser(localUser, deviceVideo, deviceAudio)
{
	activeLocalUser = localUser

	const meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)
	
	let optionsWebRTChub = clone(optionsWebRTChubDONOTCHANGE)
	
	let videoIDparam = deviceVideo.deviceId
	let audioIDparam = deviceAudio.deviceId
	optionsWebRTChub.video.deviceId = videoIDparam
	optionsWebRTChub.audio.deviceId = audioIDparam //for it stays in cache with audio
	try
	{
	navigator.mediaDevices.getUserMedia(optionsWebRTChub)
	  .then(function(origStream) 
	  {
	
		myWebRTChub.videoDevicesIDthatFailed[videoIDparam] = false

		//after ALLOW can get more devices
		//myWebRTChubEnumerateDevices()
	
		try
		{
			let stream = newMediaStreamWithTracks ? new MediaStream(origStream.getTracks()) : new MediaStream() //ESSENTIAL: more flexible to add and remove streams!!!
			if(!newMediaStreamWithTracks)
			  for(let track of origStream.getTracks()) 
			      stream.addTrack(track)
			//ATTENTION: SAFARI does not work with track.clone()

			var tracks = stream.getTracks()
			 for(let i = 0; i < tracks.length; i++)
			   if(tracks[i].kind == "video")
				 lastIDofVideoDevicePeers = tracks[i].getSettings().deviceId
				 
			let streamAndUses = mapVideoIDtoOrigStream.get(lastIDofVideoDevicePeers)
			if(streamAndUses)
			  streamAndUses.uses.add(meetingUUID)
			else
			  mapVideoIDtoOrigStream.set(lastIDofVideoDevicePeers, {stream: origStream, uses: new Set([meetingUUID])})
			
			let videoStream = activeLocalUser.videoStream
			lastVideoStreamToCopyToCanvas = videoStream
			videoStream.deviceID = lastIDofVideoDevicePeers
		
			videoStream.video.autoplay =  true //must do this way
			$(videoStream.video).attr('playsinline', '') //must do this way !!!

			//videoStream.video.pause()
			videoStream.video.srcObject = stream
			videoStream.video.play()

			//when responds to this then can make Connection
			if(!activeLocalUser.videoStream)
				{
				activeLocalUser.dxToCopyFromCameraToCanvas = 0 //to be recalculated
				myWebRTChub.addActiveUserToVideoStreamCameraRect(activeLocalUser, videoStream, 1) //cameraRectNumber
			    }
			    
			myWebRTChub.afterGetUserMediaReconnectAudio(origStream, localUser)	
			    
			myWebRTChub.refreshManageLocalUsersToSend()

		}
		catch(error)
		{
			console.log('getUserMedia SUCCESS but error after: ', error.message, error.name)
			myWebRTChub.errorInAddGlobalAudioVideoStream(meetObj)
		}
	  })
	.catch(function(err) 
	  {
		console.log('getUserMedia FAILED : ', err.message, err.name)
	  })
	 }
	 catch(e)
	 {
			console.log('does not implement getUserMedia : ', e.message, e.name)
			myWebRTChub.errorInAddGlobalAudioVideoStream(meetObj)
	 }
	
}
//------------------------------------------
reconnectVideoOfUser(localUser, device)
{
	activeLocalUser = localUser
	
	let optionsWebRTChub = clone(optionsWebRTChubDONOTCHANGE)
	
	let videoIDparam = device.deviceId
	optionsWebRTChub.video = {}
	optionsWebRTChub.video.deviceId = videoIDparam
	optionsWebRTChub.audio = false //for it stays in cache with audio
	try
	{
	navigator.mediaDevices.getUserMedia(optionsWebRTChub)
	  .then(function(origStream) 
	  {
	
		myWebRTChub.videoDevicesIDthatFailed[videoIDparam] = false

		//after ALLOW can get more devices
		//myWebRTChubEnumerateDevices()
	
		try
		{
			let stream = new MediaStream() //ESSENTIAL: more flexible to add and remove streams!!!
			for(let track of origStream.getTracks()) 
			  if(track.kind == "video")
		   		stream.addTrack(track)
			//ATTENTION: SAFARI does not work with track.clone()

			var tracks = stream.getTracks()
			 for(let i = 0; i < tracks.length; i++)
			   if(tracks[i].kind == "video")
				 lastIDofVideoDevicePeers = tracks[i].getSettings().deviceId
				 
			let videoStream = activeLocalUser.videoStream
			lastVideoStreamToCopyToCanvas = videoStream
			videoStream.deviceID = lastIDofVideoDevicePeers
		
			videoStream.video.autoplay =  true //must do this way
			$(videoStream.video).attr('playsinline', '') //must do this way !!!

			//videoStream.video.pause()
			videoStream.video.srcObject = stream
			videoStream.video.play()

			//when responds to this then can make Connection
			if(!activeLocalUser.videoStream)
				{
				activeLocalUser.dxToCopyFromCameraToCanvas = 0 //to be recalculated
				myWebRTChub.addActiveUserToVideoStreamCameraRect(activeLocalUser, videoStream, 1) //cameraRectNumber
			    }
			myWebRTChub.refreshManageLocalUsersToSend()

		}
		catch(error)
		{
			console.log('getUserMedia SUCCESS but error after: ', error.message, error.name)
			myWebRTChub.errorInAddGlobalAudioVideoStream(meetObj)
		}
	  })
	.catch(function(err) 
	  {
		console.log('getUserMedia FAILED : ', err.message, err.name)
	  })
	 }
	 catch(e)
	 {
			console.log('does not implement getUserMedia : ', e.message, e.name)
			myWebRTChub.errorInAddGlobalAudioVideoStream(meetObj)
	 }
	
}
//------------------------------------------
reconnectAudioOfUser(localUser, device)
{
	activeLocalUser = localUser

	const meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)
	
	let optionsWebRTChub = clone(optionsWebRTChubDONOTCHANGE)

	
	let audioIDparam = device.deviceId
	optionsWebRTChub.audio = {}
	optionsWebRTChub.audio.deviceId = audioIDparam
	optionsWebRTChub.video = false
	try
	{
	navigator.mediaDevices.getUserMedia(optionsWebRTChub)
	  .then(function(origStream) 
	  {
	
		myWebRTChub.afterGetUserMediaReconnectAudio(origStream, localUser)	
		
	  })
	.catch(function(err) 
	  {
		console.log('getUserMedia FAILED : ', err.message, err.name)
	  })
	 }
	 catch(e)
	 {
			console.log('does not implement getUserMedia : ', e.message, e.name)
			myWebRTChub.errorInAddGlobalAudioVideoStream(meetObj)
	 }
	
}
//------------------------------------------
afterGetUserMediaReconnectAudio(origStream, localUser)	
	{
		//myWebRTChub.videoDevicesIDthatFailed[videoIDparam] = false

		//after ALLOW can get more devices
		//myWebRTChubEnumerateDevices()

	   const meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)


		try
		{

			for(let track of meetObj.emptyMediaStream.getAudioTracks()) 
				meetObj.emptyMediaStream.removeTrack(track)

			for(let track of origStream.getAudioTracks()) 
		   		{
				meetObj.globalTracksToSend.push(track)
				localUser.streamToSend.addTrack(track)
				meetObj.emptyMediaStream.addTrack(track)
				}

		/*	if(myWebRTChub.audioContext)
			  	myWebRTChub.audioContext.close() 
			meetObj.alreadyInitiatedMyCreateAudioMeter = false
			myWebRTChub.myCreateAudioMeter(meetObj)
			*/
			
	
	localUser.audioMediaStreamSource.disconnect()
	localUser.audioMediaStreamSource = meetObj.audioContext.createMediaStreamSource(origStream)
	localUser.audioMediaStreamSource.connect(meetObj.destStreamDestination)
	meetObj.activeMediaStreamSource = localUser.audioMediaStreamSource	
			
	meetObj.alreadyInitiatedMyCreateAudioMeter = false
	myWebRTChub.myCreateAudioMeter(meetObj)

	myWebRTChub.meetingsMicrophoneMuteNotUnmute(localUser.meetingUUID, undefined, true)					
	
	myWebRTChub.refreshManageLocalUsersToSend()
		}
		catch(error)
		{
			console.log('getUserMedia SUCCESS but error after: ', error.message, error.name)
			myWebRTChub.errorInAddGlobalAudioVideoStream(meetObj)
		}
	}
//------------------------------------------
addGlobalAudioVideoStream(meetingUUID, retrying, videoIDparam, createUser, defaultUsername, audioIDparam, localUserORuuid)
{

	let localUser = isString(localUserORuuid) ?  localUsersUUIDtoObject.get(localUserORuuid) : localUserORuuid	

	//gives microphone problems in 3D loading multiple VCs!!!
	if(false && waitingForResponseGetUserMedia)
	  return setTimeout(function(){myWebRTChub.addGlobalAudioVideoStream(meetingUUID, retrying, videoIDparam, createUser, defaultUsername, audioIDparam, localUser)}, 50)
	
	let meetObj = meetingsUUIDtoObject.get(meetingUUID || meetingIDselectedWebRTChub)
	
	if(setInitial_addGlobalAudioVideoStream)
	{
		let meetObj = meetingsUUIDtoObject.get(meetingUUIDtobeEntered)
		
		initialAudioID = meetObj && meetObj.alreadyCalledAddGlobal
		  					? initialAudioID = audioIDparam
							: initialAudioID = initialAudioID || audioIDparam
		if(initialAudioID)
			windowLocalStorageWrite("webRTChub_initialAudioID", initialAudioID) 

		
		initialVideoID = meetObj && meetObj.alreadyCalledAddGlobal
		  					? initialVideoID = videoIDparam
							: initialVideoID = initialVideoID || videoIDparam
		if(initialVideoID)
			windowLocalStorageWrite("webRTChub_initialVideoID", initialVideoID) 
		myWebRTChub.getInitialCamera(meetingUUID, setInitial_addGlobalAudioVideoStream)
		
		
		if(meetObj)
			meetObj.alreadyCalledAddGlobal = true	
		return true //it is a valid outcome
	}
	
	
	if(videoIDparam && videoIDparam.startsWith("PEER "))
	{
	  this.addPeerVideoAsLocalStream(videoIDparam.slice(5))
      return
	}
	
	if(localUser && !defaultUsername)
	  defaultUsername = localUser.username
	
	/*
	let videoStreamWithDeviceID = this.getVideoStreamFromDevicesID(videoIDparam)
	if(videoStreamWithDeviceID)
	   return this.createNewLocalUser(defaultUsername, true, videoStreamWithDeviceID)
   */

	  if(!retrying && meetObj.globalEmptyMediaStream)
		  return
		  
//		 var mixer = new MultiStreamsMixer([microphone1, microphone2]);
		  
//	  this.updateBottomBar()
	
	 showingPeersMyVideo = true

	let optionsWebRTChub = clone(optionsWebRTChubDONOTCHANGE)

	  let localUserInvited = meetingUUIDtoLocalUserInvited.get(meetObj.meetingUUID)
	  if(!videoIDparam && localUserInvited && meetObj.numLocalUsersInMeeting == 1)
		videoIDparam = localUserInvited.deviceIDvideoOrigStream

	  const videoID = videoIDparam || initialVideoID
	  
	  initialAudioID = undefined
	  if(videoID && videoID != -1)
		{
		optionsWebRTChub.video = {}
		optionsWebRTChub.video.deviceId = videoID
		
		if(!onNewGetUserMediaChooseThisAudioInputDeviceID
		    && !retrying)
		  onNewGetUserMediaChooseThisAudioInputDeviceID = this.getAudioDeviceIDFromVideoDeviceID(videoID)
		}
		
	  const audioID = audioIDparam || initialAudioID // old stuff || $("#audioSourcePeers").val()
                      	|| onNewGetUserMediaChooseThisAudioInputDeviceID
	  if(audioID && audioID != -1)
		{
		  optionsWebRTChub.audio = {}
		  optionsWebRTChub.audio.deviceId = audioID
		}

	  if(!alreadyEnumeratedDevices)
		myWebRTChubEnumerateDevices() 


	let getUserMediaSuccess = function(origStream, localUser)	
		{
	
		myWebRTChub.videoDevicesIDthatFailed[videoIDparam] = false
		//after ALLOW can get more devices
		myWebRTChubEnumerateDevices()

		try
		{
			
			let lastIDofVideoDevicePeers_ORIG_STREAM
			let lastIDofAudioDevicePeers_ORIG_STREAM

			const tracksOrigStream = origStream.getTracks()
			
			for(let i = 0; i < tracksOrigStream.length; i++)
			  if(tracksOrigStream[i].kind == "video")
				  lastIDofVideoDevicePeers_ORIG_STREAM = tracksOrigStream[i].getSettings().deviceId
			  else if(tracksOrigStream[i].kind == "audio")
				  lastIDofAudioDevicePeers_ORIG_STREAM = tracksOrigStream[i].getSettings().deviceId
			
			let streamAndUses = mapVideoIDtoOrigStream.get(lastIDofVideoDevicePeers_ORIG_STREAM)
			if(streamAndUses)
				streamAndUses.uses.add(meetingUUID)
			else
				mapVideoIDtoOrigStream.set(lastIDofVideoDevicePeers_ORIG_STREAM, {stream:origStream, uses: new Set([meetingUUID])})
			
			let videoStream 
			let letter 
			
			let canAddAnotherRect = true
			
			for (let [letter2, videoStream2] of videoStreamToCopyToCanvas)	
			  if(videoStream2.deviceID === lastIDofVideoDevicePeers_ORIG_STREAM)
				{
				letter = letter2	
				videoStream = videoStream2
				origStream = videoStream2.video.srcObject
				canAddAnotherRect = false
				}

			let stream = newMediaStreamWithTracks ? new MediaStream(origStream.getTracks()) : new MediaStream() //ESSENTIAL: more flexible to add and remove streams!!!
		    if(!newMediaStreamWithTracks)
		      for(let track of origStream.getTracks()) 
		   		stream.addTrack(track)

			//ATTENTION: SAFARI does not work with track.clone()

			if(!meetObj.globalEmptyMediaStream)
				meetObj.globalEmptyMediaStream = stream
			var tracks = stream.getTracks()
			 for(let i = 0; i < tracks.length; i++)
			  if(tracks[i].kind == "video")
					lastIDofVideoDevicePeers = tracks[i].getSettings().deviceId
			  else if(tracks[i].kind == "audio")
				  lastIDofAudioDevicePeers = tracks[i].getSettings().deviceId


			if(!letter)
			{
			videoStream = {}
			letter = nextVideoStreamToCopyToCanvasLETTER
	
			nextVideoStreamToCopyToCanvasLETTER = String.fromCharCode(nextVideoStreamToCopyToCanvasLETTER.charCodeAt(0) + 1)
			videoStreamToCopyToCanvas.set(letter, videoStream) 
			lastVideoStreamToCopyToCanvas = videoStream
			videoStream.deviceID = lastIDofVideoDevicePeers
			videoStream.fitType = "H"
			videoStream.screenMode = "NORMAL"
			
			videoStream.video = document.createElement("VIDEO")
			videoStream.video.srcObject = stream
			videoStream.id = "videoStreamToDetectFaces"			
			videoStream.letter = letter
			videoStream.video.autoplay =  true //must do this way
			$(videoStream.video).attr('playsinline', '') //must do this way !!!

			addToBodyPositionFixedTransformMicro(videoStream.video)

			videoStream.cameraRects = new Map()
			videoStream.video.muted = true //to avoid echo (my own video does not need my voice!)
			}
			
			meetObj.emptyMediaStream = stream
			if(createUser)
				localUser = myWebRTChub.createNewLocalUser(defaultUsername, true, videoStream) //letter + "1"
			else if(canAddAnotherRect)
				myWebRTChub.addOneCameraRectToVideoStream(letter)

			localUser.emptyMediaStream = stream
			
			if(!localUser.deviceIDvideoOrigStream)
			   {
				localUser.deviceIDvideoOrigStream = lastIDofVideoDevicePeers_ORIG_STREAM
				localUser.deviceIDaudioOrigStream = lastIDofAudioDevicePeers_ORIG_STREAM
			   }

			
			videoStream.video.play()

			if(localUser.zoomModeForFaceWebRTChub == "auto")
			{
				myWebRTChub.changedZoomModeForFaceWebRTChub("manual")
				myWebRTChub.changedZoomModeForFaceWebRTChub("auto")
			}

			//when responds to this then can make Connection
			if(localUser.videoStream != videoStream)
				{
				let letterBefore = localUser.videoStream && localUser.videoStream.letter
				localUser.dxToCopyFromCameraToCanvas = 0 //to be recalculated
				let cameraRectNumber = 1
				let localUserInvited = meetingUUIDtoLocalUserInvited.get(meetObj.meetingUUID)
				if(localUserInvited && localUser == meetObj.firstLocalUser)
                   cameraRectNumber = localUserInvited.videoStreamRectNumber
				myWebRTChub.addActiveUserToVideoStreamCameraRect(localUser, videoStream, cameraRectNumber) 
				myWebRTChub.removeVideoStream(letterBefore, undefined, true)
			    }
			myWebRTChub.refreshManageLocalUsersToSend()

		if(typeof myRemoteUmniverse === "object" && meetObj.meetingUUID == myRemoteUmniverse.uuid)
			myRemoteUmniverse.meetingHasStarted(meetObj)

		}
		catch(error)
		{
			console.log('getUserMedia SUCCESS but error after: ', error.message, error.name)
			myWebRTChub.errorInAddGlobalAudioVideoStream(meetObj)
		}
	  }
	 
	 let streamAndUses
	 if(optionsWebRTChub.video && optionsWebRTChub.video.deviceId && optionsWebRTChub.video.deviceId)
	 	streamAndUses = mapVideoIDtoOrigStream.get(optionsWebRTChub.video.deviceId)
	 if(streamAndUses)
		getUserMediaSuccess(streamAndUses.stream, localUser)	
	 else		
	 try
	 {
	 waitingForResponseGetUserMedia++
	 //trying to know if getUserMedia is available gives problems in FireFox ONLINE (in localhost it works...!!!)
	 navigator.mediaDevices.getUserMedia(optionsWebRTChub)
	  .then(function(origStream) 
	  	{
		waitingForResponseGetUserMedia--
		getUserMediaSuccess(origStream, localUser)	
		})
	.catch(function(err) 
	  {
		waitingForResponseGetUserMedia--
		console.log('getUserMedia FAILED : ', err.message, err.name)

		myWebRTChub.videoDevicesIDthatFailed[videoIDparam] = true
		if($("#topMenuGeneralUseMyWebRTChub").is(":visible"))
			{
			showMessageOnSOSforDuration(TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[13]), 3000)
			setTimeout("myWebRTChub.toggleSecondCameraShare(\"" + meetingUUID +"\")",3000)
			}
		
		let select = $("#videoSourcePeers")[0]
		let idBefore
		for(let i = 0; i < select.children.length; i++)
			{
			let option = select.children[i]
			if(option && option.value != -1)
			  if(!videoIDparam || idBefore == videoIDparam)
				{
					myWebRTChub.addGlobalAudioVideoStream(meetingUUID, true, option.value, undefined,  undefined,  undefined, localUser)
					return
				}
				else idBefore = option.value
			}
     	myWebRTChub.errorInAddGlobalAudioVideoStream(meetObj)
	  })
	 }	
	 catch(e)
	 {
			console.log('does not implement getUserMedia : ', e.message, e.name)
			myWebRTChub.errorInAddGlobalAudioVideoStream(meetObj)
	 }



 return true
}
//-------------------------------------------------------------
getVideoStreamFromDevicesID(videoID)
{
	if(videoID)
	  for (let [letter, videoStream] of videoStreamToCopyToCanvas)	
	    if(videoStream.deviceID == videoID)
			return videoStream

}
//-------------------------------------------------------------
errorInAddGlobalAudioVideoStream(meetObj)
{
if(!meetObj.globalEmptyMediaStream)
  {
	let canvas = document.createElement("CANVAS")
	canvas.width = 100
	canvas.height = 100
	
	//ATTENTION: in FIREFOX must call getContext() BEFORE captureStream()   ERROR IN FIREFOX!!!
	let ctx = canvas.getContext("2d",{alpha:false})
	ctx.fillStyle = '#fbb';
	ctx.fillRect(0, 0, 100, 100)

	meetObj.globalEmptyMediaStream = canvas.captureStream()
  }
myWebRTChub.initializeCanvasToSendToPeers(activeLocalUser)
myWebRTChub.resizeTwoCanvas(activeLocalUser)

console.log("ERROR in addGlobalAudioVideoStreamREALLY")
}
//--------------------------------------------
resizeTwoCanvas(localUser, doNotCallResize)
{
let width = localUser.dxToCopyFromCameraToCanvas
let height = localUser.dyToCopyFromCameraToCanvas

if(localUser.videoToSendToPeers)
{
localUser.videoToSendToPeers.width = width
localUser.videoToSendToPeers.height = height
}

if(width == 0 || !localUser.canvasToSendToPeers)
  return 

localUser.canvasToSendToPeers.width = width
localUser.canvasToSendToPeers.height = height
localUser.ctxCanvasToSendToPeers = localUser.canvasToSendToPeers.getContext("2d",{alpha:false})

if(webRTC_useCacheCanvas2)
{
	if(!localUser.canvasToSendToPeers2)
		localUser.canvasToSendToPeers2 = document.createElement("CANVAS")

	localUser.canvasToSendToPeers2.width = width
	localUser.canvasToSendToPeers2.height = height
	localUser.ctx2videoStreamToCopyToCanvas = localUser.canvasToSendToPeers2.getContext("2d",{alpha:false});
}

if(!doNotCallResize)
	resizeREALLY()
}
//------------------------------------------
redrawCanvasAsStream(localUser)
{
let meetingUUID = localUser.meetingUUID
let meetObj = meetingsUUIDtoObject.get(meetingUUID)

	
if(localUser.isWaitingForVideoStreamToCopyToCanvasDIMENSIONS 
		&& localUser.videoStream.video.videoWidth > 0) //sign that everything is ready and stable
{
	localUser.isWaitingForVideoStreamToCopyToCanvasDIMENSIONS = false
	
	this.updateCameraRectNumberWithUserNewDxDyXY(localUser)

	myWebRTChub.initializeCanvasToSendToPeers(localUser) //only now is ready for communication with peers
	
	myWebRTChub.resizeTwoCanvas(localUser)

	if(localUser.informOthersOfExtraUser)
	 for(let [key, o] of simplePeersObjects)
	  {
		localUser.informOthersOfExtraUser = false
		if(o.meetingUUID === localUser.meetingUUID)
		  if(o.oFirstOfPeer === o)
			myWebRTChub.sendCommandToPeers(o, "ADDED_EXTRA_USER", o.meetingUUID + " " + localUser.uuid + " " + myWebRTChub.stringMySettings(localUser, false, undefined, o.oFirstOfPeer))
	  }
	

	myWebRTChub.meetingsMicrophoneMuteNotUnmute(localUser.meetingUUID, undefined, true)	
		
	myWebRTChub.meetingsCameraMuteNotUnmute(localUser.meetingUUID, undefined)
	myWebRTChub.meetingsMicrophoneMuteNotUnmute(localUser.meetingUUID, undefined)
	//audio track enabled or not before adding
	
	if(!isIn3D) //HOURS AND DAYS TO FIND THIS ERROR!!!!
		$('.mySelfInMainScreen')[0].scrollIntoView()

	// must be quite late because of replaceTrack
	if(localUser.streamToSendToReplaceStreamToSend)
	  {
		localUser.streamToSend = localUser.streamToSendToReplaceStreamToSend
		localUser.streamToSendToReplaceStreamToSend = undefined
	  }

    setTimeout("myWebRTChub.resizeElementsWithPeersParticipant(undefined)"
			+ ";myWebRTChub.refreshManageLocalUsersToSend()", 25)
}
	
	
if(localUser.isWaitingForScreenStreamToCopyToCanvasDIMENSIONS 
		&& screenStreamToCopyToCanvas.videoWidth > 0)
  {
	localUser.isWaitingForScreenStreamToCopyToCanvasDIMENSIONS = false
	
    $(localUser.canvasToSendToPeers).css("width", currentWidthHeightPeersGlobalVideoSendDIV * screenStreamToCopyToCanvas.videoWidth / screenStreamToCopyToCanvas.videoHeight + "px")

    myWebRTChub.initializeCanvasToSendToPeers(localUser) 
	myWebRTChub.resizeTwoCanvas(localUser)

	myWebRTChub.changedToThisScreenMode(localUser)
	currentWidthToHeightRatioForCanvasVideoSend = screenStreamToCopyToCanvas.videoWidth / screenStreamToCopyToCanvas.videoHeight
  
	setTimeout("myWebRTChub.resizeElementsWithPeersParticipant(undefined)",25)
  }

if(!localUser.canvasToSendToPeers || !localUser.canvasToSendToPeers.width)
  return

let ctx = webRTC_useCacheCanvas2 && localUser.ctx2videoStreamToCopyToCanvas
		? localUser.ctx2videoStreamToCopyToCanvas 
		: localUser.ctxCanvasToSendToPeers

if(!ctx)	
  return
	


let clipFinalCanvas = false //true should be faster but in Chrome final image gets vertical stripes!!!

ctx.save() //one day remove .sabe and .restore cause they say they are slow!

let drawCameraVideo = peersCameraActive // draws but does not send, informs user on button top left !localUser.cameraMuted

localUser.dxToDrawCameraVideoOnScreenShare = localUser.canvasToSendToPeers.width
localUser.dyToDrawCameraVideoOnScreenShare = localUser.canvasToSendToPeers.height


if(localUser.videoToSendToPeers) //screen share
{
	ctx.fillStyle = 'rgba(0,0,0,0)'
	ctx.fillRect(0, 0, localUser.canvasToSendToPeers.width, localUser.canvasToSendToPeers.height)
}
else if(!peersCameraActive || localUser.cameraMuted)
{
	ctx.fillStyle = '#000'
	ctx.fillRect(0, 0, localUser.canvasToSendToPeers.width, localUser.canvasToSendToPeers.height)
}


if(drawCameraVideo)
{
	if(!clipFinalCanvas && localUser.circledGlobalVideoForPeers == 50)
	{
	//before clipping
	ctx.fillStyle = localUser.circledAndTrianglesColors[0] 
	ctx.fillRect(localUser.xToDrawCameraVideoOnScreenShare, localUser.yToDrawCameraVideoOnScreenShare, localUser.dxToDrawCameraVideoOnScreenShare, localUser.dyToDrawCameraVideoOnScreenShare)

	//now clips!
	ctx.beginPath();
	let halfX = localUser.xToDrawCameraVideoOnScreenShare + localUser.dxToDrawCameraVideoOnScreenShare / 2
	let halfY = localUser.yToDrawCameraVideoOnScreenShare + localUser.dyToDrawCameraVideoOnScreenShare / 2
	ctx.arc(halfX, halfY, localUser.dxToDrawCameraVideoOnScreenShare / 2, 0, 2*Math.PI);
	ctx.clip();
	}
}

if(localUser.myVideoIsBlackAndWhite)
	ctx.globalCompositeOperation='source-atop';


if(!drawCameraVideo 
	|| localUser.videoToSendToPeers //screen share
	)
	{
	//nothing
	}
else if(localUser.videoStream)
  { 
	if(localUser.videoStream.video.videoWidth)
	{
	if(localUser.dxToCopyFromCameraToCanvas == 0)
		{
		$("#zoomCameraRange1to10").val(1)
		$("#dxMyCameraRangeMinus100plus100").val(0)
		$("#dyMyCameraRangeMinus100plus100").val(0)
		}

	if(localUser.rotatedGlobalVideoForPeers != 0)
	{
	// move to the center of the canvas
	//dxOrig = -videoStreamToCopyToCanvas.videoWidth / 2
	//dyOrig = -videoStreamToCopyToCanvas.videoHeight / 2

	switch(localUser.rotatedGlobalVideoForPeers)
	  {
	  case 1: ctx.translate(localUser.dxToDrawCameraVideoOnScreenShare + localUser.yToDrawCameraVideoOnScreenShare + localUser.xToDrawCameraVideoOnScreenShare,
			   localUser.yToDrawCameraVideoOnScreenShare - localUser.xToDrawCameraVideoOnScreenShare)
	      	break
	  case 2: ctx.translate(localUser.dxToDrawCameraVideoOnScreenShare + 2 * localUser.xToDrawCameraVideoOnScreenShare, 
			  				localUser.dyToDrawCameraVideoOnScreenShare + 2 * localUser.yToDrawCameraVideoOnScreenShare)
	  		break
	  case 3: ctx.translate( -localUser.yToDrawCameraVideoOnScreenShare + localUser.xToDrawCameraVideoOnScreenShare, 
			  				localUser.dyToDrawCameraVideoOnScreenShare + localUser.xToDrawCameraVideoOnScreenShare + localUser.yToDrawCameraVideoOnScreenShare); break
	  }
	ctx.rotate(localUser.rotatedGlobalVideoForPeers * 90 * Math.PI/180);
	}
	
	if(localUser.videoStream.videoWidthBefore != localUser.videoStream.video.videoWidth
	   || localUser.videoStream.videoHeightBefore != localUser.videoStream.video.videoHeight)
	{
	localUser.videoStream.videoWidthBefore = localUser.videoStream.video.videoWidth
	localUser.videoStream.videoHeightBefore = localUser.videoStream.video.videoHeight
	this.fitManyCameraRects(localUser.videoStream)
	this.refreshManageLocalUsersToSend()
	}
	
	ctx.drawImage(localUser.videoStream.video
			, localUser.dxDeltaToCopyFromCameraToCanvas 
			, localUser.dyDeltaToCopyFromCameraToCanvas 
			, localUser.dxToCopyFromCameraToCanvas, localUser.dyToCopyFromCameraToCanvas
			
			, localUser.xToDrawCameraVideoOnScreenShare
			, localUser.yToDrawCameraVideoOnScreenShare
			, localUser.dxToDrawCameraVideoOnScreenShare, localUser.dyToDrawCameraVideoOnScreenShare
		)
		
	if(nextRectOfHeadForAvatarWebRTChub[localUser.numLocalUser] && !localUser.isInFaceDetectionModeWebRTChubScreenSharing)
	{	
		if(localUser.zoomModeForFaceWebRTChub != "manual")
			myWebRTChub.autoRecalculateDxDyAndDeltasAndZoom(localUser) //adapts little by little
		if(localUser.zoomModeForFaceWebRTChub === "draw")	
		{
		ctx.beginPath();
		ctx.lineWidth = "4";
		ctx.strokeStyle = "red";
		

		let rx = (nextRectOfHeadForAvatarWebRTChub[localUser.numLocalUser].x - nextRectOfHeadForAvatarWebRTChub[localUser.numLocalUser].width / 2) * localUser.dxToDrawCameraVideoOnScreenShare / localUser.videoStream.video.videoWidth   //+ dxDeltaToCopyFromCameraToCanvas * videoStreamToCopyToCanvas.videoWidth / dxToDrawCameraVideoOnScreenShare
		let ry = (nextRectOfHeadForAvatarWebRTChub[localUser.numLocalUser].y - nextRectOfHeadForAvatarWebRTChub[localUser.numLocalUser].height / 2) * localUser.dyToDrawCameraVideoOnScreenShare / localUser.videoStream.video.videoHeight - dyDeltaToCopyFromCameraToCanvas 
		ctx.rect(rx
				, ry
				, nextRectOfHeadForAvatarWebRTChub[localUser.numLocalUser].width
				, nextRectOfHeadForAvatarWebRTChub[localUser.numLocalUser].height);
		ctx.stroke();
		}
	}
	
	if(localUser.rotatedGlobalVideoForPeers != 0)
		ctx.setTransform(1,0,0,1,0,0)
	}
  }
else
	{
	ctx.fillStyle = '#fbb';
	ctx.fillRect(0, 0, localUser.canvasToSendToPeers.width, localUser.canvasToSendToPeers.height);
	}



let zoomDxToSendToPeers = localUser.dxToDrawCameraVideoOnScreenShare
let zoomDyToSendToPeers = localUser.dyToDrawCameraVideoOnScreenShare


let hexaDx = localUser.shapeAroundOctogonalOrHexagonal === "octogonal" ? zoomDxToSendToPeers / 20 : zoomDxToSendToPeers / 10
let hexaDy = localUser.shapeAroundOctogonalOrHexagonal === "octogonal" ? zoomDyToSendToPeers / 20 : zoomDyToSendToPeers / 10
hexaDx = Math.min(hexaDx, hexaDy)
hexaDy = hexaDx

let hexaHalfDy = zoomDyToSendToPeers / 2  //dx not needed
let hexaOneThirdDx = zoomDxToSendToPeers / 3 - hexaDx
let hexaOneThirdDy = zoomDyToSendToPeers / 3 - hexaDy


if(localUser.myVideoIsBlackAndWhite)
{
let globalCompositeOperationBEFORE = ctx.globalCompositeOperation
let globalAlphaBEFORE = ctx.globalAlpha
ctx.globalCompositeOperation='color';
ctx.fillStyle = "white";
ctx.globalAlpha = 1;  // alpha 0 = no effect 1 = full effect
ctx.fillRect(0, 0, localUser.canvasToSendToPeers.width, localUser.canvasToSendToPeers.height);
ctx.globalCompositeOperation = globalCompositeOperationBEFORE
ctx.globalAlpha = globalAlphaBEFORE
}



if(localUser.circledGlobalVideoForPeers == 0)
{

	  hexaOneThirdDx = hexaOneThirdDx
	  hexaOneThirdDy = Math.min(hexaOneThirdDx, hexaOneThirdDy)
	  hexaOneThirdDx = hexaOneThirdDy
	  hexaHalfDy = hexaHalfDy

	  let yHexaOneThirdOrHalf = localUser.shapeAroundOctogonalOrHexagonal === "octogonal" ? hexaOneThirdDy : hexaHalfDy
	  
	  if(localUser.showNotHideCornersOfVideoToSend[1])
		  CTXtriangle(ctx, localUser.circledAndTrianglesColors[1], undefined, 0, 0
					, hexaOneThirdDx, 0
					, 0, yHexaOneThirdOrHalf)
	  
	  if(localUser.showNotHideCornersOfVideoToSend[2])
		  CTXtriangle(ctx, localUser.circledAndTrianglesColors[2], undefined, zoomDxToSendToPeers  - hexaOneThirdDx, 0
					, zoomDxToSendToPeers , 0
					, zoomDxToSendToPeers , yHexaOneThirdOrHalf)
	  
	  if(localUser.showNotHideCornersOfVideoToSend[3])
		  CTXtriangle(ctx, localUser.circledAndTrianglesColors[3], undefined, zoomDxToSendToPeers, localUser.yToDrawCameraVideoOnScreenShare + zoomDyToSendToPeers - yHexaOneThirdOrHalf
					, zoomDxToSendToPeers, zoomDyToSendToPeers
					, zoomDxToSendToPeers - hexaOneThirdDx, zoomDyToSendToPeers)
	  if(localUser.showNotHideCornersOfVideoToSend[4])
		  CTXtriangle(ctx, localUser.circledAndTrianglesColors[4], undefined, 0, zoomDyToSendToPeers - yHexaOneThirdOrHalf
					, hexaOneThirdDx, zoomDyToSendToPeers
					, 0, zoomDyToSendToPeers)
										  
}

if(clipFinalCanvas && localUser.circledGlobalVideoForPeers == 50)
{
ctxCanvasToSendToPeers.save()
//before clipping
ctxCanvasToSendToPeers.fillStyle = '#fff';
ctxCanvasToSendToPeers.fillRect(0, 0, dxdyToSendToPeers, dxdyToSendToPeers);

//now clips!
ctxCanvasToSendToPeers.beginPath();
let half = dxdyToSendToPeers / 2
ctxCanvasToSendToPeers.arc(half,half,half,0, 2*Math.PI);
ctxCanvasToSendToPeers.clip();
}

ctx.restore() //one day remove .sabe and .restore cause they say they are slow!

if(localUser.emotionSelectedGlobalForPeers)
{
	 let image = imagesOfEmotions[localUser.emotionSelectedGlobalForPeers]
	 if(image && image.loaded)
	 	 ctx.drawImage(image, 2 , 2, image.width * 8 / 5, image.height * 8 / 5
			   , localUser.xToDrawCameraVideoOnScreenShare, localUser.yToDrawCameraVideoOnScreenShare
			   , hexaOneThirdDx, hexaOneThirdDy
	 	       )
}

if(localUser.iconSelectedGlobalForPeers)
{
	 let image = imagesOfIcons[localUser.iconSelectedGlobalForPeers]
	 if(image && image.loaded)
		 {
		 ctx.drawImage(image, 2, 2, image.width * 6/ 5, image.height * 6 / 5 
			   , zoomDxToSendToPeers - hexaOneThirdDx * 19 / 24, localUser.yToDrawCameraVideoOnScreenShare
			   , hexaOneThirdDx, hexaOneThirdDy
	 	       )
		 }
}
if(localUser.questionMarkCornerShow)
{	
	 let image = localUser.imageOfQuestionMark
	 if(image && image.loaded)
	 	 ctx.drawImage(image, -80 , -300, image.width * 8 / 5, image.height * 8 / 5
			   , localUser.xToDrawCameraVideoOnScreenShare, zoomDyToSendToPeers - hexaOneThirdDy * 19 / 24
			   , hexaOneThirdDx, hexaOneThirdDy
	 	       )
}

if(localUser.URLlinkCornerShow)
{	
	 let image = localUser.imageOfURLlink
	 if(image && image.loaded)
	 	 ctx.drawImage(image, 0 , -4, image.width * 7 / 5, image.height * 7 / 5
			   , zoomDxToSendToPeers - hexaOneThirdDx * 19 / 24, zoomDyToSendToPeers - hexaOneThirdDy * 19 / 24
			   , hexaOneThirdDx, hexaOneThirdDy
	 	       )
}


if(showMyVideoInScreenSharing3x3pos !== undefined
    && localUser.screenMode == "SCREEN_SHARE"
	&& !localUser.isWaitingForScreenStreamToCopyToCanvasDIMENSIONS)
{ 
	if(activeLocalUser.screenMode == "NORMAL" 
		&& activeLocalUser.canvasToSendToPeers
		&& $("#webrtchub_activeInOverlap")[0].checked)
		localUserOverdraw = activeLocalUser
	else if(!localUserOverdraw || localUserOverdraw.screenMode != "NORMAL") //may have changed
  		for(let [uuid2, localUser2] of localUsersUUIDtoObject)
		  if(localUser2.meetingUUID == meetingUUID && localUser2.screenMode == "NORMAL")
			{
				localUserOverdraw = localUser2
				break
			}
	
	screenStreamToCopyToCanvas = localUserOverdraw.canvasToSendToPeers
	screenStreamToCopyToCanvas.videoWidth = localUser.dxToCopyFromCameraToCanvas
	screenStreamToCopyToCanvas.videoHeight = localUser.dyToCopyFromCameraToCanvas
	
	if(localUser.isInFaceDetectionModeWebRTChubScreenSharing && lastDetectionAll)
		for(let b = 0; b < lastDetectionAll.length; b++)
			{
			ctx.beginPath();
			ctx.lineWidth = "4";
			ctx.strokeStyle = "red"//kelly_colors_hex[b]
			let rect = lastDetectionAll[b].alignedRect.box

			let rx = rect.x
			let ry = rect.y
			ctx.rect(rx
					, ry
					, rect.width
					, rect.height);
			ctx.stroke();
			}
		
	drawCameraVideo = showMyVideoInScreenSharing3x3pos !== undefined
	
	let xToDrawCameraVideoOnScreenShare
	let yToDrawCameraVideoOnScreenShare
	let dxDeltaToCopyFromCameraToCanvas = 0
	let dyDeltaToCopyFromCameraToCanvas = 0
	
	
	let dxToDrawCameraVideoOnScreenShare = Math.min(screenStreamToCopyToCanvas.videoWidth, screenStreamToCopyToCanvas.videoHeight) / 3 * zoomVideoCameraProjectingOverScreenSharing
	let dyToDrawCameraVideoOnScreenShare = Math.min(screenStreamToCopyToCanvas.videoHeight, screenStreamToCopyToCanvas.videoWidth) / 3 * zoomVideoCameraProjectingOverScreenSharing

	switch(showMyVideoInScreenSharing3x3pos)
	{
	case -4: xToDrawCameraVideoOnScreenShare = 0; 
			 yToDrawCameraVideoOnScreenShare = 0; 
			 break
	case -3: xToDrawCameraVideoOnScreenShare = (screenStreamToCopyToCanvas.videoWidth - dxToDrawCameraVideoOnScreenShare) / 2 
			 yToDrawCameraVideoOnScreenShare = 0
			 break
	case -2: xToDrawCameraVideoOnScreenShare = screenStreamToCopyToCanvas.videoWidth - dxToDrawCameraVideoOnScreenShare
	 		 yToDrawCameraVideoOnScreenShare = 0
	 		 break
	case -1: xToDrawCameraVideoOnScreenShare = 0
			 yToDrawCameraVideoOnScreenShare = (screenStreamToCopyToCanvas.videoHeight - dxToDrawCameraVideoOnScreenShare) / 2
			 break
	case 0:  xToDrawCameraVideoOnScreenShare = (screenStreamToCopyToCanvas.videoWidth - dxToDrawCameraVideoOnScreenShare) / 2
	 		 yToDrawCameraVideoOnScreenShare = (screenStreamToCopyToCanvas.videoHeight - dyToDrawCameraVideoOnScreenShare) / 2
	 		 break
	case 1: xToDrawCameraVideoOnScreenShare = screenStreamToCopyToCanvas.videoWidth - dxToDrawCameraVideoOnScreenShare
	 		yToDrawCameraVideoOnScreenShare = (screenStreamToCopyToCanvas.videoHeight - dyToDrawCameraVideoOnScreenShare) / 2
	 		break
	case 2: xToDrawCameraVideoOnScreenShare = 0
			yToDrawCameraVideoOnScreenShare = screenStreamToCopyToCanvas.videoHeight - dyToDrawCameraVideoOnScreenShare
			break
	case 3: xToDrawCameraVideoOnScreenShare = (screenStreamToCopyToCanvas.videoWidth - dxToDrawCameraVideoOnScreenShare) / 2
			yToDrawCameraVideoOnScreenShare = screenStreamToCopyToCanvas.videoHeight - dyToDrawCameraVideoOnScreenShare
			break
	case 4: xToDrawCameraVideoOnScreenShare = screenStreamToCopyToCanvas.videoWidth - dxToDrawCameraVideoOnScreenShare
			yToDrawCameraVideoOnScreenShare = screenStreamToCopyToCanvas.videoHeight - dyToDrawCameraVideoOnScreenShare
			break
	}
	
		ctx.drawImage(screenStreamToCopyToCanvas
			, dxDeltaToCopyFromCameraToCanvas 
			, dyDeltaToCopyFromCameraToCanvas 
			, screenStreamToCopyToCanvas.width, screenStreamToCopyToCanvas.height
			
			, xToDrawCameraVideoOnScreenShare
			, yToDrawCameraVideoOnScreenShare
			, dxToDrawCameraVideoOnScreenShare, dyToDrawCameraVideoOnScreenShare
		)

	
}

if(webRTC_useCacheCanvas2 
	&& ctx != localUser.ctxCanvasToSendToPeers)
  localUser.ctxCanvasToSendToPeers.drawImage(localUser.canvasToSendToPeers2, 0, 0)

if(clipFinalCanvas && localUser.circledGlobalVideoForPeers == 50)
	localUser.ctxCanvasToSendToPeers.restore()

}
//------------------------------------------
addAudioVideoStream(selector, useGlobal)
{
	const o = simplePeersObjects.get(selector)
	if(!o)
		alert("selector not found")
	else if(o.stream) {} //alert("already streaming")
	else if(!o.peer)
		 alert("peer not created")
    else if(useGlobal)
	    {
    	//o.peer.removeStream(o.stream)
		//o.stream = undefined
		
//    	if(!o.stream)
    		{
       		//o.stream = videoPeersMyVideoAudio.srcObject
       		myWebRTChub.myAddStreamTrackByTrack(o.peer, o.stream)
        	}
		}
    else
    {
	  let optionsWebRTChub = clone(optionsWebRTChubDONOTCHANGE)
	  waitingForResponseGetUserMedia++
      navigator.mediaDevices.getUserMedia(optionsWebRTChub)
	  .then(function(stream) 
	  {
		waitingForResponseGetUserMedia--
		o.stream = stream
		myWebRTChub.myAddStreamTrackByTrack(o.peer, stream)
	  })
	.catch(function(err) 
	  {
	  waitingForResponseGetUserMedia--
	  alert("getUserMedia ERROR")
	  });
    }
//navigator.getUserMedia({ video: true, audio: true }, addMedia, () => {})
}
//-------------------------------------------
executeActionWithPeer(popupName, peer, close)
{
mapUsePopupToChoosePeersForAction[popupName](peer)	
if(close)
  dismissPopup1(popupName)
}
//-------------------------------------------
usePopupToChoosePeersForAction(title, defaultMeetingUUID, functionAction, popupName)
{
let uuid = generateUUID()
if(!popupName)
  popupName = uuid
popupName = defaultMeetingUUID + " " + popupName

if(dismissPopup1(popupName))
  return 

mapUsePopupToChoosePeersForAction[popupName] = functionAction

let close = "dismissPopup1(\""+popupName+"\")"

let s = "<table><tr><td>" + title + "</td><td onClick='"+close+"' style='cursor:pointer'><b style='color:#f00'>X</b></td></tr></table><br>"
let numPeers = 0

for(let [meetingUUID, meetObj] of meetingsUUIDtoObject)
 if(!meetObj.notYetUsable)
 {
   let peersBefore = numPeers
   let tableStr = "<table border='1' style='background-color:"+meetObj.bkColor+";color:"+meetObj.inkColor+";margin:3px'><tr><th>M" + meetObj.number + "</th><th class='td_"+uuid+"'><input class='main_checkbox_"+uuid+"_"+ meetingUUID +"' onClick='$(\".checkbox_"+uuid+"_"+ meetingUUID+ "\").prop(\"checked\", this.checked)' type='checkbox' "+(meetingUUID == defaultMeetingUUID ? "checked" : "")+"></th></tr>"

   for(let [key, o] of simplePeersObjects)	
    {
	if(o.meetingUUID != meetingUUID || o.meetingWithUUID.indexOf("_") != -1)
		continue
	numPeers++
	tableStr += "<tr><td><button class='username_"+o.meetingWithUUID+"' onClick='myWebRTChub.executeActionWithPeer(\""+popupName+"\",\""+ o.uuid +"\", true);"+close+"' style='width:100%'>" + o.username + "</button></td><td class='td_"+uuid+"'><input class='checkbox_"+uuid+" checkbox_"+uuid+"_"+ meetingUUID +"' onClick='checkParentCheckBoxWithChildren(\".main_checkbox_"+uuid+"_"+ meetingUUID+"\",\".checkbox_"+uuid+"_"+ meetingUUID+ "\")' type='checkbox' "+(meetingUUID == defaultMeetingUUID ? "checked" : "")+" peerUUID='"+o.uuid+"'></td></tr>"
	}
	
   tableStr += "</table>"
   
   if(numPeers > peersBefore)
     s += tableStr
 }	

if(numPeers == 0)
  return showMessageOnSOSforDuration(TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[56]), 3000)

let element = getPopup1(popupName)

if(numPeers > 1)
  s += "<br><br><button onCLick='let arr=$(\".checkbox_"+uuid+":checkbox:checked\");if(arr.length==0)return; for(let i=0;i<arr.length;i++)myWebRTChub.executeActionWithPeer(\""+popupName+"\",$(arr[i]).attr(\"peerUUID\"));"+close+"'>" + title + "</button>"
	
$(element).html(s).show()

if(numPeers == 1)
  $(".td_"+uuid).hide()

}
//-------------------------------------------
sendSelectorOrElementToOthers(selectorOrElement, meetingUUID)
{
this.usePopupToChoosePeersForAction(TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[55]), meetingUUID
			, function(peer){myWebRTChub.sendCommandToPeers(peer, "INSERT_HTML", selectorOrElement + " " + $(selectorOrElement).html())}
			, selectorOrElement)
}
//-------------------------------------------
//SAME PARAM AS IN inviteToInstantTalk
inviteToInstantTalk(meetingUUID, username = "?", inviteeNotAll, extraHTMLinfo, optionsObject = {}, cryptoChannel, linkORadvancedParamJSON, shortLink)
{
	let rri = new RequestResponseInfo()
	
	const divName = webrtcDivName(meetingUUID)
	
	processDialectToLanguageCounterCodeMAP()

	if(cryptoChannel)
		registerChannelForUUIDpeers[meetingUUID] = cryptoChannel
	
	this.closeInitialCamera(meetingUUID, "#initial_camera_" + meetingUUID, true, true)
		
	if(peersUUIDtoUserNames[meetingUUID])
	{
		typesDivsSelect(undefined, webrtcDivName(meetingUUID))
		return
	}   

	peersUUIDtoUserNames[meetingUUID] = username
			
	if(inviteeNotAll === undefined)
		inviteeNotAll = ""
			
			
	meetingUuid_later[meetingUUID] = {  username_later: username,	inviteeNotAll_later: inviteeNotAll }

	nextNewDivOccupiesPlaceOfThisDivName = "webrtchub_landing_page_" + meetingUUID.replaceAll("-", "")
	delete evalsOfDivsOnClosing[nextNewDivOccupiesPlaceOfThisDivName]//not to close meeting!!!
	this.updateBottomBar(meetingUUID)

	this.createWebRTChubDIV(meetingUUID, linkORadvancedParamJSON, username)
	addThisDivnameToLastDivsNameOfDivActedUpon(divName)
	let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	if(shortLink)
       meetObj.shortLink = shortLink
	meetingsUUIDtoObject.get(meetingUUID).optionsObject = optionsObject
	
	this.addExtraInfoToMeeting(meetingUUID, extraHTMLinfo)

   $("divEmcopassingPAGE_" + meetingUUID).find(".SHOW_THIS_WHEN_IN_WEBRTC").show()


  //toggle3D(undefined, false)
  if(isIn3D)
	this.setMeetingInItsPlace(meetObj)
  else
  	typesDivsSelect(undefined, divName)

  nogoLinkEditor.processWalkWithPhotos(meetObj)

  let videoID = meetObj.paramRevertAndApplyJSONstring.o.utube
  if(videoID)
	{
	let url = fromVideoIDtoURL(videoID)	
  	let params = {}
  	params.meetingUUID = meetingUUID
    params.meetingWithUUID = meetingUUID + "_" + "utubeConf"
  	params.playerUUID = "utubeconf_" + meetingUUID + "_" + videoID
    params.doNotOpenSidebar = true
	params.sharedAmongAll = true
  /*
  params.name = usernameOfYoutube
  params.lastTime = myLastTime
  params.lastState = myLastState 
	*/
  processThisLinkYOUTUBE(undefined, url, params)

	}

}
//-----------------------------------------------------------
addExtraInfoToMeeting(meetingUUID, extraHTMLinfo, divUniqueID)
{
if(divUniqueID && (divUniqueID.charAt(0) == '.' || divUniqueID.charAt(0) == '#'))
	divUniqueID = divUniqueID.slice(1)
let div = divUniqueID ? $("#" + divUniqueID)[0] : undefined
if(extraHTMLinfo)
  {
  if(div)
    $(div).html(extraHTMLinfo)
  else
    $("#divEmcopassingAll_INSIDE"+meetingUUID)[0].insertAdjacentHTML("afterbegin", "<div "+ (divUniqueID ? "id='"+divUniqueID+"'" : "") + " class='BORDER_RADIUS_7' style='display:inline-table;vertical-align:middle;padding:0.5em;background-color:#fff'>" + extraHTMLinfo + "</div>")
  }
else if(div)
  removeAndEmpty(div)
}
//-----------------------------------------------------------
orderOfMeeting(meetObjORmeetingUUID, setMeetObj)
{
let meetObj = isString(meetObjORmeetingUUID) ? meetingsUUIDtoObject.get(meetObjORmeetingUUID) : meetObjORmeetingUUID
let numPlace3D
try
{
if(meetObj.numPlace3D !== undefined)
	numPlace3D = meetObj.numPlace3D
else
{

const orderOfPlaces = [151, 152, 153, 154, 155, 156, 157 //meetings first line (bottom)
					  ,166, 165, 164, 163, 162, 161, 160  //meetings second line (top)
					  ,105, 110, 115, 120, 125, 130, 135  // green top line	
		              ,106, 111, 116, 121, 126, 131, 136  // green bottom line
		              ]
let numOrder = 0

numPlace3D = mapMeetingToNumPlace3D.get(meetObj.meetingUUID)
if(numPlace3D && numPlace3D !== "undefined")
	  return numPlace3D
  
if(numPlace3D === "undefined" || numPlace3D === undefined || myWebRTChub.meetingInThisPlace3D(numPlace3D))
	numPlace3D = orderOfPlaces[numOrder]

while(true)
{
if(myWebRTChub.numPlace3DtoMeetingUUID(numPlace3D)
  || numTransferedToThisPlace(numPlace3D) > 0)
  {
	numOrder++
	numPlace3D = orderOfPlaces[numOrder]
  }
else
  break
}

}

return numPlace3D 
	
}
finally
{
  if(setMeetObj)
  {
	meetObj.numPlace3D = numPlace3D
	mapMeetingToNumPlace3D.set(meetObj.meetingUUID, numPlace3D)	
  }
}

	
}
//-----------------------------------------------------------
numPlace3DtoMeetingUUID(numPlace3D)
{
for(let [meetingUUID, numPlace] of mapMeetingToNumPlace3D)
  if(numPlace === numPlace3D)
  	return meetingUUID
}
//-----------------------------------------------------------
removeLocalUser(localUserORuuid, force)
{
let localUser = isString(localUserORuuid) ?  localUsersUUIDtoObject.get(localUserORuuid) : localUserORuuid	
let uuid = localUser.uuid

let meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)

if(!force && localUser == meetObj.firstLocalUser)
  showMessageOnSOSforDuration(TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[51]), 3000)
else if(force || confirm( removeFontAroundTranslation(TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[68])) + "?"))
{

removeAndEmpty("#mySelfInMainScreen_" + uuid)
removeAndEmpty(".belongs_to_localUser_" + uuid) //all that must be closed of this localUser

localUsersUUIDtoObject.delete(uuid)
numLocalUsersGlobal--	
meetObj.numLocalUsersInMeeting--

if(localUser.spareCanvasUsed)
{
localUser.spareCanvasUsed.usedBy = undefined
localUser.spareCanvasUsed.videoTrackUsed.enabled = false
}

this.closeStream(localUser.streamToSend)
this.closeStream(localUser.streamOrig)
localUser.streamOrig = undefined
this.closeStream(localUser.streamOrigCloned)
this.closeStream(localUser.streamToSendToReplaceStreamToSend)

if(localUser.replacedTracks)
   {
	 for(let key in localUser.replacedTracks)
		{
		let oldNew = localUser.replacedTracks[key]	
		let o = simplePeersObjects.get(key)	
		if(o)
		  o.peer.replaceTrack(oldNew.new, oldNew.old, o.stream)
		meetObj.globalTracksToSend[localUser.numTrack] = oldNew.old	
		}
		localUser.replacedTracks = undefined
    }

localUser.numTrack = undefined

this.refreshManageLocalUsersToSend()


if(localUser.shareCaptionsToTheseLocalUsers)
  for(let localUser2 of localUser.shareCaptionsToTheseLocalUsers)
	this.shareCaptionsAmongLocalUsers(false, localUser, localUser2.uuid)
if(localUser.shareCaptionsFromTheseLocalUsers)
  for(let localUser2 of localUser.shareCaptionsFromTheseLocalUsers)
	this.shareCaptionsAmongLocalUsers(false, localUser2.uuid, localUser)
	  

this.sendCommandToPeers(undefined, "REMOVE_PEER_USER", uuid, localUser.meetingUUID)

for(let [uuid, localUser2] of localUsersUUIDtoObject)
  if(localUser2.siblingLocalUsers)
	for(let lu of localUser2.siblingLocalUsers)
	  if(lu.uuid == localUser.uuid)  
		{
			localUser2.siblingLocalUsers.delete(lu)
			break
		}

if(activeLocalUser === localUser && localUser !== meetObj.firstLocalUser)
	this.setActiveLocalUser(meetObj.firstLocalUser)

this.updateShareCaptionsAmongUsers()

return true			
}

}
//-----------------------------------------------------------
firstGlobalLocalUser()
{
	for(let [uuid, localUser] of localUsersUUIDtoObject)
	  return localUser
}
//-----------------------------------------------------------
addLocalUser(username, meetingUUID, useThisVideoStream, cameraRectNumber)
{
let rri = new RequestResponseInfo()
	
let meetObj = meetingsUUIDtoObject.get(meetingUUID)

let localUser = {} 

localUser.n = nextLocalUsersN++
localUser.cameraMuted = false
localUser.microphoneMuted = false

localUser.isSpeaking = false
localUser.zoomModeForFaceWebRTChub = "manual"
localUser.screenMode = "NORMAL" //DEFAULT

localUser.translationLanguagesAskedFor = new Map()
localUser.translationLanguagesAskedFor.set(preferredLanguage, {active:true})


if(!meetObj.firstLocalUser)
	{
	meetObj.firstLocalUser = localUser
	localUser.isFirstLocalUser = true
	}
	
localUser.username = username
localUser.meetingUUID = meetingUUID

localUser.uuid = (meetObj.numLocalUsersInMeeting == 0 ? "" : meetObj.firstLocalUser.uuid + "_") + generateUUID().replaceAll("-","")
localUser.numTrack = myWebRTChub.getFirstFreeNumTrack(meetObj)

localUser.xToDrawCameraVideoOnScreenShare = 0
localUser.yToDrawCameraVideoOnScreenShare = 0
localUser.dxToCopyFromCameraToCanvas = 0

localUser.streamToSend = localUser.streamToSend || new MediaStream()

if(!useThisVideoStream && lastVideoStreamToCopyToCanvas)
  useThisVideoStream = lastVideoStreamToCopyToCanvas


//first users in each meeting are siblings among them
if(localUser.isFirstLocalUser && meetObj.emptyMediaStream)
{
	let siblingLocalUsers = new Set()
	for(let [meetUUID, meetObj2] of meetingsUUIDtoObject)
	  	if(!meetObj2.notYetUsable)
	        siblingLocalUsers.add(meetObj2.firstLocalUser)
	let siblingsActive
	if(siblingLocalUsers.size > 1)
	  for(let [meetUUID, meetObj2] of meetingsUUIDtoObject)
		if(!meetObj2.notYetUsable)
  		{
	    let lu = meetObj2.firstLocalUser
		if(siblingsActive === undefined)
			{
			siblingsActive = lu.siblingsActive === undefined ? false : lu.siblingsActive
			cameraRectNumber = lu.videoStreamRectNumber
			if(lu.videoStream)
				useThisVideoStream = lu.videoStream
			}
		lu.siblingsActive = siblingsActive
		lu.siblingLocalUsers = siblingLocalUsers
		}
}


if(useThisVideoStream && meetObj.emptyMediaStream)
	myWebRTChub.addActiveUserToVideoStreamCameraRect(localUser, useThisVideoStream, cameraRectNumber)

localUser.showNotHideCornersOfVideoToSend = [false, false, false, false, false] //uses 1 to 4   none, top left, top right, bottom right, bottom left
localUser.circledAndTrianglesColors = ["#fff", "#fff", "#fff", "#fff", "#fff"] // 0 = circles  1 2 3 4 = triangles
localUser.showHideCornerWasManual = [false, false, false, false, false] //uses 1 to 4

localUser.shapeAroundOctogonalOrHexagonal = "octogonal" 

localUser.rotatedGlobalVideoForPeers = 0
localUser.circledGlobalVideoForPeers = 0
localUser.myVideoIsBlackAndWhite = false

//localUser.imageOfQuestionMark
//localUser.imageOfURLlink
localUser.myURLtoSendToOthers = ""

localUser.questionMarkCornerShow = false
localUser.URLlinkCornerShow = false

localUsersUUIDtoObject.set(localUser.uuid, localUser)

numLocalUsersGlobal++
meetObj.numLocalUsersInMeeting++


let divName = webrtcDivName(meetObj.meetingUUID)
let numPlace = mapMeetingToNumPlace3D.get(meetObj.meetingUUID)
if(numPlace)
	divNameAncestorOfSubDiv_to_IDSplace.set(divName, numPlace + ":151:U") 
this.spaceInMainScreenForThisUser(rri, localUser)
//after spaceInMainScreenForThisUser
if(localUser.screenMode == "NORMAL")
  this.setActiveLocalUser(localUser)

if(meetObj.numLocalUsersInMeeting > 1)
   localUser.informOthersOfExtraUser = true

this.updateShareCaptionsAmongUsers()

return localUser		  
}
//-----------------------------------------------------------
setActiveLocalUser(localUserOrUUID)
{
let localUser = isString(localUserOrUUID) ? localUsersUUIDtoObject.get(localUserOrUUID) : localUserOrUUID
if(!localUser)
  return

let result = activeLocalUser != localUser

let meetingUUID = localUser.meetingUUID
let meetObj = meetingsUUIDtoObject.get(meetingUUID)
let beforeLocalUser = meetObj.activeLocalUser
activeLocalUser = localUser
meetObj.activeLocalUser = localUser
this.selectMeetObjSelectedWebRTChub(meetingUUID)

//2 people in same computer if(!meetObj.audioLocalUser || localUser.streamToSend.getAudioTracks() != 0)
meetObj.audioLocalUser = localUser

if(beforeLocalUser && beforeLocalUser != localUser)
	{
	$("#rowOfLocalUser_"+beforeLocalUser.uuid).css("backgroundColor","#666")
	if(beforeLocalUser.isSpeaking || beforeLocalUser.timerOffSpeaking)
		{
		if(beforeLocalUser.timerOffSpeaking)
		  clearTimeout(beforeLocalUser.timerOffSpeaking)
		beforeLocalUser.isSpeaking = false
		myWebRTChub.sendMyMicInfoToOthers(beforeLocalUser)
		}
	}
	

this.updateAllBordersIndicatingLocalUserActive()


$("#myLinkToOtherPeers").val(localUser.myURLtoSendToOthers)
	                    .attr("disabled", localUser.URLlinkCornerShow) 
$(".showHideMyLinkToOtherPeers").prop("checked", localUser.URLlinkCornerShow)

this.repositionDxDyAndDeltasAndZoom() 
this.updatePeersVideoCenter(localUser)

//do not change by users actions this.refreshOrdenateSenderOrReceiver(meetingsUUIDtoObject.get(meetingUUID))

if(!localUser.emptyMediaStream)
  localUser.emptyMediaStream = meetObj.emptyMediaStream
if(result && meetObj.audioContext && meetObj.audioContext.activeLocalUser)
  if(beforeLocalUser != localUser)
    {
	if(meetObj.audioContext.activeLocalUser)
		meetObj.audioContext.activeLocalUser.audioMediaStreamSource.disconnect()
	localUser.audioMediaStreamSource = meetObj.audioContext.createMediaStreamSource(localUser.emptyMediaStream)
	localUser.audioMediaStreamSource.connect(meetObj.destStreamDestination)
	meetObj.activeMediaStreamSource = localUser.audioMediaStreamSource	
	meetObj.alreadyInitiatedMyCreateAudioMeter = false
	myWebRTChub.myCreateAudioMeter(meetObj)
	meetObj.audioContext.activeLocalUser = localUser
	}

//after changing audioContext
this.localUserMicrophoneMuteNotUnmute(localUser.uuid, undefined, meetingUUID, true)



return result

}
//-----------------------------------------------------------
updateAllBordersIndicatingLocalUserActive()
{
//$(".canvasForPeersWebRTC").css("border","0px")

  for(let [uuid, localUser] of localUsersUUIDtoObject)
  {	
  let meetObj =  meetingsUUIDtoObject.get(localUser.meetingUUID)
  let canvas = $("#canvasForPeersWebRTC_"+localUser.uuid)
  if(localUser == activeLocalUser && numLocalUsersGlobal > 1)
	 canvas.css("border","2px solid #0f0")
  else if(localUser == meetObj.activeLocalUser && meetObj.numLocalUsersInMeeting > 1)
	 canvas.css("border","2px solid #00f")
  else
	 canvas.css("border","0px")
  }
}
//-----------------------------------------------------------
makeConnection(meetingUUID, fromUUID, fromUUIDpublicKey, meetingWithUUID, inviteeNotAll, username, turnServerDistancesJSON)
{
	
let meetObj = meetingsUUIDtoObject.get(meetingUUID)
if(!meetObj)
  return

if(fromUUID == myUUID(meetObj)
   || !meetingsUUIDtoObject.has(meetingUUID) //from meeting before
    )
	return
if(inviteeNotAll != "" && inviteeNotAll != myUUID(meetObj))
	return

let processingThisOnFirebaseMessagePathLOCAL = processingThisOnFirebaseMessagePath

if(!(processingThisOnFirebaseMessagePathLOCAL == "/" + meetObj.channelCreatedByHost + "/ALL"
	 || processingThisOnFirebaseMessagePathLOCAL == "/" + meetObj.channelOriginal + "/ALL"
	 || processingThisOnFirebaseMessagePathLOCAL == "/" + meetObj.channelOriginal + "/" + myUUID(meetObj)
	)
  )	
 return

if(meetingWithUUIDtoPeersObjects.get(meetingWithUUID))//already connected
  return

	
let divID = meetingUUID+"_"+meetingWithUUID
	
let o = newSimplePeersObject("#" + divID, meetingUUID)	
o.username = username
o.oFirstOfPeer = o

o.meetingUUID = meetingUUID
o.meetingWithUUID = fromUUID //repeats
o.fromUUID = fromUUID		 //repeats
o.allCameraMuted = false //important to initialize
o.allMicrophoneMuted = false //important to initialize

if(turnServerDistancesJSON)
	o.turnServerDistances = JSON.parse(turnServerDistancesJSON)


if(meetObj.makeConnectionALREADY[fromUUID]
	|| meetObj.startedConnectionALREADY[fromUUID]
	|| meetObj.completeConnectionALREADY[fromUUID]
	|| meetObj.sent_fromUUID_lessThan_myUUID_ALREADY[fromUUID])
  return 
meetObj.makeConnectionALREADY[fromUUID] = useThisCheckforConnections



const exportedKey = JSON.parse(revertReplaceCharsForInsideQuotes(fromUUIDpublicKey))
subtleImportKey(exportedKey)
  .then((publicKey) => 
	{
	o.fromUUIDpublicKey = publicKey
	//must be after o.fromUUIDpublicKey = publicKey
	if(meetObj.emailsHosts.size > 0 && processingThisOnFirebaseMessagePathLOCAL != "/" + meetObj.channelCreatedByHost) 
	{
		if(!meetObj.channelOriginal || processingThisOnFirebaseMessagePathLOCAL != "/" + meetObj.channelOriginal)
		   return //invalid
	
		o.waitingForHostAcceptance = true
		if(meetObj.isHost && addToBlinkingElements("#buttonShowUsersInHost"))
			$("#knockWoodDoor")[0].play()
		this.showUsersWaitingForHostAcceptance(true)
		return
	}
	//must be after if(meetObj.emailsHosts.size > 0...
	if(fromUUID > myUUID(meetObj))	
	{
		meetObj.makeConnectionALREADY[fromUUID] = false
		meetObj.sent_fromUUID_lessThan_myUUID_ALREADY[fromUUID] = true
		
		consoleLogIfIsInLocalhost("makeConnection fromUUID > myUUID(meetObj)   o.fromUUID = "+ fromUUID + " > myUUID(meetObj) = " + myUUID(meetObj))
		myWebRTChub.firebaseBroadcastToPossiblePeersNotMoreThan5seconds(meetingUUID, fromUUID)
		return
	}

	
	myWebRTChub_simple_peer("#" + divID, o, meetingUUID)
	})
	
//reply message is sent on "connection"
}
//-----------------------------------------------------------
closeGlobalChat()
{
	slideLeftCloseRight(myWebrtc_chatTD, false, 0.35)
}
//-----------------------------------------------------------
closeGlobalSidePanel()
{
let  afterOnesWithThisID
let sameThisUUIDrunAtSametime
	
let result = executeThisFunctionWhenAnimationsAreStoped("closeGlobalSidePanel"
		, function(){myWebRTChub.closeGlobalSidePanelREALLY()}
		, true, afterOnesWithThisID, sameThisUUIDrunAtSametime)//does not execute right away, can execute all in paralell
	
if(!result.existedUniqueID) //replaced by this one
	closeGlobalSidePanel_IFZERO++	
}
//-----------------------------------------------------------
closeGlobalSidePanelREALLY()
{
closeGlobalSidePanel_IFZERO--

slideClose(globalSidePanelDirection() == "vertical", "#globalSidePanel_" + globalSidePanelDirection(), false, 0.35, undefined, undefined, function(){myWebRTChub.resizeElementsWithPeersParticipant(undefined, undefined, undefined, undefined, true)})
$("#myWebRTChub_button_video_sidepanel").show()
$("#webrtchub_textOpenCloseSidePanel").html("+")
}
//-----------------------------------------------------------
slideSwitchVerticalHorizontal(verticalNotHorizontal)
{
$("#globalSidePanel_" + globalSidePanelDirection()).hide()
globalSidePanelDirectionVALUE = globalSidePanelDirection() == "vertical" ? "horizontal" : "vertical"
manual_slideSwitchVerticalHorizontal = true

for(let uuid in afterSlideSwitchVerticalHorizontal)
	afterSlideSwitchVerticalHorizontal[uuid](uuid)


this.showGlobalSidePanel(false, true)
}
//-----------------------------------------------------------
showGlobalSidePanel(refreshIfVisible, showEvenIfEmpty, userUUID)
{
const elem = $("#globalSidePanel_" + globalSidePanelDirection())[0]
if(!refreshIfVisible && showEvenIfEmpty && elem.offsetWidth * elem.offsetHeight != 0)
	return this.closeGlobalSidePanel()


let  afterOnesWithThisID
let sameThisUUIDrunAtSametime
	
let result = executeThisFunctionWhenAnimationsAreStoped("showGlobalSidePanel"
		, function(){myWebRTChub.showGlobalSidePanelREALLY(refreshIfVisible, showEvenIfEmpty, userUUID)}
		, true, afterOnesWithThisID, sameThisUUIDrunAtSametime)//does not execute right away, can execute all in paralell
	
if(!result.existedUniqueID) //replaced by this one
 showGlobalSidePanel_IFZERO++	
	
}
//----------------------------------------------------------
showGlobalSidePanelREALLY(refreshIfVisible, showEvenIfEmpty, userUUID)
{

showGlobalSidePanel_IFZERO--

transferFromSelectorToSelector("#globalSidePanel_inside_top_" + (globalSidePanelDirection() == "vertical" ? "horizontal" : "vertical"), "#globalSidePanel_inside_top_" + globalSidePanelDirection())

transferFromSelectorToSelector("#globalSidePanel_inside_" + (globalSidePanelDirection() == "vertical" ? "horizontal" : "vertical"), "#globalSidePanel_inside_" + globalSidePanelDirection())
slideClose(globalSidePanelDirection() == "vertical","#globalSidePanel_" + globalSidePanelDirection(), true, 0.35, (widthOfVerticalSidePanel * webrtchub_numSideSize) + "px", "140px"
			, resizeElementsWithPeersParticipant)
$("#webrtchub_textOpenCloseSidePanel").html("-")
}
//-----------------------------------------------------------
showGlobalChat(refreshIfVisible, showEvenIfEmpty, userUUID, button)
{
let changedColor =  false
if(button)
	{
		let before =  button.style.backgroundColor
		button.style.backgroundColor = "#dfd"	
		changedColor = before != button.style.backgroundColor
	}
	
if(!changedColor && showEvenIfEmpty && $("#myWebrtc_chatTD")[0].offsetWidth > 0)
	return this.closeGlobalChat()

let select = $("#selectorOfWHoToSendChat")[0]
$(select).empty()
$(select).append("<option value='-1'>"+TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[14])+"</option>")
for(let [key, o] of simplePeersObjects)
  if(o.username)
	$(select).append("<option class='username_"+o.meetingWithUUID+"' id='selectorOfWHoToSendChat_option_"+o.meetingWithUUID+"' value='"+o.meetingWithUUID+"' "+(userUUID == o.uuid ? "selected" : "" )+">"+o.username+"</option>")

slideLeftCloseRight(myWebrtc_chatTD, true, 0.35, "20em")
}
//-----------------------------------------------------------
showUsersWaitingForHostAcceptance(refreshIfVisible, showEvenIfEmpty)
{
	
if(!this.atLeastHostIsOneOfTheMeetings())
	return 
	
if(refreshIfVisible && !$("#myWebrtc_hostTD").is(":visible"))
	return
	
if(showEvenIfEmpty && $("#myWebrtc_hostTD").is(":visible"))
	return slideLeftCloseRight("#myWebrtc_hostTD", false, 0.35)

createContainerForPanelHost()
	
let accept = TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[59])

if($("#mywebrtchub_tabManageUsers").length == 0)
  $("#mywebrtchub_rowOptionsHosts")[0].insertAdjacentHTML("afterbegin","<td id='mywebrtchub_tabManageUsers' onClick='selectTabOfHostTables(\"#mywebrtchub_tabManageUsers\",\"#mywebrtc_tableWithManagedUsers\")' style='cursor:pointer'><b>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[65]) + "</b></td>")

	let numWaiting = 0
	let numRefused = 0
	let numAccepted = 0
	let numStandby = 0

	let s = "<div class='mywebrtchub_tablesForHost' id='mywebrtc_tableWithManagedUsers' style='display:inline-table;overflow:none;min-width:20em;max-width:20em;height:100%'>"
	let s2 = "<table style='font-size:90%;background-color:#ffc;width:100%'><tr><th><input type='checkbox'></th><th>name</th><th colspan='3'>"+accept+"</th></tr>"
	for(let [key, o] of simplePeersObjects)
	  if(o.waitingForHostAcceptance === true)
		{
		let meetObj = meetingsUUIDtoObject.get(o.meetingUUID)
		let emailHostResult = meetObj.emailsHosts.get(nomeUtilizador)
		if(emailHostResult === undefined)
			continue
		numWaiting++
		s2 += "<tr>"
		  + "<td><input type='checkbox' checked></td>"
		  + "<td class='username_"+o.meetingWithUUID+"'> " + o.username + "</td>"
		  + "<td><nobr><button onClick='myWebRTChub.hostAcceptsUser(\""+o.meetingUUID+"\",\""+o.meetingWithUUID+"\")' style='background-color:#dfd' title='" + accept + "'>Y</button>"
		  + "<button onClick='myWebRTChub.hostStandbyUser(\""+o.meetingUUID+"\",\""+o.meetingWithUUID+"\")' style='background-color:#ffc' " + attributeWithTranslation("title", TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[64])) + ">S</button>"
		  + "<button onClick='myWebRTChub.hostRefusesUser(\""+o.meetingUUID+"\",\""+o.meetingWithUUID+"\")' style='background-color:#fdd' " + attributeWithTranslation("title", TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[62])) + ">R</button>"
		  + "</nobr></td>"
		  + "</tr>"
		}	
	s2 += "</table><br>";
	s += (numWaiting > 0 ? s2 : "no one waiting") + "<br>"

	s2 = "<table style='background-color:#dfd;width:100%'><tr><th><input type='checkbox'></th><th>name</th><th colspan='2'>"+accept+"</th></tr>"
	for(let [key, o] of simplePeersObjects)
	  if(o.waitingForHostAcceptance === false)
		{
		let meetObj = meetingsUUIDtoObject.get(o.meetingUUID)
		let emailHostResult = meetObj.emailsHosts.get(nomeUtilizador)
		if(emailHostResult === undefined)
			continue
		numAccepted++
		s2 += "<tr>"
		  + "<td><input type='checkbox' checked></td>"
		  + "<td class='username_"+o.meetingWithUUID+"'> " + o.username + "</td>"
	  	  + "<td><nobr><button onClick='myWebRTChub.hostStandbyUser(\""+o.meetingUUID+"\",\""+o.meetingWithUUID+"\")' style='background-color:#ffc' " + attributeWithTranslation("title", TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[63])) + ">S</button>"
		  + "<button onClick='myWebRTChub.hostRefusesUser(\""+o.meetingUUID+"\",\""+o.meetingWithUUID+"\")' style='background-color:#fdd' " + attributeWithTranslation("title", TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[62])) + ">R</button>"
		  + "</nobr></tr>"
		}	
	s2 += "</table><br>";
	s += (numAccepted > 0 ? s2 : "no one accepted") + "<br>"

	s2 = "<table style='background-color:#fdd;width:100%'><tr><th><input type='checkbox'></th><th>name</th><th>"+accept+"</th></tr>"
	for(let [key, o] of simplePeersObjects)
	  if(o.waitingForHostAcceptance === "standby")
		{
		let meetObj = meetingsUUIDtoObject.get(o.meetingUUID)
		let emailHostResult = meetObj.emailsHosts.get(nomeUtilizador)
		if(emailHostResult === undefined)
			continue
		numStandby++
		s2 += "<tr>"
		  + "<td><input type='checkbox' checked></td>"
		  + "<td class='username_"+o.meetingWithUUID+"'> " + o.username + "</td><td><button onClick='myWebRTChub.hostAcceptsUser(\""+o.meetingUUID+"\",\""+o.meetingWithUUID+"\")' style='background-color:#fdd'>" + accept + "</button></td>"
		  + "</tr>"
		}	
	s2 += "</table><br>";
	s += (numStandby > 0 ? s2 : "no one in standby") + "<br>"


	s2 = "<table style='background-color:#fdd;width:100%'><tr><th><input type='checkbox'></th><th>name</th><th>"+accept+"</th></tr>"
	for(let [key, o] of simplePeersObjects)
	  if(o.waitingForHostAcceptance === "refused")
		{
		let meetObj = meetingsUUIDtoObject.get(o.meetingUUID)
		let emailHostResult = meetObj.emailsHosts.get(nomeUtilizador)
		if(emailHostResult === undefined)
			continue
		numRefused++
		s2 += "<tr>"
		  + "<td><input type='checkbox' checked></td>"
		  + "<td>&nbsp;<b class='username_"+o.meetingWithUUID+"' style='color:black'>" + o.username + "</b></td><td><button onClick='myWebRTChub.hostAcceptsUser(\""+o.meetingUUID+"\",\""+o.meetingWithUUID+"\")' style='background-color:#fdd' title='" + accept + "'>Y</button></td>"
		  + "</tr>"
		}	
	s2 += "</table><br>";
	s += (numRefused > 0 ? s2 : "no one refused") + "<br>"

    s += "</div>"

	$("#mywebrtchub_divForHost")[0].insertAdjacentHTML("beforeend", s)
	
	selectTabOfHostTables("#mywebrtchub_tabManageUsers","#mywebrtc_tableWithManagedUsers")

$("#mywebrtc_tableWithManagedUsers").remove()
$("#mywebrtchub_divForHost")[0].insertAdjacentHTML("beforeend", s)

let atLeastOne = numWaiting + numRefused + numAccepted > 0

openClosePanelOfHost(atLeastOne || showEvenIfEmpty)
		
return true

}
//-----------------------------------------------------------
hostStandbyUser(meetingUUID, meetingWithUUID)
{
removeFromBlinkingElements("#buttonShowUsersInHost")
	
}
//-----------------------------------------------------------
hostAcceptsUser(meetingUUID, meetingWithUUID)
{
removeFromBlinkingElements("#buttonShowUsersInHost")

let o = simplePeersObjectsOfMeetingFromParticipantUUID(meetingUUID, meetingWithUUID)
if(!o.waitingForHostAcceptance)
  return
o.waitingForHostAcceptance = false //means already accepted
this.showUsersWaitingForHostAcceptance(true)

this.showUsersWaitingForHostAcceptance() //closes

let meetObj = meetingsUUIDtoObject.get(meetingUUID)
let emailHostResult = meetObj.emailsHosts.get(nomeUtilizador)

this.hostAcceptsUserFINAL(o)
		
}
//-----------------------------------------------------------
hostRefusesUser(meetingUUID, meetingWithUUID)
{
// removeFromBlinkingElements("#buttonShowUsersInHost")

let o = simplePeersObjectsOfMeetingFromParticipantUUID(meetingUUID, meetingWithUUID)
if(o.waitingForHostAcceptance === "refused")
  return
myWebRTChub.sendFireBaseMessage(meetObj.channelOriginal
	, evaljscriptCommand("myWebRTChub.hostRefusesConnection(\""+meetingUUID+"\",\""+o.meetingFromUUID+"\")"
	, undefined
	, o.fromUUID)
	)
	
}
//-----------------------------------------------------------
serverReturnedHostCreatedChannel(meetingUUID, channelCreatedByHost)
{
    let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	if(!meetObj)
	  return

	$("#buttonShowUsersInHost").show()

	meetObj.isHost = true

	meetObj.emailsHosts.set(nomeUtilizador, true)
	$(".messageWaitingForOthers_"+meetingUUID).html(TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[0]))
	
	meetObj.channelCreatedByHost = channelCreatedByHost
	registerChannelForUUIDpeers[meetingUUID] = channelCreatedByHost
	this.registerChannelForUUIDpeersREALLY(meetingUUID, 1)
	
	for(let [key, o] of simplePeersObjects)
	  if(o.meetingUUID === meetingUUID && o.waitingForHostAcceptance === false) //false means was already accepted
		this.hostAcceptsUserFINAL(o)
	
	for(let [key, o] of simplePeersObjects)
	  if(o.waitingForHostAcceptance)
		{
		if(addToBlinkingElements("#buttonShowUsersInHost"))
			$("#knockWoodDoor")[0].play()
		 break;
		}	
		
	myWebRTChub.sendFireBaseMessage(meetObj.channelOriginal
		, evaljscriptCommand("myWebRTChub.hostRequestOthersMakeConnection(\""+meetingUUID+"\")")
		)

	if(meetObj.paramRevertAndApplyJSONstring)
		nogoLinkEditor.processWalkWithPhotos(meetObj)

}
//-----------------------------------------------------------
hostAcceptsUserFINAL(o)
{
	
	let meetObj = meetingsUUIDtoObject.get(o.meetingUUID)
		
	let callThisFunction = function(signalDataEncrypted){
		sendFireBaseMessage(meetObj.channelOriginal //to the original channel
      , evaljscriptCommand("myWebRTChub.executeDecrypted(\""+o.meetingUUID+"\",\""+myUUID(meetObj)+"\",\""+o.meetingWithUUID+"\",\"" + signalDataEncrypted + "\")")
	  , true
	  , o.meetingWithUUID) //"true" avoids cleaning afterwards
	}
						
	this.sendToOtherWithAsymetricAndSymetricKeys(o, callThisFunction, "myWebRTChub.hostAnswered(\""+ o.meetingUUID + "\",\""+ meetObj.channelCreatedByHost  +"\")")
	
}
//-----------------------------------------------------------
executeDecrypted(meetingUUID, sentByUUID, sentToUUID, outGoingSignal)
{
const meetObj = meetingsUUIDtoObject.get(meetingUUID)
	
if(sentByUUID == myUUID(meetObj)
   || sentToUUID != myUUID(meetObj)
   || !meetingsUUIDtoObject.has(meetingUUID) //from meeting before
    )
return

	outGoingSignal = decodeURIComponent(outGoingSignal)
	let pos = outGoingSignal.indexOf(' ')
	let numberW = parseInt(outGoingSignal.slice(0, pos))
	pos++
	const symetricKeyToImport = hex2buf(outGoingSignal.slice(pos, pos + numberW))
	outGoingSignal = outGoingSignal.slice(pos + numberW)
	outGoingSignal = hex2buf(outGoingSignal)
	
	
	subtleDecrypt(meetObj.keyPairKeepPrivateSendPublic.privateKey, symetricKeyToImport, true)
	   .then((symetricKeyToImportDechiphered) =>
		{	
	
		const symetricKeyImportedOBJECT = 
			{
			alg: ALG_ENCRYPTDECRYPT
			,ext: true
			,k: new TextDecoder('utf-8').decode(symetricKeyToImportDechiphered)
			//,key_ops: ["encrypt", "decrypt", "verify"]
			,kty: "oct"
			}
	
		subtleImportKeySymetric(symetricKeyImportedOBJECT)
		.then((symetricKeyImported) =>
		{ 
	
		  subtleDecryptSymetric(symetricKeyImported, outGoingSignal, true)
	   	  .then((decipherText) =>
		  {
			const outGoingSignal = new TextDecoder("utf-8").decode(decipherText)
			myEval(outGoingSignal)
			})
		})
	})

	
}
//-----------------------------------------------------------
hostAnswered(meetingUUID, channelCreatedByHost)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)
if(!meetObj)
  return

unregisterThisFirebaseChannel(meetObj.channelOriginal + "/ALL") 

registerChannelForUUIDpeers[meetingUUID] = channelCreatedByHost
meetObj.channelCreatedByHost = channelCreatedByHost
this.registerChannelForUUIDpeersREALLY(meetingUUID, 1)

if(meetObj.paramRevertAndApplyJSONstring)
	nogoLinkEditor.processWalkWithPhotos(meetObj)
}
//-----------------------------------------------------------
startedConnection(fromUUID, meetingUUID, meetingWithUUID, answeringToLocalUserWithUUID, fromPublicKey, outGoingSignal, rotatedCircledVideo, turnServerDistancesJSON)
{
	
const meetObj = meetingsUUIDtoObject.get(meetingUUID)
if(!meetObj)
  return  

if(fromUUID == myUUID(meetObj))
  return consoleLogIfIsInLocalhost("RETURN startedConnection fromUUID == myUUID(meetObj)")

if(answeringToLocalUserWithUUID == myUUID(meetObj))
	consoleLogIfIsInLocalhost("FUNCTION startedConnection myUUID="+ myUUID(meetObj) + " FROM " + meetingWithUUID)
else if(answeringToLocalUserWithUUID == meetObj.firstLocalUser.uuid) 
	consoleLogIfIsInLocalhost("FUNCTION startedConnection meetObj.firstLocalUser.uuid="+ meetObj.firstLocalUser.uuid + " FROM " + meetingWithUUID)
else return consoleLogIfIsInLocalhost("RETURN startedConnection meant for another peer")


if(//(meetObj.makeConnectionALREADY[fromUUID])
   meetObj.startedConnectionALREADY[fromUUID]
   ||meetObj.completeConnectionALREADY[fromUUID])
	return 
meetObj.startedConnectionALREADY[fromUUID] = useThisCheckforConnections

/*
let isForMe = false
o.fromUUIDpublicKey

if(!fromUUIDpublicKey )
if(!isForMe)
	true 
*/

let divID = meetingUUID+"_"+meetingWithUUID

let arr = $("#divEmcopassingAll_INSIDE" + meetingUUID) 

if(arr.length == 0)
	return

let html = "<div></div>"
html = surroundByTableFor3D(undefined, html, divID, "contentsAndNoHeight " + divID, "display:inline-table;border:1px solid #000;align-self:center;vertical-align:top", "", "username_" + meetingWithUUID)

arr[0].insertAdjacentHTML("afterbegin", html)
let o = this.initiateHTML("#" + divID, meetingWithUUID, rotatedCircledVideo, meetingUUID)
o.meetingUUID = meetingUUID
o.waitingForHostAcceptance = false
o.fromUUID = fromUUID

if(turnServerDistancesJSON)
  o.turnServerDistances = JSON.parse(turnServerDistancesJSON)

if(meetObj.emailsHosts.get(nomeUtilizador))
   this.showUsersWaitingForHostAcceptance(true)

 const exportedKey = JSON.parse(revertReplaceCharsForInsideQuotes(fromPublicKey))
  subtleImportKey(exportedKey)
  .then((publicKey) => 
	{
	o.fromUUIDpublicKey = publicKey
	outGoingSignal = decodeURIComponent(outGoingSignal)
	let pos = outGoingSignal.indexOf(' ')
	let numberW = parseInt(outGoingSignal.slice(0, pos))
	pos++
	const symetricKeyToImport = hex2buf(outGoingSignal.slice(pos, pos + numberW))
	outGoingSignal = outGoingSignal.slice(pos + numberW)
	outGoingSignal = hex2buf(outGoingSignal)

	  subtleDecrypt(meetObj.keyPairKeepPrivateSendPublic.privateKey, symetricKeyToImport, true)
	   .then((symetricKeyToImportDechiphered) =>
		{	
		const symetricKeyImportedOBJECT = 
			{
			alg: ALG_ENCRYPTDECRYPT
			,ext: true
			,k: new TextDecoder('utf-8').decode(symetricKeyToImportDechiphered)
			,key_ops: ["encrypt", "decrypt"]
			,kty: "oct"
			}
	
		subtleImportKeySymetric(symetricKeyImportedOBJECT)
		.then((symetricKeyImported) =>
		{ 
		  subtleDecryptSymetric(symetricKeyImported, outGoingSignal, true)
	   	  .then((decipherText) =>
		  {
			outGoingSignal = new TextDecoder("utf-8").decode(decipherText)
			this.startReceiving("#" + divID, outGoingSignal)
//			this.firebaseBroadcastToPossiblePeersNotMoreThan5seconds(meetingUUID, fromUUID)
			})
		.catch(error => {
			console.error(error)
			})
		})
		.catch(error => {
			console.error(error)
			})
	})
	.catch(error => {
			console.error(error)
			})
  })
  .catch(error => {
			console.error(error)
			})
	
//myWebRTChub.addAudioVideoStream("#"+divID, true)
//this.registerChannelForUUIDpeersREALLY(meetingUUID, 1)


}
//-----------------------------------------------------------
completeConnection(fromUUID, meetingUUID, meetingWithUUID, answeringToLocalUserWithUUID, fromPublicKey, outGoingSignal, settingsParam)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)
if(!meetObj)
  return consoleLogIfIsInLocalhost("RETURN meetingUUID not found")

if(fromUUID == myUUID(meetObj))
  return consoleLogIfIsInLocalhost("RETURN completeConnection fromUUID == myUUID(meetObj)")

let arr = $("#divEmcopassingAll_INSIDE" + meetingUUID) 
if(arr.length == 0)
	//normal on reconnections when this part is the second to access alert("ERROR: #talkisi_instant is missing!!!")
  return consoleLogIfIsInLocalhost("RETURN completeConnection arr.length == 0")


if(meetObj.startedConnectionALREADY[fromUUID]
   || meetObj.completeConnectionALREADY[fromUUID])
	return consoleLogIfIsInLocalhost("RETURN meetObj.startedConnectionALREADY[fromUUID]")

if(answeringToLocalUserWithUUID == myUUID(meetObj))
	consoleLogIfIsInLocalhost("FUNCTION startedConnection myUUID="+ myUUID(meetObj) + " FROM " + meetingWithUUID)
else if(answeringToLocalUserWithUUID == meetObj.firstLocalUser.uuid) 
	consoleLogIfIsInLocalhost("FUNCTION startedConnection meetObj.firstLocalUser.uuid="+ meetObj.firstLocalUser.uuid + " FROM " + meetingWithUUID)
else return consoleLogIfIsInLocalhost("RETURN completeConnection meant for another peer")


meetObj.completeConnectionALREADY[fromUUID] = useThisCheckforConnections
		
let divID = meetingUUID+"_"+meetingWithUUID
let html = "<div style='display:inline-table;border:1px solid #000;align-self:center'></div>"
html = surroundByTableFor3D(undefined, html, divID, "contentsAndNoHeight " + divID, "display:inline-table;border:1px solid #000;align-self:center;vertical-align:top")

arr[0].insertAdjacentHTML("beforebegin", html);	
let o = this.initiateHTML("#" + divID, meetingWithUUID, settingsParam, meetingUUID)

o.waitingForHostAcceptance = false
this.showUsersWaitingForHostAcceptance(true)

//to confirm everything is right
o = simplePeersObjectsOfMeetingFromParticipantUUID(meetingUUID, meetingWithUUID)
if(!o)
	return //alert("not find simplePeersObjectsOfMeetingFromParticipantUUID")
//different outGoingSignal
//if(o.alreadyCompletedConnection)
//	  return
//o.alreadyCompletedConnection = true
	  
if(isDebuggingWebRTCpeers)
	addTextToReceiveBox("#chatReceivedGlobalPeers", "CC=" + o.username + "<br>")

	outGoingSignal = decodeURIComponent(outGoingSignal)
	let pos = outGoingSignal.indexOf(' ')
	let numberW = parseInt(outGoingSignal.slice(0, pos))
	pos++
	const symetricKeyToImport = hex2buf(outGoingSignal.slice(pos, pos + numberW))
	outGoingSignal = outGoingSignal.slice(pos + numberW)
	outGoingSignal = hex2buf(outGoingSignal)
	
	  subtleDecrypt(meetObj.keyPairKeepPrivateSendPublic.privateKey, symetricKeyToImport, true)
	   .then((symetricKeyToImportDechiphered) =>
		{	
	
		const symetricKeyImportedOBJECT = 
			{
			alg: ALG_ENCRYPTDECRYPT 
			,ext: true
			,k: new TextDecoder('utf-8').decode(symetricKeyToImportDechiphered)
			,key_ops: ["encrypt", "decrypt"]
			,kty: "oct"
			}
	
		subtleImportKeySymetric(symetricKeyImportedOBJECT)
		.then((symetricKeyImported) =>
		{ 
	
		  subtleDecryptSymetric(symetricKeyImported, outGoingSignal, true)
	   	  .then((decipherText) =>
		    {
			outGoingSignal = new TextDecoder("utf-8").decode(decipherText)
			if(o.peer)
				o.peer.signal(outGoingSignal)
			})
		})
	})

//this.startReceiving("#" + divID, outGoingSignal)

$("#" + divID).show();
	
if(!isDebuggingWebRTCpeers && !o.playedNewUserSound)
{
	o.playedNewUserSound = true
	let dt = new Date().getTime()
	if( dt - lastTimePlayedNewUserSoundPeers > JSsegundo * 2)
	{
		$("#soundOfPeerArrived")[0].play()
    	lastTimePlayedNewUserSoundPeers = dt
	}
	
	addTextToReceiveBox("#chatReceivedGlobalPeers", "<p style='width:100%;text-align:center'><b><a class='username_"+o.meetingWithUUID+"' onClick='showGlobalChat(undefined,undefined,\""+o.uuid+"\")'>" + o.username + "</a></b><font style='color:#080'> ENTERED</font></p>")
}
	
this.resizeElementsWithPeersParticipant(undefined)

//this.firebaseBroadcastToPossiblePeersNotMoreThan5seconds(meetingUUID, fromUUID)
}
//-----------------------------------------------------------
firebaseBroadcastToPossiblePeersNotMoreThan5seconds(meetingUUID, optionalTargetUUID = false)
{

let meetObj = meetingsUUIDtoObject.get(meetingUUID)	
if(!meetObj.timeOutFirebaseBroadcastToPossiblePeersNotMoreThan5seconds)
  meetObj.timeOutFirebaseBroadcastToPossiblePeersNotMoreThan5seconds = []

const time = new Date().getTime()


if(undefined === meetObj.timeOutFirebaseBroadcastToPossiblePeersNotMoreThan5seconds[optionalTargetUUID])
	meetObj.timeOutFirebaseBroadcastToPossiblePeersNotMoreThan5seconds[optionalTargetUUID] = 0
else if(-1 === meetObj.timeOutFirebaseBroadcastToPossiblePeersNotMoreThan5seconds[optionalTargetUUID])
	return //already one waiting
	
if(time > 1000 + meetObj.timeOutFirebaseBroadcastToPossiblePeersNotMoreThan5seconds[optionalTargetUUID])
 {
  myWebRTChub.sendMakeConnectionMessage(meetingUUID, optionalTargetUUID)
  meetObj.timeOutFirebaseBroadcastToPossiblePeersNotMoreThan5seconds[optionalTargetUUID] = time
  }
else
  {
   meetObj.timeOutFirebaseBroadcastToPossiblePeersNotMoreThan5seconds[optionalTargetUUID] = -1
   setTimeout(function(){myWebRTChub.firebaseBroadcastToPossiblePeersNotMoreThan5seconds(meetingUUID, optionalTargetUUID)}, 50)
  }
}
//-----------------------------------------------------------
close(o)
{
	if(!o)
		return
		
	let meetObj = meetingsUUIDtoObject.get(o.meetingUUID)
	

	if(o.peer)
		{
		//o.peer.destroy()
		o.peer = undefined
		}
		
	this.closeStream(o.stream)	
		
	let selector = o.selector

	$(selector).hide()
	removeAndEmpty($(selector)[0])
	removeFromMap(simplePeersObjects, o.selector)

	if($("#selectorOfWHoToSendChat").val() == o.meetingWithUUID)
       this.closeGlobalChat()
		
	removeAndEmpty($("#selectorOfWHoToSendChat_option_"+o.meetingWithUUID))
	
	myWebRTChub.resizeElementsWithPeersParticipant(undefined, undefined, undefined, milisecondsMoveObjects)

	for(let key in informPluginsThatPeerHasClosed)
	{
	eval("tempFunctionToCall = " + informPluginsThatPeerHasClosed[key])
	tempFunctionToCall(o) //false means is receiving
	}

	if(typeof questionsControlCenterPOINTER === "function")
		questionsControlCenterPOINTER("USERS_HAVE_CHANGED")

    if(meetObj)
	{
	meetObj.makeConnectionALREADY[o.fromUUID] = false
	meetObj.startedConnectionALREADY[o.fromUUID] = false
	meetObj.completeConnectionALREADY[o.fromUUID] = false
	meetObj.sent_fromUUID_lessThan_myUUID_ALREADY[o.fromUUID] = false
	}

    myWebRTChub.refreshShowMeetingLinksAndPeers()

}
//-----------------------------------------------------------
firstMeetingObj()
{
    for(let [meetUUID, meetObj] of meetingsUUIDtoObject)
       return meetObj	
}
//-----------------------------------------------------------
meetingsVideoMuteNotUnmute(meetingUUID, mute, automatic)
{
  if(automatic && !peersVideoActive)
    return

  if(meetingUUID)
	for(let [uuid, o] of simplePeersObjects)
	  this.peerVideoMuteNotUnmute(uuid, mute, meetingUUID)
    else for(let [meetUUID, meetObj] of meetingsUUIDtoObject)
			if(!meetObj.notYetUsable)
      			this.meetingsVideoMuteNotUnmute(meetUUID, mute)
		
  if(meetingUUID)
	meetingsUUIDtoObject.get(meetingUUID).videoActive = !mute
  else
	peersSpeakersActive = mute	
	
  let end = meetingUUID ? "_" + meetingUUID : ""
	$("."+(!mute ? "myWebRTCpeerButtonVideoOn" : "myWebRTCpeerButtonVideoOff") + end).show()
	$("."+(mute ? "myWebRTCpeerButtonVideoOn" : "myWebRTCpeerButtonVideoOff") + end).hide()
}
//-----------------------------------------------------------
meetingsSpeakersMuteNotUnmute(meetingUUID, mute, automatic)
{
if(automatic && !peersSpeakersActive)	
  return

if(mute === undefined)
{
//nothing	
}
else if(meetingUUID)
	meetingsUUIDtoObject.get(meetingUUID).speakersActive = !mute
  else
	peersSpeakersActive = !mute	

  if(meetingUUID)
	for(let [uuid, o] of simplePeersObjects)
	  this.peerSpeakersMuteNotUnmute(uuid, mute, meetingUUID)
  else for(let [meetUUID, meetObj] of meetingsUUIDtoObject)
	if(!meetObj.notYetUsable)
     this.meetingsSpeakersMuteNotUnmute(meetUUID, undefined)

  let meetObj = meetingsUUIDtoObject.get(meetingUUID)

  let muted = meetObj ? !meetObj.speakersActive : !peersSpeakersActive 

  let active = meetObj ? meetObj.speakersActive && !meetObj.disabled && peersSpeakersActive: peersSpeakersActive
  let end = meetingUUID ? "_" + meetingUUID : ""

    let color = muted ? "#fbb" : active ? "#bfb" : "#ff8"
    $(".myWebRTCbuttonLoud" + end).css("backgroundColor", color)
    $(".myWebRTCbuttonSilent" + end).css("backgroundColor", color)
	$("."+(active ? "myWebRTCbuttonLoud" : "myWebRTCbuttonSilent") + end).show()
	$("."+(!active ? "myWebRTCbuttonLoud" : "myWebRTCbuttonSilent") + end).hide()
}
//-----------------------------------------------------------
meetingsCameraMuteNotUnmute(meetingUUID, mute, automatic)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)

if(automatic && !peersCameraActive)	
    return

if(mute === undefined)
{
	
}
else if(meetObj)
	meetObj.cameraActive = !mute
  else
	peersCameraActive = !mute
 
if(meetingUUID)
   for(let [uuid, localUser] of localUsersUUIDtoObject)
       this.localUserCameraMuteNotUnmute(uuid, undefined, meetingUUID)
else
  for(let [meetingUUID, meetObj] of meetingsUUIDtoObject)
	if(!meetObj.notYetUsable)
      this.meetingsCameraMuteNotUnmute(meetingUUID, undefined)

  let muted = meetObj ? !meetObj.cameraActive : !peersCameraActive 

  let end = meetObj ? "_" + meetingUUID : ""
  let active = meetObj ? meetObj.cameraActive && !meetObj.disabled && peersCameraActive: peersCameraActive

  $(".myWebRTCbuttonCamera" + end).css("backgroundColor", muted ? "#fbb" : active ? "#bfb" : "#ff8")
  showHideSelector(".myWebRTCbuttonCameraOn" + end, active)
  showHideSelector(".myWebRTCbuttonCameraOff" + end, !active)

}
//-----------------------------------------------------------
meetingsMicrophoneMuteNotUnmute(meetingUUID, mute, updateMutedBecauseOfSeveralReasons, doNotInformPeers)
{
	
try
{
countLocalUserMicrophoneMuteNotUnmute++	
	
let meetObj = meetingsUUIDtoObject.get(meetingUUID)
if(meetObj && mute !== undefined)	
  meetObj.microphoneActive = mute

let muted = mute	
if(mute === undefined)
{
  if(meetObj)
    muted =meetObj.microphoneActive
  else 
    muted = peersMicrophoneActive 
}
else if(meetObj)
  meetObj.microphoneActive = !mute

if(meetingUUID === undefined)
	peersMicrophoneActive = !muted
	
if(meetingUUID)	
  for(let [uuid, localUser] of localUsersUUIDtoObject)
     this.localUserMicrophoneMuteNotUnmute(uuid, undefined, meetingUUID, updateMutedBecauseOfSeveralReasons, undefined, doNotInformPeers)
else
  for(let [meetUUID, meetObj] of meetingsUUIDtoObject)
	if(!meetObj.notYetUsable)
      this.meetingsMicrophoneMuteNotUnmute(meetUUID, mute, updateMutedBecauseOfSeveralReasons, doNotInformPeers)
	
  	let end = meetingUUID ? "_" + meetingUUID : ""
	if(!peersMicrophoneActive
		|| globalIsMutedBecauseOfSeveralReasons > 0
	   )
	  muted = true
    
	$(".myWebRTCbuttonMicrophone" + end).css("backgroundColor", (meetObj ? meetObj.microphoneActive : peersMicrophoneActive)  ? muted ? "#ff8" : "#bfb" : "#fbb")
	showHideSelector(".myWebRTCbuttonMicrophoneOn" + end, !muted)
	showHideSelector(".myWebRTCbuttonMicrophoneOff" + end, muted )

  for(let [uuid, localUser] of localUsersUUIDtoObject)
    if(localUser.meetingUUID == meetingUUID)	
  	  myWebRTChub.sendMyMicInfoToOthers(localUser, undefined, doNotInformPeers)

}
finally
{
	countLocalUserMicrophoneMuteNotUnmute--
	if(countLocalUserMicrophoneMuteNotUnmute == 0)
   	   this.updateGlobalMicrophone(mute)
}

}
//-----------------------------------------------------------
localUserCameraMuteNotUnmute(uuid, mute, belongingToMeetingUUID, automatic)
{
if(automatic && !peersCameraActive)	
    return

let localUser = localUsersUUIDtoObject.get(uuid)	
let meetingUUID = belongingToMeetingUUID || localUser.meetingUUID

let meetObj = meetingsUUIDtoObject.get(meetingUUID)

if(mute !== undefined)
	localUser.cameraMuted = mute
//playNotStopVideoTracksOfStream(localUser.streamToSend, !mute)

for(let [key, o] of simplePeersObjects)
  if(o.meetingUUID === meetingUUID)
    this.localUserCameraMuteNotUnmuteToPeer(uuid, o, undefined, meetingUUID, undefined, true)

let muted = localUser.cameraMuted 
            || !meetObj.cameraActive
			|| meetObj.disabled 
            || !peersCameraActive

let end = "_" + uuid
$(".myWebRTClocalUserButtonCamera" + end).css("backgroundColor", localUser.cameraMuted ? "#fbb" : muted ? "#ff8" : "#bfb")
showHideSelector(".myWebRTClocalUserButtonCameraOn" + end, !muted)
showHideSelector(".myWebRTClocalUserButtonCameraOff" + end, muted)

}
//-----------------------------------------------------------
localUserMicrophoneMuteNotUnmute(localUserORuuid, mute, belongingToMeetingUUID, updateMutedBecauseOfSeveralReasons, doNotCallLocalUserMicrophoneMuteNotUnmuteToPeer
								, doNotInformPeers)
{

let localUser = isString(localUserORuuid) ? localUsersUUIDtoObject.get(localUserORuuid) : localUserORuuid	
if(!localUser)
	return

let meetingUUID = belongingToMeetingUUID || localUser.meetingUUID

try
{
countLocalUserMicrophoneMuteNotUnmute++

if(mute !== undefined && isString(localUserORuuid))
  localUser.microphoneMuted = mute

for(let [key, o] of simplePeersObjects)
  if(o.meetingUUID === meetingUUID)
  	if(!doNotCallLocalUserMicrophoneMuteNotUnmuteToPeer)
  		this.localUserMicrophoneMuteNotUnmuteToPeer(localUser.uuid, o, undefined, meetingUUID, undefined, true, doNotInformPeers)

  let end = "_" + localUser.uuid

  let meetObj = meetingsUUIDtoObject.get(meetingUUID)

  let muted = localUser.microphoneMuted 
            || !meetObj.microphoneActive
			|| meetObj.disabled 
            || !peersMicrophoneActive
            || globalIsMutedBecauseOfSeveralReasons > 0

  //playNotStopAudioTracksOfStream(localUser.streamToSend, !mute)
  this.sendMyMicInfoToOthers(localUser, undefined, doNotInformPeers)
  //playNotStopVideoTracksOfStream(localUser.streamToSend, !mute)

  $(".myWebRTClocalUserButtonMicrophone" + end)
	.css("backgroundColor", localUser.microphoneMuted ? "#fbb": muted ? "#ff8" :"#bfb")
	.css("display", (!peersMicrophoneActive && numLocalUsersGlobal == 1) ||
					(numLocalUsersGlobal == 1 
					&& numMeetingsGlobal == 1 
					&& (typeof youtubePlayers !== "object" || youtubePlayers.size === 0)) 
						? "none": "")
  showHideSelector(".myWebRTClocalUserButtonMicrophoneOn" + end, !muted)
  showHideSelector(".myWebRTClocalUserButtonMicrophoneOff" + end, muted)

}
finally
{
countLocalUserMicrophoneMuteNotUnmute--
if(countLocalUserMicrophoneMuteNotUnmute == 0)
   this.updateGlobalMicrophone(mute)
}

}
//-----------------------------------------------------------
sendMyVideoInfoToOthers(localUser, DO_NOT_RECALCULATE)
{

if(!localUser)
  return

let meetingUUID = localUser.meetingUUID

let meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)

   for(let [key, o] of simplePeersObjects)	
	 if(o.meetingUUID === meetingUUID)
	   {
		let muted = o.cameraMuted[localUser.uuid]	
		    || !peersCameraActive 
			|| localUser.cameraMuted
			|| !meetObj.cameraActive
			|| meetObj.disabled 
			|| o.oFirstOfPeer.allCameraMuted
	
	   if(!DO_NOT_RECALCULATE)
	      if(o.stream) //&& localUser == meetObj.audioContext.activeLocalUser)
			{
			 let track = (localUser.replacedTracks 
						  && localUser.replacedTracks[o.selector] 
						  && localUser.replacedTracks[o.selector].new) 
						  || o.stream.getTracks()[localUser.numTrack]
			 if(track.enabled == muted)
			   track.enabled = !muted 		  //track.muted is readonly	
			}	
		this.sendCommandToPeers(o, "MY_VIDEO", localUser.uuid + " "+ (muted ? "OFF"  : "ON")) //MY_VIDEO is not used for the moment
	   }

this.calculateLocalUserSendVideoToPeers(localUser)	
	
//send individually this.sendCommandToPeers(undefined, "MY_MIC", localUser.uuid + " "+ (localUser.microphoneMuted ? "OFF" : localUser.isSpeaking ? "SPEAK" : "ON"))
}
//-----------------------------------------------------------
sendMyMicInfoToOthers(localUser, DO_NOT_RECALCULATE, doNotInformPeers)
{

if(!localUser)
  return

let meetingUUID = localUser.meetingUUID

let meetObj = meetingsUUIDtoObject.get(meetingUUID)

   for(let [key, o] of simplePeersObjects)	
	if(o.meetingUUID === meetingUUID)
    {
	let muted = o.microphoneMuted[localUser.uuid]	
	    || !peersMicrophoneActive 
		|| globalIsMutedBecauseOfSeveralReasons > 0
		|| localUser.microphoneMuted
		|| !meetObj.microphoneActive
		|| meetObj.disabled 
		|| o.oFirstOfPeer.allMicrophoneMuted

	  o.informedMicrophoneMuted = muted
	
	  if(!DO_NOT_RECALCULATE)
	      if(o.stream && localUser == meetObj.audioContext.activeLocalUser)
			 for(let track of o.stream.getAudioTracks())
			   if(track.enabled == muted)
				  track.enabled = !muted 		  //track.muted is readonly
	
		if(!doNotInformPeers)			
			this.sendCommandToPeers(o, "MY_MIC", localUser.uuid + " "+ (muted ? "OFF" : localUser.isSpeaking ? "SPEAK" : "ON"))
	   }

this.calculateLocalUserSendAudioToPeers(localUser)	
	
//send individually this.sendCommandToPeers(undefined, "MY_MIC", localUser.uuid + " "+ (localUser.microphoneMuted ? "OFF" : localUser.isSpeaking ? "SPEAK" : "ON"))
}
//-----------------------------------------------------------
updateGlobalMicrophone(mute)
{
	
let atLeastOneMicrophoneON = false

if(mute !== undefined || globalIsMutedBecauseOfSeveralReasons == 0)
for(let [meetingUUID, meetObj] of meetingsUUIDtoObject)
  if(!meetObj.notYetUsable)
 {

  let muted = !peersMicrophoneActive 
            || globalIsMutedBecauseOfSeveralReasons > 0
			|| !meetObj.microphoneActive
			|| meetObj.disabled 

  $(".myWebRTCbuttonMicrophone_" + meetingUUID).css("backgroundColor", meetObj.microphoneActive ? muted ? "#ff8" : "#bfb" : "#fbb")
  showHideSelector(".myWebRTCbuttonMicrophoneOn_" + meetingUUID, !muted)
  showHideSelector(".myWebRTCbuttonMicrophoneOff_" + meetingUUID, muted)
}//meetingUUID
	

let muted = !peersMicrophoneActive 
          || globalIsMutedBecauseOfSeveralReasons > 0
$("#myWebRTCbuttonMicrophone_global").css("backgroundColor", peersMicrophoneActive ? muted ? "#ff8" : "#bfb" : "#fbb")
showHideSelector("#myWebRTCbuttonMicrophoneOn_global", !muted)
showHideSelector("#myWebRTCbuttonMicrophoneOff_global", muted)

for(let [meetUUID, meetObj] of meetingsUUIDtoObject)
  if(!meetObj.notYetUsable)
   if(meetObj.globalTracksToSend)
   for(let track of meetObj.globalTracksToSend)
	  switch(track.kind)
		{
		case "audio": track.enabled = peersMicrophoneActive; break
		case "video": track.enabled = peersCameraActive; break
		}


//   this.myCreateAudioMeter()
}
//-----------------------------------------------------------
localUserCameraMuteNotUnmuteToPeer(uuid, selectorOrObject, mute, belongingToMeetingUUID, automatic, doNotChangeValue)
{
if(automatic && !peersCameraActive)	
    return

let localUser = localUsersUUIDtoObject.get(uuid)	
let meetingUUID = belongingToMeetingUUID || localUser.meetingUUID

let meetObj = meetingsUUIDtoObject.get(meetingUUID)

let o = isString(selectorOrObject) ? simplePeersObjects.get(selectorOrObject) : selectorOrObject

if(localUser && meetingUUID != localUser.meetingUUID)
  return

if(mute !== undefined && !doNotChangeValue)
{
	if(!o)
	   localUser.cameraMuted = mute
	else if (!uuid)
		o.oFirstOfPeer.allCameraMuted = mute
	else 
	    o.cameraMuted[localUser.uuid] = mute
}
	
let changed = false
if(localUser)
  changed = this.calculateLocalUserSendVideoToPeers(localUser, o, mute)
else
  for(let [uuid2, localUser2] of localUsersUUIDtoObject)
	if(this.localUserCameraMuteNotUnmuteToPeer(uuid2, selectorOrObject, mute, meetingUUID, undefined, !uuid))	
	  changed = true

let end = "_" + uuid + "_" + o.meetingWithUUID
let muted = (uuid && o.cameraMuted[localUser.uuid])
    || o.oFirstOfPeer.allCameraMuted
    || !peersCameraActive 
	|| (localUser && localUser.cameraMuted)
	|| !meetObj.cameraActive
	|| meetObj.disabled 


$(".myWebRTClocalUserButtonCameraToPeer" + end).css("backgroundColor", (uuid ? !o.cameraMuted[uuid] : !o.oFirstOfPeer.allCameraMuted) ? muted ? "#ff8" : "#bfb" : "#fbb")
showHideSelector(".myWebRTClocalUserButtonCameraOnToPeer" + end, !muted)
showHideSelector(".myWebRTClocalUserButtonCameraOffToPeer" + end, muted)

myWebRTChub.sendMyVideoInfoToOthers(localUser)


let atLeastOneVideoON = false
for(let [uuid, localUser2] of localUsersUUIDtoObject)	
  {
	if(localUser2.meetingUUID != meetingUUID) 
	    continue
	if(!o.cameraMuted[localUser2.uuid])
	  atLeastOneVideoON = true
  }
	
end = "_undefined_" + o.meetingWithUUID
$("."+(atLeastOneVideoON ? "myWebRTClocalUserButtonCameraOnToPeer" : "myWebRTClocalUserButtonCameraOffToPeer") + end).show()
$("."+(!atLeastOneVideoON ? "myWebRTClocalUserButtonCameraOnToPeer" : "myWebRTClocalUserButtonCameraOffToPeer") + end).hide()

return changed
}
//-----------------------------------------------------------
localUserMicrophoneMuteNotUnmuteToPeer(uuid, selectorOrObject, mute, belongingToMeetingUUID, automatic
									 , doNotChangeValue, doNotInformPeers)
{
if(automatic && !peersMicrophoneActive)	
   return

let localUser = localUsersUUIDtoObject.get(uuid)	
let meetingUUID = belongingToMeetingUUID || localUser.meetingUUID

let o = isString(selectorOrObject) ? simplePeersObjects.get(selectorOrObject) : selectorOrObject

if(localUser && meetingUUID != localUser.meetingUUID)
  return

if(mute !== undefined && !doNotChangeValue)
{
	if(!o)
	   localUser.microphoneMuted = mute
	else if (!uuid)
		o.oFirstOfPeer.allMicrophoneMuted = mute
	else 
	    o.microphoneMuted[localUser.uuid] = mute
}


let changed = false
if(localUser)
  changed = this.calculateLocalUserSendAudioToPeers(localUser, o, mute)
else
  for(let [uuid2, localuser2] of localUsersUUIDtoObject)
	if(this.localUserMicrophoneMuteNotUnmuteToPeer(uuid2, selectorOrObject, mute, meetingUUID, undefined, !uuid))
	  changed = true

let end = "_" + uuid + "_" + o.meetingWithUUID

let meetObj = meetingsUUIDtoObject.get(meetingUUID)

let muted = (localUser && o.microphoneMuted[localUser.uuid])
    || o.oFirstOfPeer.allMicrophoneMuted
    || !peersMicrophoneActive 
    || globalIsMutedBecauseOfSeveralReasons > 0
	|| (localUser && localUser.microphoneMuted)
	|| !meetObj.microphoneActive
	|| meetObj.disabled 

$(".myWebRTClocalUserButtonMicrophoneToPeer" + end).css("backgroundColor", (uuid ? o.microphoneMuted[localUser.uuid] : o.oFirstOfPeer.allMicrophoneMuted) ? "#fbb" : (muted ? "#ff8" : "#bfb"))
showHideSelector(".myWebRTClocalUserButtonMicrophoneOnToPeer" + end, !muted)
showHideSelector(".myWebRTClocalUserButtonMicrophoneOffToPeer" + end, muted)

//this.localUserMicrophoneMuteNotUnmute(localUser, mute, meetingUUID, true, true)

//this.updateGlobalMicrophone(undefined)
myWebRTChub.sendMyMicInfoToOthers(localUser, undefined, doNotInformPeers)

return changed
}
//-----------------------------------------------------------
calculateLocalUserSendVideoToPeers(localUser, o, mute)
{

	if(!o)
	{
		for(let [key, o2] of simplePeersObjects)
  		  if(o2.meetingUUID == localUser.meetingUUID)
			this.calculateLocalUserSendVideoToPeers(localUser, o2, mute)
		return
	}

	
let meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)
 
let atLeastOneVideoON = false
let changed = false

  for(let track of localUser.streamToSend.getVideoTracks())
  { 
	let tra = this.trackOrigOfLocalUserToTrackSentToObjectPeer(track.id, o)
	let meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)

    //"mute" no longer used?
	let muted = o.cameraMuted[localUser.uuid]
		   || !peersCameraActive
		   || localUser.cameraMuted
		   || !meetObj.cameraActive
		   || meetObj.disabled 
		   || o.oFirstOfPeer.allCameraMuted

	
	if(!muted)
		atLeastOneVideoON = true
	
	if(tra && tra.enabled === muted)
	  {
		//tra.enabled = !muted
		changed = true
	  }
  }

  for(let track of localUser.streamToSend.getVideoTracks())
	if(track && track.enabled != atLeastOneVideoON)
	  {
	//	track.enabled = atLeastOneVideoON
		changed = true
	  }

return changed
}
//-----------------------------------------------------------
calculateLocalUserSendAudioToPeers(localUser, o, mute)
{
	if(!o)
	{
		for(let [key, o2] of simplePeersObjects)
  		  if(o2.meetingUUID == localUser.meetingUUID)
			this.calculateLocalUserSendAudioToPeers(localUser, o2, mute)
		return
	}
	
   let muteOrig = mute
   if(mute === undefined)
    {
	 if(globalIsMutedBecauseOfSeveralReasons > 0)
	    mute = true
	  else
   		mute = o.microphoneMuted[localUser.uuid]
	}
   else o.microphoneMuted[localUser.uuid] = mute
	
   let meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)
   let atLeastOneMicON = false
   if(muteOrig !== undefined || globalIsMutedBecauseOfSeveralReasons == 0)
   for(let [uuid, localUser2] of localUsersUUIDtoObject)
	{
	if(localUser2.meetingUUID != localUser.meetingUUID)
	  continue
	if(localUser2 == meetObj.activeLocalUser
	  && !o.microphoneMuted[localUser.uuid])
	   atLeastOneMicON = true     
	}

let changed = false	

if(localUser == meetObj.activeLocalUser)
  for(let track of meetObj.firstLocalUser.streamToSend.getAudioTracks())
  { 
	if(track && track.enabled != atLeastOneMicON)
		changed = true

	let tra = this.trackOrigOfLocalUserToTrackSentToObjectPeer(track.id, o)

	let meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)

    //"mute" no longer used?
	let muted = o.microphoneMuted[localUser.uuid] 
	       || o.oFirstOfPeer.allMicrophoneMuted
		   || !peersMicrophoneActive
		   || globalIsMutedBecauseOfSeveralReasons > 0
		   || localUser.microphoneMuted
		   || !meetObj.microphoneActive
		   || meetObj.disabled 

	
	if(tra && tra.enabled === muted)
	  {
		//tra.enabled = !muted
		changed = true
	  }
  }

return changed
}
//-----------------------------------------------------------
peerSpeakersMuteNotUnmute(selectorOrObject, mute, belongingToMeetingUUID, automatic)
{
  if(automatic && !peersSpeakersActive)	
   return
	
  let o = isString(selectorOrObject) ? simplePeersObjects.get(selectorOrObject) : selectorOrObject

  if(belongingToMeetingUUID && belongingToMeetingUUID != o.meetingUUID)
    return

  if(mute !== undefined)
 	 o.speakersActive = !mute	

  let meetObj =  meetingsUUIDtoObject.get(o.meetingUUID)

  let muted = !peersSpeakersActive
			 || meetObj.disabled
		     || !o.speakersActive

  let changed = false

  if(o.videoReceive && o.videoReceive.muted != muted)
    {
	o.videoReceive.muted = muted
	changed = true
	}
  
  	
  let end ="_" + o.uuid
  $("."+(!mute ? "myWebRTCpeerButtonLoud" : "myWebRTCpeerButtonSilent") + end).show()
  $("."+(mute ? "myWebRTCpeerButtonLoud" : "myWebRTCpeerButtonSilent") + end).hide()

 return changed
}
//-----------------------------------------------------------
peerVideoMuteNotUnmute(selectorOrObject, mute, belongingToMeetingUUID, automatic)
{
  if(automatic && !peersVideoActive)	
    return
	
  let o = isString(selectorOrObject) ? simplePeersObjects.get(selectorOrObject) : selectorOrObject

  o.videoActive = !mute

  if(belongingToMeetingUUID && belongingToMeetingUUID != o.meetingUUID)
    return

  let changed = false
  if(o.videoReceive && mute != o.videoReceive.paused)
  {
  if(mute)
  	o.videoReceive.pause()
  else if(!o.videoReceive.alreadyPlayed)
    o.videoReceive.play()
  changed = true
  }

  let end = "_" + o.uuid
  let on = ".myWebRTCpeerButtonVideoOn" + end
  let off = ".myWebRTCpeerButtonVideoOff" + end
  $(!mute ? on : off).show()
  $(mute ? on : off).hide()

return changed
}
//-----------------------------------------------------------
exit(selector, peersObjectsMap = simplePeersObjects)
{
	for(let [key, o] of peersObjectsMap)
		if(!selector || key == selector)
		{
		if(o.peer) 
			{
			let meetObj =  meetingsUUIDtoObject.get(o.meetingUUID)
			this.sendCommandToPeers(o, "CLOSE", o.meetingUUID + "_" + myUUID(meetObj), true)
			this.close(o)
			}
		}
}
//----------------------------------------
showFullBottomBar()
{
	
$("#initialButtonWithBotVideoAndAudio").hide()
}
//----------------------------------------
sendCurrentScreen()
{
	let refresh = divsRefresh[currentDIVid()]
	if(refresh)
		{
		if(!firstTimeSendScreenToPeers || confirm(TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[6])))
			{
			firstTimeSendScreenToPeers = false
			this.sendCommandToPeers(undefined, "DIV_REFRESH", refresh)
			}
		}
	else
		showMessageOnSOSforDuration(TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[5]), 2000)
}
//-----------------------------------------
rotateVideoGlobalPeers(selector, rotated, uuid)
{
	
let localUser = localUsersUUIDtoObject.get(uuid) || activeLocalUser

if(rotated === undefined)
	rotated =  (localUser.rotatedGlobalVideoForPeers + 3) % 4

localUser.rotatedGlobalVideoForPeers = rotated
this.putValueAndSendToPeersAllSiblingsEqual(localUser, "rotatedGlobalVideoForPeers", rotated, "VIDEO_ROTATE")
myWebRTChub.sendCommandToPeers(localUser.uuid, "VIDEO_ROTATE", rotated, localUser.meetingUUID) //now just for info

//now done at drawImage() because of screensharing problem   TweenLite.to(selector, 0.5, {rotation: -rotated * 90})

}
//-------------------------------------------------------------------------
toggleCircleVideoGlobalPeers()
{

let circled = 50 - activeLocalUser.circledGlobalVideoForPeers
	
activeLocalUser.circledGlobalVideoForPeers = circled

this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "circledGlobalVideoForPeers", circled, "VIDEO_ROTATE")
myWebRTChub.sendCommandToPeers(activeLocalUser.uuid, "VIDEO_ROUNDED", circled, activeLocalUser.meetingUUID) //now just for info


}
//----------------------------------------
icon(code)
{
	
	if(activeLocalUser.iconSelectedGlobalForPeers !== undefined)
		{
		$("#webRTC_icon_"+activeLocalUser.iconSelectedGlobalForPeers).css("backgroundColor","#fff")
		$("#peersGlobalVideoSendICON").hide()
		}
	
	if(activeLocalUser.iconSelectedGlobalForPeers === code || code === undefined)
		{
		activeLocalUser.iconSelectedGlobalForPeers = undefined
		}
	else
		{
		activeLocalUser.iconSelectedGlobalForPeers = code
		
		let icon = $("#webRTC_icon_"+activeLocalUser.iconSelectedGlobalForPeers)
		icon.css("backgroundColor","#000")
		//$("#peersGlobalVideoSendICON").show()[0].src = icon[0].src
		
		if(!imagesOfIcons[code])
			imagesOfIcons[code] = createImageFromSVGrawData(iconsRawData[code])

		
		}
	
	if(!activeLocalUser.showHideCornerWasManual[2])
		activeLocalUser.showNotHideCornersOfVideoToSend[2] = activeLocalUser.iconSelectedGlobalForPeers !== undefined
	
	this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "iconSelectedGlobalForPeers", activeLocalUser.iconSelectedGlobalForPeers, undefined)
	this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "showNotHideCornersOfVideoToSend", activeLocalUser.showNotHideCornersOfVideoToSend, undefined)
	this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "showHideCornerWasManual", activeLocalUser.showHideCornerWasManual, undefined)
	myWebRTChub.sendCommandToPeers(undefined, "MY_ICON", activeLocalUser.iconSelectedGlobalForPeers ? cdniverse +"images/OpenMoji/"+activeLocalUser.iconSelectedGlobalForPeers +".svg" : "")

	if(afterChangeToEmotionExecuteThis)
  	  myEval(afterChangeToEmotionExecuteThis)
	afterChangeToEmotionExecuteThis = undefined
}
//----------------------------------------
emotionCornerContents()
{
let s = "<p><nobr class='wm'><label class='wm'><input class='wm automatic_emotion_localUser_"+ activeLocalUser.uuid +"' type='checkbox' onClick='myWebRTChub.switchOnOrOffEmotionDetection(this.checked)'  " + (activeLocalUser.isInAutomaticEmotionDetectionMode ? "checked" : "") + " > " + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[46])+ "</label></nobr><br>"
for(let i = 1; i <= 10; i++)
	{
	let src = cdniverse + "images/emotions/iconfinder_EMOJI_ICON_SET-"+ (i < 10 ? "0" : "") + i +".svg"
	s += "<img class='emotionsToChooseWebRTChub' id='webRTC_emotion_"+i+"' onClick='myWebRTChub.emotion(\""+i+"\")' style='height:2.5em;background-color:#fff'>"
	$.get(src, function (data) 
		{
		    let xml = SVG_XML_cleanAndComplete(new XMLSerializer().serializeToString(data.documentElement))
		    emotionsRawData[i] = xml
			var svg = new Blob([xml], {type:"image/svg+xml"}) //SAFARI does not like ;charset=utf-8
		    let domURL = self.URL || self.webkitURL || self
		    let url = domURL.createObjectURL(svg)
		    
		    let img = $("#webRTC_emotion_"+i)[0]

		    img.onload = function () {
		        domURL.revokeObjectURL(url)
		    }
		    img.src = url
		})
	}
s += "</p>"
$("#peersTopLeft").html(s)
}
//----------------------------------------
emotion(i)
{

	
	
	if(activeLocalUser.emotionSelectedGlobalForPeers !== undefined)
		{
		$("#webRTC_emotion_"+activeLocalUser.emotionSelectedGlobalForPeers).css("backgroundColor","#fff")
		$("#peersGlobalVideoSendEMOTION").hide()
		}
	
	if(activeLocalUser.emotionSelectedGlobalForPeers === i || i === undefined)
		activeLocalUser.emotionSelectedGlobalForPeers = undefined
	else
	  {
		activeLocalUser.emotionSelectedGlobalForPeers = i
		let emotion = $("#webRTC_emotion_"+activeLocalUser.emotionSelectedGlobalForPeers)
		emotion.css("backgroundColor","#93ffc6")
		//$("#peersGlobalVideoSendEMOTION").show()[0].src = emotion[0].src
		
		//CAN NPT USE INFO FROM ICONS FOR IT MUST BE INDEPENDENT OF THEIR SIZES!!!
		if(!imagesOfEmotions[i])
			imagesOfEmotions[i] = createImageFromSVGrawData(emotionsRawData[i])
	  }

	if(!activeLocalUser.showHideCornerWasManual[1])
		activeLocalUser.showNotHideCornersOfVideoToSend[1] = activeLocalUser.emotionSelectedGlobalForPeers !== undefined
		
	this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "emotionSelectedGlobalForPeers", activeLocalUser.emotionSelectedGlobalForPeers, undefined)
	this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "showNotHideCornersOfVideoToSend", activeLocalUser.showNotHideCornersOfVideoToSend, undefined)
	this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "showHideCornerWasManual", activeLocalUser.showHideCornerWasManual, undefined)
		
	myWebRTChub.sendCommandToPeers(undefined, "MY_EMOTION", activeLocalUser.emotionSelectedGlobalForPeers ? cdniverse + "images/emotions/iconfinder_EMOJI_ICON_SET-"+ (i < 10 ? "0" : "") + i +".svg" : "")
	
	if(afterChangeToEmotionExecuteThis)
	  myEval(afterChangeToEmotionExecuteThis)
	afterChangeToEmotionExecuteThis = undefined
}
//-------------------------------------------
activateCorner(cornerID = "")
{
	lastActivateCorner = cornerID

	  if(cornerID == "peersTopLeft" && $("#peersTopLeft").is(":visible"))
	  {
		myWebRTChub.emotion()	
		cornerID = ""
	  }

	  if(cornerID == "peersTopRight" && $("#peersTopRight").is(":visible"))
	  {
		myWebRTChub.icon()	
		cornerID = ""
	  }

	  if(cornerID == "peersBottomLeft")
	  {
		  questionsControlCenterPOINTER("CLICKED_BIG_QUESTION_CORNER")
	      if($("#peersBottomLeft").is(":visible"))
	        cornerID = ""
	  }
	
	  if(cornerID == "peersBottomRight" && $("#peersBottomRight").is(":visible"))
	  {
		myWebRTChub.changedMyLinkToSend(false)
		cornerID = ""
	  }

 $("#peersTopLeft").hide()
 $("#peersTopRight").hide()
 $("#peersBottomLeft").hide()
 $("#peersBottomRight").hide()
 $("#peersInstructionsClickCorners").hide()
 $("#peersControlXYzoomOfMyCamera").hide()
 $("#peersControlMyActiveScreenSharing").hide()
 $("#peersControlXYzoomOfOthersCamera").hide()
 $("#bottomMenuWaitingForOthers").hide()
 
 for(let id in extraPeersToShowInBottomTD)
	 $("#"+ id).hide()

if(cornerID)
	$("#" + cornerID).show()

if(cornerID != "peersInstructionsClickCorners")
  myWebRTChub.removePeersGlobalVideoINSTRUCTIONS()
	 
if(cornerID == "peersControlXYzoomOfMyCamera")
	this.updatePeersVideoCenter(activeLocalUser)

if(cornerID == "peersControlXYzoomOfOthersCamera")
	this.updateOthersVideoCenter()

if(cornerID == "peersControlMyActiveScreenSharing")
	this.updatePeersScreenSharingCenter(activeLocalUser)

if(cornerID == "bottomMenuWaitingForOthers")
	$("#bottomMenuWaitingForOthers").show()


//showHideSelector("#webRTChub_mainTableBottomBar_ID", cornerID != "")	
myWebRTChub.showHideForUseByWebRTChub(cornerID != "")
//recomputeScrollElementSize()	

resizeREALLY()

}
//----------------------------------------
changedAnswerToQuestionOfOtherPeer(answer)
{
	let o = oWhoseQuestionIsBeingShown
	let meetObj = meetingsUUIDtoObject.get(o.meetingUUID)
	myWebRTChub.sendCommandToPeers(o, "TOP_QUESTION_ANSWER_CHANGED", o.meetingUUID + "_" + myUUID(meetObj) + " " + o.questionFromUserUUID + " " + answer)
}
//----------------------------------------
questionsControlCenter(command, param1, param2)
{
let o
let pos
let pos2
let parameters 

switch(command)
{
case "BOTTOM_BAR": myWebRTChub.drawQuestionsBottomBar(); break;
case "CHECKED_NOTCHECKED": 
	$("#questionToShowMyWebRTChubTEXT").attr("disabled", param1);
	$("#questionToShowMyWebRTChubCHECKBOX").prop("checked", param1)
	if(param1)
		myWebRTChub.updateAnswersFromOtherPeers()
	currentMyQuestionUUID = param1 ? generateUUID() : undefined
	break;
case "IS_CHECKED": return $("#questionToShowMyWebRTChubCHECKBOX").prop("checked")
case "CLICKED_BIG_QUESTION_CORNER":
	if($("#peersBottomLeft").is(":visible"))
		myWebRTChub.changedMyQuestionToSend(false)
	else 
		questionsControlCenterPOINTER("BOTTOM_BAR")
	break;
case "DRAW_ON_TOP_QUESTION_FROM_OTHERS":
    o = param1
	let s = o.questionFromUser.question + "<br><input id='answerToQuestionOfOtherPeer' type='text' oninput='myWebRTChub.changedAnswerToQuestionOfOtherPeer(this.value)' " + attributeWithTranslation("placeHolder", TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[28])) + " style='width:18em'>"
	$("#questionThatIscurrentlyBeingAnsweredTo").html( s == "" ? + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[39])  : "<table border='1'>" + s + "</table>")
    break;
case "MY_QUESTION":
	 
	o = param1
	parameters = param2
	
	if(false) //in the future will be for PERSONAL icons to this user
	 {
	 arr = $("#videoReceive_"+o.uuid+"QUESTION")
	 if(parameters == "")
		 arr.hide()
	  else
		 arr.show()
	 }
	 
	  pos = parameters.indexOf(' ')
	  o.questionFromUserUUID = parameters.slice(0, pos)
	  o.questionFromUser = JSON.parse("{" + decodeURIComponent(parameters.slice(pos + 1)) + "}")
	  if(oWhoseQuestionIsBeingShown == o)
		  {
		  showTopBar("topQuestion", o)
		  expandMoreNotLessViewingQuestionFromOther(true)
		  }
	  break
case "QUESTION_TO_OTHER":
	myWebRTChub.updateAnswersFromOtherPeers(true)
	break
case "TOP_QUESTION_SHOWN": 
case "TOP_QUESTION_HIDDEN":
	  o = param1
	  o.viewingMyQuestion = command == "TOP_QUESTION_SHOWN"

	  let showing = 0
	  let oArr = myWebRTChub.getArrayOfOthersObjectsO()
	  for(let i in oArr)
		  if(oArr[i].viewingMyQuestion)
			  showing++
	  $(".numberOfPeersAnsweringQuestion").html(showing)
	  break
case "TOP_QUESTION_ANSWER_CHANGED":
	  o = param1
	  pos = param2.indexOf(' ')
	  pos++
	  pos2 = param2.indexOf(' ', pos)
	  o.questionThatIsAnsweringToUUID = param2.slice(pos, pos2)
	  if(o.questionThatIsAnsweringToUUID === currentMyQuestionUUID)
		  {
		  o.answerToMyQuestion = param2.slice(pos2 + 1)
		  myWebRTChub.updateAnswersFromOtherPeers()
		  }
	  break
default: //makes sense only for plugins
}

}
//-------------------------------------------------
updateAnswersFromOtherPeers(show)
{
	let s = "<table><tr><th>name</th><th>answer</th></tr>"
	  let showing = 0
	  let oArr = myWebRTChub.getArrayOfOthersObjectsO()
	  for(let i in oArr)
		  {
	      let o = oArr[i]
		  s += "<tr><td class='username_"+o.meetingWithUUID+"'>" + o.username + "</td><td>" 
		  	+ (o.questionThatIsAnsweringToUUID === currentMyQuestionUUID && o.answerToMyQuestion? o.answerToMyQuestion : "")+ "</td></tr>"
		  }

	  s += "</table>"
	  
	  $("#topMenuQuestionsForOthers").html(s)
	  if(show)
		$("#topMenuQuestionsForOthers").show()
	  
}
//--------------------------------------	
drawQuestionsBottomBar()
{
	if($("#questionToShowMyWebRTChubCHECKBOX").length == 1)
		return
		
	let s = "<p style='width:100%'><label><input id='questionToShowMyWebRTChubCHECKBOX' type='checkbox' onChange='myWebRTChub.changedMyQuestionToSend(this.checked)' disabled>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[17]) + "</label>"
		   +"  &nbsp; <button onClick='showTopBar(\"questionToOthers\")' style='background-color:#080;color:#fff'>"+ TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[27])+": <b class='numberOfPeersAnsweringQuestion'>0</b></button>"
	    + "<br><input id='questionToShowMyWebRTChubTEXT' type'text' onkeyUp='let s=this.value.trim(); let json=JSON.stringify({question:s});jsonQUESTIONtoSendToOthers=encodeURIComponent(json.slice(1, json.length - 1)); let valid = s !== \"\";let cb = $(\"#questionToShowMyWebRTChubCHECKBOX\");cb.attr(\"disabled\", !valid);if(event.keyCode == 13 && valid) {cb[0].checked=true; myWebRTChub.changedMyQuestionToSend(true)}'></p>"
	    
	$("#peersBottomLeft").html(s)
}
//----------------------------------------
clickOnOtherPeersVideo(event, video, uuid)
{
	let selector = peersUUIDtoSelectors[uuid]
	let o = simplePeersObjects.get(selector)
	
	let dx = video.clientWidth / 3
	let dy = video.clientHeight / 3
	
	let corner
    if(event.offsetY < dy && event.offsetX < dx)
    	corner = 0
    else if(event.offsetY < dy && event.offsetX > dx * 2)
	corner = 3
    else if(event.offsetY > dy * 2 && event.offsetX < dx)
    	corner = 1
    else if(event.offsetY > dy * 2 && event.offsetX > dx * 2)
	corner = 2;
    else if(event.offsetY + 5 > dy * 2 && event.offsetX > dx &&  event.offsetX < dx * 2)
	corner = 5;

    switch(corner)
	    {
	    case 0: break // peersTopLeft
	    case 1: showTopBar("topQuestion", o);break // peersBottomLeft
	    case 2: if(o.linkFromUser)	openBrowser(o.linkFromUser); break //bottomRight
	    case 3: break // peersTopRight
	    case 5: break // bottomCenter
	    		myWebRTChub.showHideCanvasOfImageSend(false)
	    		break
	    }
	myWebRTChub.toggleBigSmallImage(uuid)	

}
//----------------------------------------
clickedCanvas (event, uuid, corner)
{
	let localUser = localUsersUUIDtoObject.get(uuid) || activeLocalUser

    afterChangeToEmotionExecuteThis = undefined
	
	if(this.setActiveLocalUser(localUser))
	  return
				
	let x
	let y
	let dx
	let dy
	
	if(event)
	{
		x = event.offsetX
		y = event.offsetY
		let maxX = localUser.canvasToSendToPeers.clientWidth
		let maxY = localUser.canvasToSendToPeers.clientHeight
		//uses the canvas 4 corners, NOT THE INSIDE 4 CORNMERS OF VIDEO
		if(false && screenStreamToCopyToCanvas) 
			{ 
			maxX = localUser.dxToCopyFromCameraToCanvas
			maxY = localUser.dyToCopyFromCameraToCanvas
			x -= localUser.xToDrawCameraVideoOnScreenShare * localUser.dxToDrawCameraVideoOnScreenShare / localUser.dxToCopyFromCameraToCanvas
			y -= localUser.yToDrawCameraVideoOnScreenShare * localUser.dyToDrawCameraVideoOnScreenShare / localUser.dyToCopyFromCameraToCanvas
			}
		
		if(x < 0 || y < 0 || x > maxX || y > maxY)
			return;
		
		dx = maxX / 3
		dy = localUser.canvasToSendToPeers.clientHeight / 3
	}
		
		if(corner === undefined)
		{
 	    if(y< dy && event.offsetX < dx)
 	    	corner = 0
 	    else if(y < dy && x > dx * 2)
			corner = 3
 	    else if(y > dy * 2 && x < dx)
 	    	corner = 1
 	    else if(y > dy * 2 && x > dx * 2)
			corner = 2;
 	    else if(y + 5 > dy * 2 && x > dx &&  x < dx * 2)
			corner = 5;
 	    else if(y + 5 < dy && x > dx &&  x < dx * 2)
			corner = 6;
		}
		
 	    switch(corner)
 	    {
 	    case 0: this.emotionCornerContents()
				      this.activateCorner("peersTopLeft"); break
 	    case 1: this.activateCorner("peersBottomLeft"); break
 	    case 2: this.activateCorner("peersBottomRight"); break
 	    case 3: this.activateCorner("peersTopRight"); break
 	    case 5: if(!myCanvasToSendIsInMainScreen)
 	    		{
 	    		this.replaceButtonsRotateAndPlusCanvas(true, true)
 	    		this.showHideCanvasOfImageSend(false)
 	    		}
 	    		break
 	    case 6 :
 	    default:   if(this.removePeersGlobalVideoINSTRUCTIONS())
 	    			{
 	    			//nothing
 	    			}
				
				this.activateCorner($("#peersControlXYzoomOfMyCamera").is(":visible") ? "" : "peersControlXYzoomOfMyCamera")

 	    }
	
}
//----------------------------------------
refreshOrdenateSenderOrReceiver(meetObj)
{
if(meetObj.timerOrdenateSenderOrReceiver)
  return	

meetObj.timerOrdenateSenderOrReceiver = setTimeout(function(){meetObj.timerOrdenateSenderOrReceiver=undefined;myWebRTChub.ordenateSenderOrReceiver(meetObj)}, 50)
}
//----------------------------------------
showAllMeetingsIn2D()
{
	
let divsName = new Set()

for(let [meetUUID, meetObj] of meetingsUUIDtoObject)
  	divsName.add(webrtcDivName(meetUUID))

theseDivNamesOccupyAll2D(divsName)
}
//----------------------------------------
addOrRemoveFromMainScreen(rri, meetingUUID, selector, toggleThis, doNotResetLastObjectsMovedToSidePanel)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)

if(!meetObj || !meetObj.disabled)
  if(!isIn3D && !selector && !orderedSetOfOpenedDIVSin2D.has(webrtcDivName(meetingUUID))) 
	selector = "SHOW_MAIN_IN_SIDE_PANEL"	

try
{
for(let key in moveInDOMsenderOrReceiver)
  {
  eval("tempFunctionToCall = " + moveInDOMsenderOrReceiver[key])
  tempFunctionToCall("IN") //false means is receiving
  }


let removeFromMain = false //depends on joinToMain
	
let divAll = $("#divEmcopassingAll_INSIDE" + meetingUUID)[0]
let divSidePanel = $("#globalSidePanel_inside_" + globalSidePanelDirection())[0]
let divThis = $(selector).get(0)
let arr = $(".webrtchub_senderOrReceiver_" + meetingUUID)
if(divThis)
 for(let i = 0; i < arr.length; i++)
  if(arr[i].id == divThis.id)
	  divThis = arr[i] //VERY STRANGE BUT AVOIDS MANY PROBLEMS!!!!
	
let placeAllInMainScreen = false
if(selector != "ALL_TO_SIDE_PANEL" && selector != "SHOW_MAIN_IN_MAIN")
  if(meetObj.numDivsInMainScreen === 1 && divThis && !divThis.isInSidePanel)
	placeAllInMainScreen = true

meetObj.ordenate = []
for(let i = 0; i < 4; i++)
	meetObj.ordenate[i] = []

meetObj.addOrRemoveFromMainScreen_lastSelector = selector

meetObj.numDivsInMainScreen = 0
meetObj.numDivsNORMALInMainScreen = 0
meetObj.numDivsInSidePanel = 0

if(!doNotResetLastObjectsMovedToSidePanel)
	lastObjectsMovedToSidePanel.clear()

for(let i = 0; i < arr.length; i++)
	{
		let div = arr[i]
		let divJQ = $(div)
		let oORl = simplePeersObjects.get("#"+div.id) //object peer OR localUser
		      || localUsersUUIDtoObject.get(div.id.slice("mySelfInMainScreen_".length))
			  || {}
		let isInSidePanel = div.isInSidePanel
		let mainNotSidePanel = !isInSidePanel
		if(selector == "ALL_TO_SIDE_PANEL")
				{
				 div.wasInMainPanel = undefined
				 mainNotSidePanel = false
				}
		else if(selector == "SHOW_MAIN_IN_SIDE_PANEL")
				{
				if(div.wasInMainPanel === undefined)
					div.wasInMainPanel = !isInSidePanel
				mainNotSidePanel = false
				}
		else if(selector == "SHOW_MAIN_IN_MAIN")
		  {
			if(div.wasInMainPanel !== false)
				mainNotSidePanel = true
			}
		else
		{
			 if(orderedSetOfOpenedDIVSin2D.has("webrtchub_main"))
			 	div.wasInMainPanel = undefined
			 if(toggleThis)
				  mainNotSidePanel = div == divThis ? isInSidePanel : !isInSidePanel 
			 else if(divThis) 
				mainNotSidePanel = div == divThis 
				                    || placeAllInMainScreen
		} 
			
	  let actAsScreenShare = (oORl && oORl.screenMode == "SCREEN_SHARE") || divJQ.hasClass("formatAsScreenShare")
			
	  if(mainNotSidePanel)
	    {
		if(actAsScreenShare)
			{
				if(divJQ[0].parentNode !== divAll)
					divJQ.appendTo(divAll)
				meetObj.ordenate[0].push(div)
			}
		else
			{
				if(divJQ[0].parentNode !== divAll)
					divAll.insertAdjacentElement("afterbegin", divJQ[0])
				meetObj.ordenate[1].push(div)
			}
		divJQ[0].isInSidePanel = false
		divJQ.find(".webrtchub_hide_when_inside_Panel").show()
		divJQ.find(".webrtchub_hide_when_main_Panel").hide()
		meetObj.numDivsInMainScreen++
		if(oORl.screenMode == "NORMAL")
		   meetObj.numDivsNORMALInMainScreen++
		}
	  else
	    {
		myStylePosition(divJQ[0], "")
		if(actAsScreenShare)
			{
			if(divJQ[0].parentNode != divSidePanel)
				divJQ.appendTo(divSidePanel)
			meetObj.ordenate[2].push(div)
			}
		else
		    {
			if(divJQ[0].parentNode != divSidePanel)
				divSidePanel.insertAdjacentElement("afterbegin", divJQ[0])
			meetObj.ordenate[3].push(div)
			}
		if(!divJQ[0].isInSidePanel)
			lastObjectsMovedToSidePanel.add(divJQ[0])
		divJQ[0].meetingUUID = meetingUUID
		divJQ[0].isInSidePanel = true
		divJQ.find(".webrtchub_hide_when_inside_Panel").hide()
		divJQ.find(".webrtchub_hide_when_main_Panel").show()
		meetObj.numDivsInSidePanel++
		}
		divJQ.addClass("meeting_show_hide_"+meetingUUID)
	}

this.ordenateSenderOrReceiver(meetObj)
placeTablesUnderDIVfor3D()

if(!isIn3D)
	$(".divEmcopassingAll_HIDDEN_"+meetingUUID).css("overflow", meetObj.numDivsInMainScreen == 1 ? "hidden" : "")

for(let i = 0; i < arr.length; i++)
	{
	let div = arr[i]
	let divJQ = $(div)
	let buttonJQ = divJQ.find(".button_addRemoveMainScreen")
	
	buttonJQ.html("<b>" + ($(div)[0].isInSidePanel ? "+" : "-") + "</b>").show()
	
	if(divJQ.hasClass("addORremoveIsWH100PercentIfUniqueInMain"))
		{
			let wh = "100%";
			if(divJQ[0].isInSidePanel || meetObj.numDivsInMainScreen != 1)
			   wh = ""
			divJQ.css("width", wh).css("height", wh)
		}
	  showHideSelector(divJQ.find(".webrtchub_hideIfOnlyInMain"), divJQ[0].isInSidePanel || meetObj.numDivsInMainScreen > 1)
	  showHideSelector(divJQ.find(".webrtchub_showIfOnlyInMain"), !divJQ[0].isInSidePanel && meetObj.numDivsInMainScreen == 1)
	  if(arr.length == 1)
		divJQ.find(".webrtchub_hideIfOnlyOne").hide()
	  if(meetObj.numDivsInMainScreen == 0)
		divJQ.find(".webrtchub_hideIfNoneOnMainScreen").hide()
	}
	
let oneVisible = false	
for(let divChild of divSidePanel.children)
  if(divChild.style.display != "none") 
	oneVisible = true 
	
if(!oneVisible
	&& $("#globalSidePanel_inside_top_vertical")[0].children.length == 0
	&& $("#globalSidePanel_inside_top_horizontal")[0].children.length == 0)
  this.closeGlobalSidePanel()
else
  this.showGlobalSidePanel(true, true)

this.resizeElementsWithPeersParticipant(rri, undefined, undefined, undefined, milisecondsMoveObjects)

  }
  finally
	{
	for(let key in moveInDOMsenderOrReceiver)
	  {
	  eval("tempFunctionToCall = " + moveInDOMsenderOrReceiver[key])
	  tempFunctionToCall("OUT") //false means is receiving
	  }
	}
}
//----------------------------------------------------------------------------
ordenateSenderOrReceiver(meetObj)
{
if(meetObj.timerOrdenateSenderOrReceiver)
  {
	clearTimeout(meetObj.timerOrdenateSenderOrReceiver)
	meetObj.timerOrdenateSenderOrReceiver = undefined
  }	


try
{
for(let key in moveInDOMsenderOrReceiver)
  {
  eval("tempFunctionToCall = " + moveInDOMsenderOrReceiver[key])
  tempFunctionToCall("IN") //false means is receiving
  }

if(meetObj.ordenate)
  for(let i = 0; i < 4; i++)
	this.ordenateSenderOrReceiverREALLY(meetObj.ordenate[i], meetObj)

  }
  finally
  {
	for(let key in moveInDOMsenderOrReceiver)
	  {
	  eval("tempFunctionToCall = " + moveInDOMsenderOrReceiver[key])
	  tempFunctionToCall("OUT") //false means is receiving
	  }
  }

}
//----------------------------------------------------------------------------
ordenateSenderOrReceiverREALLY(arr, meetObj)
{
if(!arr || arr.length <= 1)
  return

let areInSidePanel = arr[0].isInSidePanel

let sidePanelDiv = this.globaSidePanelDiv()
let sidePanelFitsAll = sidePanelDiv.scrollHeight <= sidePanelDiv.clientHeight
				

let children = arr[0].parentNode.children
let arr2 = []
for(let c = 0; c < children.length; c++)
  if(arr.includes(children[c]))
    arr2.push(children[c])
arr = arr2

for(let i = 0; i < arr.length; i++)
   $(arr[i]).attr("domChangesBeforeMoveInDOMsenderOrReceiver", false) 

for(let i = arr.length - 1; i >= 0; i--)
  for(let j = 0; j < i; j++)
	{
				
	let div = arr[j]
	let divJQ = $(div)
	let localuser1 = localUsersUUIDtoObject.get(div.id.slice("mySelfInMainScreen_".length))
	let oORl = simplePeersObjects.get("#"+div.id) //object peer OR localUser
				|| localuser1
				|| {}
			let div2 = arr[j + 1]
			let divJQ2 = $(div2)
			let oORl2 = simplePeersObjects.get("#"+div2.id) //object peer OR localUser
			let localuser2 = localUsersUUIDtoObject.get(div2.id.slice("mySelfInMainScreen_".length))
			oORl2 = oORl2 
				|| localuser2
				|| {}
	//		if(div2.nextSibling != div)

			let ordenateByLetterNumber = false
			let change
			if(areInSidePanel) //speaking only ordenates when in Side Panel
				{
				
				if(sidePanelFitsAll)
					ordenateByLetterNumber = true //no need to change place
				else if(oORl2.isSpeaking && !oORl.isSpeaking)
					change = true
		        else if(!localuser1 && !oORl.isSpeaking && localuser2)
				  change = true //my users go to the top
		        else if(localuser1 && localuser2)
				  ordenateByLetterNumber = true
				else 
					{
					if(oORl2.isSpeaking && (oORl2.isSpeakingTimeChange < oORl2.isSpeakingTimeChange))
							change = true //when speaking privilige the one who started speaking before
					if(!oORl2.isSpeaking && (oORl2.isSpeakingTimeChange > oORl2.isSpeakingTimeChange))
							change = true //when NOT speaking privilige the one who stopped speaking more recently
					}
				}
			else ordenateByLetterNumber = true
			
			if(ordenateByLetterNumber)
			{
			change = oORl2.videoStream && !oORl.videoStream
			if((oORl.videoStream != undefined) == (oORl2.videoStream != undefined))
			  {
			  if(oORl2.videoStream)
				{
				if(oORl2.videoStream.letter < oORl.videoStream.letter)
					change = true
				if(oORl2.videoStream.letter == oORl.videoStream.letter)
					{
			       	if(oORl2.videoStreamRectNumber < oORl.videoStreamRectNumber)
					  change = true
					}
				}
			  }
	        }
			

				
			if(change)		
				{
				let h = arr[j]
				arr[j] = arr[j + 1]
				arr[j + 1] = h
				if(div2.hasAttribute("avoidDetachingFromDOM"))
				   {
					div2.insertAdjacentElement("afterend", div)
					$(div).attr("domChangesBeforeMoveInDOMsenderOrReceiver", true) 
					}
				else
				   {
					div.insertAdjacentElement("beforebegin", div2)
					$(div2).attr("domChangesBeforeMoveInDOMsenderOrReceiver", true) 
				   }
				}
  }

}
//----------------------------------------------------------------------------
globaSidePanelDiv()
{
return globalSidePanelDirection() == "vertical"
  ? $("#globalSidePanel_inside_parent_vertical")[0]
  : $("#globalSidePanel_inside_parent_horizontal")[0]
}
//----------------------------------------------------------------------------
resizeBottomBarViewingCanvas()
{
	if(!loadedGSAPgreensock())	
	{
	setTimeout(function(){myWebRTChub.resizeBottomBarViewingCanvas()}, 10)
	return
	}

	const finalHeight = currentWidthHeightPeersGlobalVideoSendDIV == 144 ? 72 : 144

$(".sameSizeAsBottomBarWebRTChub").css("max-height", finalHeight - 2)
			
$("#breakBetweenTablesOfCircleAndColors").css("display", finalHeight == 72 ? "none" : "")

$("#TDthatExtendsToReceiveRotate").css("vertical-align","top")

  if(finalHeight == 72)
		{
	    currentWidthHeightPeersGlobalVideoSendDIV = finalHeight
	  	myWebRTChub.replaceButtonsRotateAndPlusCanvas(true)
		}

  let dxdy = finalHeight == 72 ? 20 : 30

		  
  
  if(!myCanvasToSendIsInMainScreen)
    TweenLite.to(".canvasForPeersWebRTC", 0.35, 
		  {
	  		width: currentWidthHeightPeersGlobalVideoSendDIV * currentWidthToHeightRatioForCanvasVideoSend + "px",
	  		height: finalHeight + "px",
	  		onUpdate()
	  		           { 
	  			 		currentWidthHeightPeersGlobalVideoSendDIV = $(".canvasForPeersWebRTC").css("height")
	  					resizeREALLY()
	  				   },
	  		onComplete()
  						{
  						currentWidthHeightPeersGlobalVideoSendDIV = finalHeight
  						myWebRTChub.replaceButtonsRotateAndPlusCanvas()
  						}
		  })
		  
}
//----------------------------------------
replaceButtonsRotateAndPlusCanvas(placeSmaller, setWidthHeight)
{
try
{
	if(placeSmaller)
	{
		currentWidthHeightPeersGlobalVideoSendDIV = 72
	  if(setWidthHeight)
		  {
		  let dxdy = 20
	  	  $(".canvasForPeersWebRTC").css("width", currentWidthHeightPeersGlobalVideoSendDIV).css("height", currentWidthHeightPeersGlobalVideoSendDIV) 
		  }
  	  recomputeScrollElementSize()
	  return
	}
	
}
finally
{
   $("#TDthatExtendsToReceiveRotate").css("vertical-align","")
}
}
//----------------------------------------
showHideCanvasOfImageSend(showNotHide)
{
showHideSelector("#peersGlobalVideoSendDIV", showNotHide)
showHideSelector("#showPeersGlobalVideoSend", !showNotHide)
showHideSelector("#hidePeersGlobalVideoSend", showNotHide)
showHideSelector("#buttonsPeersOfRotateAndPlus", showNotHide)
}
//----------------------------------------
changedMyQuestionToSend(trueNotFalse)
{
  
  if(trueNotFalse === undefined)
	     trueNotFalse = questionsControlCenterPOINTER("IS_CHECKED")	
  else if(trueNotFalse === meetingSelectedWebRTC().firstLocalUser.questionMarkCornerShow)
	  		return
		
   activeLocalUser.questionMarkCornerShow = trueNotFalse

   if(trueNotFalse && !activeLocalUser.imageOfQuestionMark)
	   activeLocalUser.imageOfQuestionMark = createImageFromSVGrawData(questionRawData)
		  
	if(!activeLocalUser.showHideCornerWasManual[4])
		activeLocalUser.showNotHideCornersOfVideoToSend[4] = activeLocalUser.questionMarkCornerShow
	   
	   
   questionsControlCenterPOINTER("CHECKED_NOTCHECKED", trueNotFalse) //updates	jsonQUESTIONtoSendToOthers
   //order of questionsControlCenterPOINTER() and sendCommandToPeers() is important
   myWebRTChub.sendCommandToPeers(undefined, "MY_QUESTION", currentMyQuestionUUID + " " + (trueNotFalse ? jsonQUESTIONtoSendToOthers : ""))

   this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "questionMarkCornerShow", activeLocalUser.questionMarkCornerShow, undefined)
   this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "showHideCornerWasManual", activeLocalUser.showHideCornerWasManual, undefined)
   this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "showNotHideCornersOfVideoToSend", activeLocalUser.showNotHideCornersOfVideoToSend, undefined)
   this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "imageOfQuestionMark", activeLocalUser.imageOfQuestionMark, undefined)

   
}
//----------------------------------------
changedMyLinkToSend(trueNotFalse)
{
	
	activeLocalUser.myURLtoSendToOthers = $("#myLinkToOtherPeers").val()
	let checkboxChecked = $(".showHideMyLinkToOtherPeers").prop("checked")
	    && this.verifyURLlinkChanged()

    

	if(trueNotFalse !== undefined)
		{
		if(trueNotFalse === checkboxChecked)
		  return
		checkboxChecked = trueNotFalse
		$(".showHideMyLinkToOtherPeers").prop("checked", trueNotFalse);
		}
	
	$("#myLinkToOtherPeers").attr("disabled", checkboxChecked) 
	
   activeLocalUser.URLlinkCornerShow = checkboxChecked

   if(!checkboxChecked)
	   activeLocalUser.myURLtoSendToOthers = ""
   else if(!activeLocalUser.imageOfURLlink)
	   activeLocalUser.imageOfURLlink = createImageFromSVGrawData(URLlinkRawData)

   if(!activeLocalUser.showHideCornerWasManual[3])
		activeLocalUser.showNotHideCornersOfVideoToSend[3] = activeLocalUser.URLlinkCornerShow

   myWebRTChub.sendCommandToPeers(undefined, "MY_URL", activeLocalUser.myURLtoSendToOthers)

   this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "URLlinkCornerShow", activeLocalUser.URLlinkCornerShow, undefined)
   this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "myURLtoSendToOthers", activeLocalUser.myURLtoSendToOthers, undefined)
   this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "showHideCornerWasManual", activeLocalUser.showHideCornerWasManual, undefined)
   this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "showNotHideCornersOfVideoToSend", activeLocalUser.showNotHideCornersOfVideoToSend, undefined)
   this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "imageOfURLlink", activeLocalUser.imageOfURLlink, undefined)

}
//--------------------------------------------------------------------
setResolutionOfScreenShare(resolution)
{
let videoConstraints = {}
switch(resolution)
{
case 'default':
	break
case 'fit-screen':
        videoConstraints.width = screen.width
        videoConstraints.height = screen.height
    break;
case '4K':
        videoConstraints.width = 3840
        videoConstraints.height = 2160
    break
case '1080p':
        videoConstraints.width = 1920
        videoConstraints.height = 1080
    break
case '720p':
        videoConstraints.width = 1280
        videoConstraints.height = 720
    break
case '480p':
        videoConstraints.width = 853
        videoConstraints.height = 480
    break
case '360p':
        videoConstraints.width = 640
        videoConstraints.height = 360
}
return videoConstraints
}
//----------------------------------------
changedToThisScreenMode(localUser)
{
	let s = localUser.screenMode + " " 
	   + localUser.dxToCopyFromCameraToCanvas 
	   + " " + localUser.dyToCopyFromCameraToCanvas
       + " " + (localUser.spareCanvasUsed ? localUser.spareCanvasUsed.videoTrackUsed.id : "")

	if(localUser.screenMode && localUser.currentScreenModeToSendToPeers != s) 
	{
	  localUser.currentScreenModeToSendToPeers = s	
	  myWebRTChub.sendCommandToPeers(undefined, "SCREEN_MODE" , localUser.uuid + " " +localUser.currentScreenModeToSendToPeers)
	}
}
//----------------------------------------
stopScreenShare()
{
	// showNotHideSelector(".parametersForScreenSharingPeers", !screenStreamToCopyToCanvas)
	
	if(screenStreamToCopyToCanvas)
		{
		if ($("#peersControlMyActiveScreenSharing").is(":hidden"))
		  {
			myWebRTChub.activateCorner("peersControlMyActiveScreenSharing")
		    return
		  }

		screenStreamToCopyToCanvas = undefined
		activeLocalUser.xToDrawCameraVideoOnScreenShare = 0
		activeLocalUser.yToDrawCameraVideoOnScreenShare = 0

	    $(activeLocalUser.canvasToSendToPeers).css("width", currentWidthHeightPeersGlobalVideoSendDIV + "px")
		myWebRTChub.resizeTwoCanvas(activeLocalUser)
		
		myWebRTChub.changedToThisScreenMode(activeLocalUser)
		currentWidthToHeightRatioForCanvasVideoSend = 1
		myWebRTChub.resizeElementsWithPeersParticipant(undefined)

		}
	
}
//----------------------------------------
startScreenShare(meetingUUID)
{

    meetingUUID = meetingUUID || meetingIDselectedWebRTChub

	let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	
		//tests http://122.248.235.139:9191/WebRTC-Experiment-master/getDisplayMedia/
	
		  let resolution = myWebRTChub.setResolutionOfScreenShare("1080p")
			  var displayMediaStreamConstraints = {
				    video: {
					    //SAFARI fails with some of these Constraints!!!
//				        width: resolution.width,
//				        height: resolution.height,
//				        displaySurface: 'monitor', // monitor or window or application or browser
//				        logicalSurface: true,
				        frameRate: {ideal:5}, //lowerFrameRate,
				        // aspectRatio: 1.77,
				        cursor: 'always', // always or never or motion
				    }
				};

			  navigator.mediaDevices.getDisplayMedia(displayMediaStreamConstraints)
				  .then(function(origStream) 
				  {
					try
					{
	
					let stream = newMediaStreamWithTracks ? new MediaStream(origStream.getTracks()) : new MediaStream() //ESSENTIAL: more flexible to add and remove streams!!!
				    if(!newMediaStreamWithTracks)
				      for(let track of origStream.getTracks()) 
				   		stream.addTrack(track.clone())
				
					let videoStream = {}
					videoStream.video = document.createElement("VIDEO")
					videoStream.video.srcObject = origStream
					
					let letter = nextVideoStreamToCopyToCanvasLETTER
					nextVideoStreamToCopyToCanvasLETTER = String.fromCharCode(nextVideoStreamToCopyToCanvasLETTER.charCodeAt(0) + 1)
					videoStreamToCopyToCanvas.set(letter, videoStream) 
					lastVideoStreamToCopyToCanvas = videoStream
					videoStream.fitType = "C"
					videoStream.screenMode = "SCREEN_SHARE" 
					
					videoStream.id = "videoStreamOfScreen"			
					videoStream.letter = letter
					videoStream.cameraRects = new Map()
		
					videoStream.video.muted = true //to avoid echo (my own video does not need my voice!)
					videoStream.video.play()
					
					const localUser = myWebRTChub.addLocalUser(meetObj.firstLocalUser.username, meetingUUID, videoStream)
						
					let numTrack = localUser.numTrack

					const actionOnEventStopScreenSharing = function ()
		    		{				
		  			if(localUser.streamOrig)
						myWebRTChub.optionOfLocalUser(localUser, "remove", true)
					}

					//stream.addEventListener('ended', () => {actionOnEventStopScreenSharing()})
					//stream.addEventListener('inactive', () => {actionOnEventStopScreenSharing()})

					localUser.streamOrig = origStream
						 
					let track = stream.getVideoTracks()[0]
					let trackOriginal = track
						 
						//Click on browser UI stop sharing button
						track.addEventListener('ended', () => 
							{
								actionOnEventStopScreenSharing()
							})
						//SAFARI only PAUSES and the RESUMES screen sharing, does not end it!

						 if(!localUser.replacedTracks)
					     	localUser.replacedTracks = []
						 for(let [key, o] of simplePeersObjects)
	  						{
							o.peer.replaceTrack(o.globalTracksToSend[numTrack], track, o.stream)	
							localUser.replacedTracks[key] = { "old" : o.globalTracksToSend[numTrack]
															 , "new" : track}			
							}
						 //after o.peer.replaceTrack	
						
						 localUser.streamToSendToReplaceStreamToSend = new MediaStream([trackOriginal])	
						 //setTimeout(function(){localUser.streamToSend = new MediaStream([trackOriginal])}, 4000)
						 	 
						 //introduces PROBLEMS ! meetObj.spareTracks[numTrack] = trackOriginal
						 meetObj.globalTracksToSend[numTrack] = trackOriginal

					let style = videoStream.video.style
					style.position = "absolute"
					style.top = "0px"
					style.left = "0px"
					style.width = "100%"
					style.height = "100%"
					style.maxWidth = "100%"
					style.maxHeight = "100%"
					$(videoStream.video).addClass("maxWH100percent")
					
					$("#peersGlobalVideoSendDIV_main_" + localUser.uuid)[0].insertAdjacentElement("afterbegin", videoStream.video)
					localUser.videoToSendToPeers = videoStream.video
					
					localUser.dxToCopyFromCameraToCanvas = 0 //to be recalculated
					
					//myWebRTChub.addActiveUserToVideoStreamCameraRect(activeLocalUser, videoStream)
					
					myWebRTChub.refreshManageLocalUsersToSend()
			
					}
					catch(error)
					{
						console.log('getDisplayMedia SUCCESS but error after: ', error.message, error.name)
					}
				  })
				.catch(function(error) 
				  {
					  $(".parametersForScreenSharingPeers").hide()

					  showMessageOnSOSforDuration(TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[20]), 2000)

					  console.log('getDisplayMedia: ', error.message, error.name)
				  })
			  
}
//----------------------------------------
getFirstFreeNumTrack(meetObj)
{
let num = 1 // 0 first is audio, 1 -> 10 are video
while(true)
{
  let found = false
  for(let [uuid, localUser] of localUsersUUIDtoObject)
    if(localUser.meetingUUID == meetObj.meetingUUID 
	  && localUser.numTrack === num)
     {
	  found = true
      break
	 }

  if(!found)
    return num

  num++

  if(num == maxLocalUsersGlobalPerMeeting)
	return meetObj.numLocalUsersInMeeting
}
   	
}
//----------------------------------------
getAudioDeviceIDFromVideoDeviceID(videoDeviceID)
{
		let groupId
		let select = $("#videoSourcePeers")[0]
		for(let i = 0; i < select.children.length; i++)
		{
			let option = select.children[i]
			if(option.value == videoDeviceID) //option.value is deviceId
				groupId = option.groupId	
		}
		let selectAudio = $("#audioSourcePeers")[0]
		if(groupId)
		for(let i = 0; i < selectAudio.children.length; i++)
			{
			let option = selectAudio.children[i]
			if(option.groupId == groupId)
				return option.value //deviceId	
			}
}
//----------------------------------------
beforeGlobalAudioVideoStream(meetingUUID, retrying, videoIDparam, createUser, defaultUsername, audioIDparam, localUser)  
{
	
// VERY BAD IDEA: even as audio.deviceID.ideal it makes getUserMedia Fail!!!
//if(!onNewGetUserMediaChooseThisAudioInputDeviceID && !audioIDparam)
//   onNewGetUserMediaChooseThisAudioInputDeviceID = this.getAudioDeviceIDFromVideoDeviceID(videoIDparam)

if(myWebRTChub.addGlobalAudioVideoStream(meetingUUID, retrying, videoIDparam, createUser, defaultUsername, audioIDparam, localUser))
	showTopBar("")
setInitial_addGlobalAudioVideoStream=false
}
//----------------------------------------
initializeAfterDivOfEnterMeeting(meetingUUID, titleEncoded, subjectEncoded, fullLinkEncoded)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)
if(titleEncoded && !meetObj.title)
   meetObj.title = decodeURIComponent(titleEncoded)
   
if(subjectEncoded && !meetObj.subject)
   meetObj.subject =   decodeURIComponent(subjectEncoded)
	
if(fullLinkEncoded)	
	meetObj.fullLink = decodeURIComponent(fullLinkEncoded)
	
let localUserInvited = meetingUUIDtoLocalUserInvited.get(meetingUUID)
if(!localUserInvited)
  return true

if(localUserInvited.title && !meetObj.title)
   meetObj.title = localUserInvited.title
	
$("#inputForUsernameEnterMeeting_" + meetingUUID)[0].value = localUserInvited.username
initialVideoID = localUserInvited.deviceIDvideoOrigStream
onNewGetUserMediaChooseThisAudioInputDeviceID =  localUserInvited.deviceIDaudioOrigStream
if(localUserInvited.enterImmediately)
{
	localUserInvited.enterImmediately = false
	return false
}
return true


}
//----------------------------------------
toggleSecondCameraShare(meetingUUID, initialVideoSelector, autoSelectFirst = false, refresh)
{
    meetingUUID = meetingUUID || meetingIDselectedWebRTChub
	
	let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	if(activeLocalUser.meetingUUID !== meetingUUID)
		this.setActiveLocalUser(meetObj.firstLocalUser)
	
	lastInitialVideoSelector = initialVideoSelector
	lastAutoSelectFirst = autoSelectFirst
	
	if($("#topMenuGeneralUseMyWebRTChub").is(":visible"))
	{
	  if(!refresh)	
		return showTopBar("")
	}
	else if(refresh)
		return

		
		let s = "<table style='width:98%;margin:0.5em 0px'><tr><td>" 
		if(activeLocalUser && !activeLocalUser.defaultNameAddNewUser)
		   activeLocalUser.defaultNameAddNewUser = activeLocalUser.username + " +"

		myWebRTChub.defaultNameAddNewUser = activeLocalUser.defaultNameAddNewUser

		if(initialVideoSelector)
		  s += "<b>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[70]) + "</b>"
		else
		  s += TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[69])
			  + "<br><input type='text' onChange='myWebRTChub.defaultNameAddNewUser=this.value' value='"+  myWebRTChub.defaultNameAddNewUser +"'>"
		s += "</td><td onClick='showTopBar(\"\")' style='cursor:pointer;width:1px;color:red'><b><nobr>X &nbsp; &nbsp; </nobr></b></td></tr></table>"
		
		let select = $("#videoSourcePeers")[0]
		if(!select)
		   {
			showTopBar("lsdkdçlkd")	
			afterGotDevicesForPeers = "myWebRTChub.toggleSecondCameraShare(\"" + meetingUUID + "\",\""+initialVideoSelector+"\","+autoSelectFirst+")"
			myWebRTChubEnumerateDevices()
			return
		   }
		let selectAudio = $("#audioSourcePeers")[0]
		
		gotDevicesForPeers(false, selectAudio, false, select, true)

		let evaluateJSatEnd = ""

		for(let i = 0; i < select.children.length; i++)
			{
			let option = select.children[i]
			if(option && option.value != -1)
				{
				if(s != "")
					s += "<br>"
				let bkColor = "#ffc"
				if(this.getVideoStreamFromDevicesID(option.value))
					bkColor = "#dfd"
				else  if(myWebRTChub.videoDevicesIDthatFailed[option.value]) 
					bkColor = "#fdd"
				else if(initialVideoID && initialVideoID == option.value)
					bkColor = "#dfd"
					
				let js = (initialVideoSelector ? "setInitial_addGlobalAudioVideoStream=\""+initialVideoSelector+"\";":"")+"myWebRTChub.beforeGlobalAudioVideoStream(\"" + meetingUUID + "\",true,\""+option.value+"\", true, myWebRTChub.defaultNameAddNewUser)  ";
				if(autoSelectFirst)
					{
					evaluateJSatEnd = js
					break	
					}
					
				s += "<button onClick='"+ js + "' style='background-color:"+bkColor+"'>"+ option.innerHTML +"</button>"
				}
			}
			
		
		s += "<div style='text-align:left;margin:0.5em'>"
		onNewGetUserMediaChooseThisAudioInputDeviceID = undefined
		s += "<label;display:inline-flex;align-items:center;width:100%'><input type='radio' onClick='onNewGetUserMediaChooseThisAudioInputDeviceID=undefined' checked name='radio_choose_audio_input' >auto mic</label>"
		for(let i = 0; i < selectAudio.children.length; i++)
			{
			let option = selectAudio.children[i]
			if(option && option.value != -1)
				{
				if(s != "")
					s += "<br>"
				let bkColor = "#ffc"
				if(this.getVideoStreamFromDevicesID(option.value))
					bkColor = "#dfd"
				else  if(myWebRTChub.videoDevicesIDthatFailed[option.value]) 
					bkColor = "#fdd"
				else if(initialVideoID && initialVideoID == option.value)
					bkColor = "#dfd"

				let js = "onNewGetUserMediaChooseThisAudioInputDeviceID=\"" + option.value + "\"";
				if(autoSelectFirst)
					{
					evaluateJSatEnd =  js + ";" + evaluateJSatEnd
					break	
					}
					
				s += "<label style='background-color:"+bkColor+"';display:inline-flex;align-items:center;width:100%'><input type='radio' onClick='"+ js +"' name='radio_choose_audio_input' >"+ option.text +"</label>"
				}
			}
		s += "</div>"
			
		if(evaluateJSatEnd != "")
			 return myEval(evaluateJSatEnd)

			
		$("#topMenuGeneralUseMyWebRTChub").html(s)
		showTopBar("#topMenuGeneralUseMyWebRTChub")

}
//----------------------------------------
toggleSecondMicrophoneShare()
{
	if(peersMicrophoneActive)
	  return myWebRTChub.meetingsMicrophoneMuteNotUnmute(undefined, true)	
	
	if($("#topMenuGeneralUseMyWebRTChub").is(":visible"))
	  return showTopBar("")
	
		let s = "<table style='width:98%;margin:0.5em 0px'><tr><td>" 
		if(!this.defaultNameAddNewUser)
		   this.defaultNameAddNewUser = activeLocalUser.username + " +"
		else
		   this.defaultNameAddNewUser += "+"
		if(!loggedIn())
		  s += "<b>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[75]) + "</b>"
		else
		  s += TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[69])
			  + "<br><input type='text' onChange='myWebRTChub.defaultNameAddNewUser=this.value' value='"+  this.defaultNameAddNewUser +"'>"
		s += "</td><td onClick='showTopBar(\"\")' style='cursor:pointer;width:1px;color:red'><b><nobr>X &nbsp; &nbsp; </nobr></b></td></tr></table>"
		
		let select = $("#audioSourcePeers")[0]
		if(!select)
		   {
			showTopBar("lsdkdçlkd")	
			afterGotDevicesForPeers = "myWebRTChub.toggleSecondMicrophoneShare()"
			myWebRTChubEnumerateDevices()
			return
		   }
		
		gotDevicesForPeers(false, select, false, false, true)

		if(select.children.length <= 1 && !loggedIn())
			{
			showTopBar("")	
			myWebRTChub.meetingsMicrophoneMuteNotUnmute(undefined, false)
			return 
			}
		
		for(let i = 0; i < select.children.length; i++)
			{
			let option = select.children[i]
			if(option && option.value != -1)
				{
				if(s != "")
					s += "<br>"
				let bkColor = "#ffc"
				/*
				if(this.getVideoStreamFromDevicesID(option.value))
					bkColor = "#dfd"
				else  if(myWebRTChub.videoDevicesIDthatFailed[option.value]) 
					bkColor = "#fdd"
				else */ if(initialAudioID && initialAudioID == option.value)
					bkColor = "#dfd"
					
				s += "<button onClick='myWebRTChub.meetingsMicrophoneMuteNotUnmute(undefined, false);"+(!loggedIn() ? "setInitial_addGlobalAudioVideoStream=true;":"")+"if(myWebRTChub.addGlobalAudioVideoStream(undefined, true,undefined, true, myWebRTChub.defaultNameAddNewUser,\""+option.value+"\"));showTopBar(\"\");setInitial_addGlobalAudioVideoStream=false;' style='background-color:"+bkColor+"'>"+ option.innerHTML +"</button>"
				}
			}
			s += "<br>&nbsp;"
		$("#topMenuGeneralUseMyWebRTChub").html(s)
		showTopBar("#topMenuGeneralUseMyWebRTChub")

}
//----------------------------------------
adjustInstructionsToCanvas()
{
for(let [uuid, localUser] of localUsersUUIDtoObject)
  if(undefined != $(localUser.canvasToSendToPeers).css("width"))
	 $("#peersGlobalVideoINSTRUCTIONS_" + localUser.uuid).show()[0].src = cdniverse +"images/talkisi/corners_help13" + ( activeLocalUser.circledGlobalVideoForPeers == 0 ? "" : "_circle" )+ (myCanvasToSendIsInMainScreen ? "_main" : "") + ".svg" 
}
//----------------------------------------
buttonPlusDownNotUp(downNotUp, plusNotMinus)
{

let localUser = activeLocalUser
if(downNotUp)
	{
		this.adjustInstructionsToCanvas()
		setTimeout("$('.peersGlobalVideoINSTRUCTIONS').fadeOut(1000)", 2000)
		myWebRTChub.activateCorner("peersInstructionsClickCorners")	  
	}
}
//----------------------------------------
removePeersGlobalVideoINSTRUCTIONS()
{
if($(".peersGlobalVideoINSTRUCTIONS").is(":hidden"))
	return false
	
$(".peersGlobalVideoINSTRUCTIONS").hide()
return true
}
//----------------------------------------
autoRecalculateDxDyAndDeltasAndZoom(localUser)
{

let video = localUser.videoStream.video

let x = nextRectOfHeadForAvatarWebRTChub[localUser.numLocalUser].x
let y = nextRectOfHeadForAvatarWebRTChub[localUser.numLocalUser].y
let width = nextRectOfHeadForAvatarWebRTChub[localUser.numLocalUser].width
let height = nextRectOfHeadForAvatarWebRTChub[localUser.numLocalUser].height
let incWidth = width * 0.40
let incHeight = height * 0.40
width += incWidth
height += incHeight
x = Math.max(0, x - incWidth / 2)
y = Math.max(0, y - incHeight / 2)

let zoomFinal = Math.min( localUser.videoStream.video.videoWidth  / width
		, localUser.videoStream.video.videoHeight / height)
		
let delay = 5		
		
let zoom		
if(lastZoomRecalculate === undefined)
  zoom = zoomFinal
else
  zoom = lastZoomRecalculate + (zoomFinal- lastZoomRecalculate) / delay
lastZoomRecalculate = zoom

let dxToCopyFromCameraToCanvasFinal = Math.min(video.videoWidth, video.videoHeight) / zoom 
let dyToCopyFromCameraToCanvasFinal = Math.min(video.videoHeight, video.videoWidth) / zoom

x = Math.min(x, video.videoWidth - dxToCopyFromCameraToCanvasFinal)
y = Math.min(y, video.videoHeight - dyToCopyFromCameraToCanvasFinal)

let dxDeltaToCopyFromCameraToCanvasFinal = x // zoom * localUser.dxToDrawCameraVideoOnScreenShare / video.videoWidth
let dyDeltaToCopyFromCameraToCanvasFinal = y // zoom * localUser.dyToDrawCameraVideoOnScreenShare / video.videoHeight
		

localUser.dxDeltaToCopyFromCameraToCanvas += (dxDeltaToCopyFromCameraToCanvasFinal - localUser.dxDeltaToCopyFromCameraToCanvas) / delay
localUser.dyDeltaToCopyFromCameraToCanvas += (dyDeltaToCopyFromCameraToCanvasFinal - localUser.dyDeltaToCopyFromCameraToCanvas) / delay
localUser.dxToCopyFromCameraToCanvas += (dxToCopyFromCameraToCanvasFinal - localUser.dxToCopyFromCameraToCanvas) / delay
localUser.dyToCopyFromCameraToCanvas += (dyToCopyFromCameraToCanvasFinal - localUser.dyToCopyFromCameraToCanvas) / delay

let help = (video.videoWidth - localUser.dxToCopyFromCameraToCanvas) / 2 
let xSlider =  (localUser.xDeltaToCopyFromCameraToCanvas / zoom - localUser.dxToCopyFromCameraToCanvas / 2) * localUser.dxToCopyFromCameraToCanvas / 100 

let ySlider = (localUser.dyToCopyFromCameraToCanvas / 2 - localUser.dyDeltaToCopyFromCameraToCanvas / zoom ) * localUser.dyToCopyFromCameraToCanvas / 100 

if(!isIn3D)
{
$("#dxMyCameraRangeMinus100plus100").val(xSlider)
$("#dyMyCameraRangeMinus100plus100").val(ySlider)
$("#zoomCameraRange1to10").val(zoom)
}

}
//----------------------------------------
repositionDxDyAndDeltasAndZoom()
{

let zoom = activeLocalUser.videoStream
	? Math.min( activeLocalUser.videoStream.video.videoWidth / activeLocalUser.dxToCopyFromCameraToCanvas
		, activeLocalUser.videoStream.video.videoHeight / activeLocalUser.dxToCopyFromCameraToCanvas)
	: 1
	
$("#zoomCameraRange1to10").val(zoom)

let xSlider =  (activeLocalUser.dxDeltaToCopyFromCameraToCanvas - activeLocalUser.dxToCopyFromCameraToCanvas / 2) / 2

let ySlider = -(activeLocalUser.dyDeltaToCopyFromCameraToCanvas - activeLocalUser.dyToCopyFromCameraToCanvas / 4)

	
$("#dxMyCameraRangeMinus100plus100").val(xSlider)
$("#dyMyCameraRangeMinus100plus100").val(ySlider)

$("#selectZoomModeForFaceWebRTChub").val(activeLocalUser.isInFaceDetectionModeWebRTChub ? "auto" : "manual")



} 
//----------------------------------------
recalculateDxDyAndDeltasAndZoom()
{
	
let video = activeLocalUser.videoStream.video

let zoom = parseFloat($("#zoomCameraRange1to10").val())
	
let dx = parseFloat($("#dxMyCameraRangeMinus100plus100").val())
let dy = parseFloat($("#dyMyCameraRangeMinus100plus100").val())
	
activeLocalUser.dxToCopyFromCameraToCanvas = Math.min(video.videoWidth, video.videoHeight) / zoom
activeLocalUser.dyToCopyFromCameraToCanvas = Math.min(video.videoHeight, video.videoWidth) / zoom

/*
dxDeltaToCopyFromCameraToCanvas = Math.abs(video.videoWidth - video.videoHeight) / 2
dxDeltaToCopyFromCameraToCanvas = dxDeltaToCopyFromCameraToCanvas + dxDeltaToCopyFromCameraToCanvas * dx /100

dyDeltaToCopyFromCameraToCanvas = Math.abs(video.videoHeight - video.videoWidth) / 2
dyDeltaToCopyFromCameraToCanvas = dyDeltaToCopyFromCameraToCanvas + dyDeltaToCopyFromCameraToCanvas * dy /100
									+ dxdyToSendToPeers * (zoomTimes - 1)
*/

let help = (video.videoWidth - activeLocalUser.dxToCopyFromCameraToCanvas) / 2 
activeLocalUser.dxDeltaToCopyFromCameraToCanvas = help + (dx / 100) * help

help = (video.videoHeight  - activeLocalUser.dyToCopyFromCameraToCanvas) / 2
activeLocalUser.dyDeltaToCopyFromCameraToCanvas = help - (dy / 100) * help

}
//----------------------------------------
selectSquareWhereToShowVideoOnScreenSharing(square)
{
	$(".squareWhereToShowVideoOnScreenSharing").css("backgroundColor", "#ffa")
	if(showMyVideoInScreenSharing3x3pos == square || square === undefined)
		showMyVideoInScreenSharing3x3pos = undefined;
	else 
		{
		$("#squareWhereToShowVideoOnScreenSharing_" + square).css("backgroundColor", "#f00")
		showMyVideoInScreenSharing3x3pos = square
   	}	
}
//----------------------------------------
toggleCornersVisibility(corners)
{

if (corners)
{
  if(activeLocalUser.circledGlobalVideoForPeers != 0)
	 activeLocalUser.circledGlobalVideoForPeers = 0
  else
   for(let e in corners)
    {
	let c = corners[e]
	activeLocalUser.showNotHideCornersOfVideoToSend[c] = !activeLocalUser.showNotHideCornersOfVideoToSend[c]
	activeLocalUser.showHideCornerWasManual[c] = true //no more automatic show/hide when showin/hiding icons
    }
}
	
	
for(let c = 1; c <= 8; c++)
  {
	let color = "#fff"
	if(activeLocalUser.circledGlobalVideoForPeers != 0) 
		{
		color = activeLocalUser.circledAndTrianglesColors[0]	
		$("#buttonsPeersTrianglesCircleColors").css("backgroundColor",color)
		}
	else if(c <= 4 && activeLocalUser.showNotHideCornersOfVideoToSend[c])
		{
		color = activeLocalUser.circledAndTrianglesColors[c]  
		$("#buttonsPeersTrianglesCircleColors").css("backgroundColor",color)
		}
	else
		color = "#aaa"
			
	$("#cellCornerNumberPeers_" + c).css("backgroundColor",  color)
  }

this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "circledAndTrianglesColors", activeLocalUser.circledAndTrianglesColors, undefined)
this.putValueAndSendToPeersAllSiblingsEqual(activeLocalUser, "showNotHideCornersOfVideoToSend", activeLocalUser.showNotHideCornersOfVideoToSend, undefined)


}
//----------------------------------------
tdCorner (cornersStr, cornerNumber, localUser)
{
return "<td class='wm noselect' "+(cornerNumber ? "id='cellCornerNumberPeers_"+cornerNumber+"'" : "")+" onclick='myWebRTChub.toggleCornersVisibility("+cornersStr+")' style='cursor:pointer;width:21px; height:21px;line-height:0px;background-color:"
   + (localUser.circledGlobalVideoForPeers != 0 && cornerNumber !== undefined ? localUser.circledAndTrianglesColors[0]  : cornerNumber > 4 || !localUser.showNotHideCornersOfVideoToSend[cornerNumber]  ? "#aaa" : localUser.circledAndTrianglesColors[cornerNumber]) +"'>&nbsp;</td>"
}
//---------------------------------------------------
moveMyCanvasToSendBetweenMainNotBottomBar(mainNotBottomBar, bottomBarBigger, force)
{
  if(!force && myCanvasToSendIsInMainScreen === mainNotBottomBar)
	return

  myCanvasToSendIsInMainScreen = mainNotBottomBar

  for(let [uuid, localUser] of localUsersUUIDtoObject)
  {
	if(mainNotBottomBar)
		{
		this.closeGlobalSidePanel()
		if(currentWidthHeightPeersGlobalVideoSendDIV > 72)
			myWebRTChub.resizeBottomBarViewingCanvas()
		let arr = $("#peersGlobalVideoSendDIV_main_"+localUser.uuid)
		arr.append($(localUser.canvasToSendToPeers).css("width", peersMainVideoWidth).css("height", peersMainVideoHeight))
		arr.append($("#peersGlobalVideoINSTRUCTIONS_"+localUser.uuid))
		}
    else
		{
		this.showGlobalSidePanel(false, true)
		let arr = $("#peersGlobalVideoSendDIV")
	    arr.append($(localUser.canvasToSendToPeers).css("width", peersSmallVideoWidth).css("height", peersSmallVideoHeight))
		arr.append($("#peersGlobalVideoINSTRUCTIONS_"+localUser.uuid))
		
		if(bottomBarBigger && currentWidthHeightPeersGlobalVideoSendDIV == 72)
			myWebRTChub.resizeBottomBarViewingCanvas() //toggles

		}
	
	showHideSelector(".talkisi_instant", mainNotBottomBar, undefined, undefined, "inline-table")
	
	if(mainNotBottomBar)
		$(".mySelfInMainScreen").css("display", "inline-table")
	else
		$(".mySelfInMainScreen").hide()
		
	}
	myWebRTChub.resizeElementsWithPeersParticipant(undefined)
	
	myWebRTChub.removePeersGlobalVideoINSTRUCTIONS()
}
//---------------------------------------------------
showParticipantsStatistics()
{
	
let s = "<br><table border='1'><tr><th>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[42]) + "</th></tr>"
	
for(let [key, o] of simplePeersObjects)
  s += "<tr><td class='username_"+o.meetingWithUUID+"'>" + o.username + "</td></tr>"
	
s += "</table>"	
returnThisDIV(undefined, "webtrc_participants_statistics", "Video conference", "NOGO.LINK", s, "myWebRTChub.showParticipantsStatistics()"); 

}
//---------------------------------------------------
atLeastOneCornerShown()
{
	for(let i = 1; i <= 4; i++)
		if(activeLocalUser.showNotHideCornersOfVideoToSend[i])
			return true

	return false;
}
//---------------------------------------------------
changeToShape(shape, ifCircleIgnore, localUser)
{
  if(ifCircleIgnore && activeLocalUser.circledGlobalVideoForPeers != 0 && myWebRTChub.atLeastOneCornerShown())
	  return false
	
  let changed = false
  
  if(!myWebRTChub.atLeastOneCornerShown())	  
	  {
	  myWebRTChub.toggleCornersVisibility([1, 2, 3, 4])
	  changed = true
	  }
	  
  if(activeLocalUser.circledGlobalVideoForPeers != 0 || activeLocalUser.shapeAroundOctogonalOrHexagonal != shape) 
	{
	activeLocalUser.circledGlobalVideoForPeers = 0; 
	activeLocalUser.shapeAroundOctogonalOrHexagonal = shape
	changed = true
	}
  
  return changed
}
//---------------------------------------------------
changedZoomModeForFaceWebRTChub(value, screenSharing)
{
	let localUser = activeLocalUser
	
	if(value === localUser.zoomModeForFaceWebRTChub)
		return false
	localUser.zoomModeForFaceWebRTChub = value
	switch(localUser.zoomModeForFaceWebRTChub)
	{
	case "manual" : 
				localUser.isInFaceDetectionModeWebRTChub = false
				nextRectOfHeadForAvatarWebRTChub = []
				lastDetectionAll = undefined
				this.updateAllUsersDxDyXYwithVideoRects()
			    break;
	case "auto":;
	case "draw":
		        if(videoStreamToCopyToCanvas) 
		        {
				localUser.isInFaceDetectionModeWebRTChub = true 
				localUser.isInFaceDetectionModeWebRTChubScreenSharing = screenSharing
				startFaceTrackingWebRTChub(false, localUser)
		        }
				break;
	}
	
	$("#selectZoomModeForFaceWebRTChub").val(value)
	
	
	return true
}
//---------------------------------------------------
renameLocalUser(localUserORuuid, input)
{
	let newName = input.value
	let localUser = isString(localUserORuuid) ?  localUsersUUIDtoObject.get(localUserORuuid) : localUserORuuid	
	let meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)
	
	
	localUser.usernameOrig = localUser.usernameOrig || localUser.username
	if(localUser.isFirstLocalUser 
		&& !newName.startsWith(localUser.usernameOrig)
		&& !meetObj.emailsHosts.get(nomeUtilizador) //host can change
		)
		{
			showMessageOnSOSforDuration("<b style='color:#f00'>MUST START WITH: "+ localUser.usernameOrig +"</b>", 3000)
			input.value = localUser.username
		}
	else
	{	
	localUser.username = newName
	$(".username_"+localUser.uuid).html(newName)
	this.refreshManageLocalUsersToSend()
	this.sendCommandToPeers(undefined, "USERNAME" , localUser.uuid + " " +localUser.username)
	}
}
//---------------------------------------------------
optionOfLocalUser(localUserORuuid, letterNumberOrOther, force)
{
	let localUser = isString(localUserORuuid) ?  localUsersUUIDtoObject.get(localUserORuuid) : localUserORuuid	

	if(letterNumberOrOther == "remove")
	  {
		if(!localUser.siblingsActive)
		    return this.removeLocalUser(localUser, force)
		  
		for(let lu of localUser.siblingLocalUsers)
				this.removeLocalUser(lu, force)
	  }
 return false
}
//---------------------------------------------------
setCameraRectForLocalUser(localUserORuuid, letterNumberOrOther)
{
   this.addActiveUserToVideoStreamCameraRect(localUserORuuid, letterNumberOrOther.charAt(0), parseInt(letterNumberOrOther.slice(1)))
}
//---------------------------------------------------
selectHTMLfromVideoStreamsRects(classOrID = "", changeAction = "", defaultValue = "", extraOptionsStart = "", extraOptionsEnd = "")
{
	let sel = "<select "+classOrID+" onChange='"+changeAction+"' onClick='event.stopPropagation()'>" 
	  + extraOptionsStart
	for (let [letter, videoStream] of videoStreamToCopyToCanvas)	
	  for (let [number, videoRect] of videoStream.cameraRects)	
		sel += "<option "+(defaultValue == letter + number ? "selected" : "")+">" + letter + number + "</option>"
	sel += extraOptionsEnd + "</select>" 
	return sel
}				
//---------------------------------------------------
refreshManageLocalUsersToSend()
{
if(this.closeManageLocalUsersToSend())
  this.manageLocalUsersToSend()

//and also showMeetingLinksAndPeers
this.refreshShowMeetingLinksAndPeers()
}
//---------------------------------------------------
closeManageLocalUsersToSend()
{
manageLocalUsersIsShown = false
return 	clearTopBarToDiv("localUsersToSend") || dismissPopup1("localUsersToSend")
}
//---------------------------------------------------
toggleLocalUsersSiblings(localUserUUID)
{
	localUser = localUsersUUIDtoObject.get(localUserUUID)
	localUser.siblingsActive = !localUser.siblingsActive
	
	if(localUser.siblingLocalUsers)
	  for(let lu of localUser.siblingLocalUsers)
        if(lu != localUser)
			lu.siblingsActive = localUser.siblingsActive

	//they keep the own values until one of them changes this.makeAllSiblingsEqual(localUser)

	this.refreshManageLocalUsersToSend()	
}
//---------------------------------------------------
makeAllSiblingsEqual(localUser) //not used yet
{
if(localUser.siblingsActive)
  for(let lu of localUser.siblingLocalUsers)
	{
		lu.rotatedGlobalVideoForPeers = localUser.rotatedGlobalVideoForPeers
		lu.circledGlobalVideoForPeers = localUser.circledGlobalVideoForPeers
	}
}
//---------------------------------------------------
putValueAndSendToPeersAllSiblingsEqual(localUser, parameterName, value, commandToSend)
{
if(localUser.siblingsActive)
  for(let lu of localUser.siblingLocalUsers)
  if(lu != localUser)
	{
		if(value.tagName !== "IMG" //do not clone images
			&& isObject(value)) //valid for {} and []
			value = clone(value)
		lu[parameterName] = value
		if(commandToSend)
			myWebRTChub.sendCommandToPeers(localUser.uuid, commandToSend, value, localUser.meetingUUID) //now just for info
	}
}
//---------------------------------------------------
hasSiblingActiveOnThisMeeting(localUser, meetUUID)
{
	if(localUser.siblingsActive)
	  for(let lu of localUser.siblingLocalUsers)
        if(lu.meetingUUID == meetUUID)
			return true
	return false
}
//---------------------------------------------------
manageLocalUsersToSend(doNotClose)
{
   if(this.closeManageLocalUsersToSend() && !doNotClose)
	return
	
	let element 
	if(toggleManageLocalUsersToSendTOP)
	{
		addTopBarToDiv(null, "<div id='localUsersToSend_topBar'></div>", "localUsersToSend")
		element = $("#localUsersToSend_topBar")[0]
	}
	else
		element = getPopup1("localUsersToSend", webrtc_div_name)

	element.style.color = "#000"
	element.style.width = ""
	element.style.maxWidth = "100%"
	element.style.maxHeight = "100%"
	element.style.overflow = "auto"
	element.style.height = ""
	element.style.left = 0
	element.style.right = ""
	element.style.top = 0
	element.style.transform = ""
	element.style.display = "block"
	element.style.backgroundColor = "#fff"
	
	let s = "<div id='firstSecionManageUsers' style='display:inline-table;padding-bottom:5px'><table style='width:100%'><tr><td onClick='toggleManageLocalUsersToSendTOP=!toggleManageLocalUsersToSendTOP; myWebRTChub.manageLocalUsersToSend(true)' style='text-align:left;width:1px;cursor:pointer'><img src='"+cdniverse+"images/open_in_full-black-18dp.svg' style='height:1.5em'></td>"
		+ "<td><b>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[40])+"</b></td>" 
		+ "<td style='text-align:right;width:1px'><b onClick='myWebRTChub.closeManageLocalUsersToSend()' style='cursor:pointer; color:#800'>&nbspX&nbsp</b></td></tr></table>"
		+ "<br><br><table  class='wm' border='1' >"
		   

		   let skipTheseLocalUsers = new Set()
		   for(let [uuid,localUser] of localUsersUUIDtoObject)
			 if(!skipTheseLocalUsers.has(localUser))
			   {
		  		   let nString = localUser.n
		           let extra = ""
				   if(localUser.siblingLocalUsers && localUser.siblingLocalUsers.size > 1)
					{
						extra = "<br>"
						for(let lu of localUser.siblingLocalUsers)
						   {
							extra += "M" + meetingsUUIDtoObject.get(lu.meetingUUID).number 
							  	  + (lu.username == localUser.username ? "" : ":" + lu.username) + " "
							if(localUser.siblingsActive && lu != localUser)
								{
								skipTheseLocalUsers.add(lu)
							  	nString += "+" + lu.n
							    }
						   }
					}
				   s += "<tr class='wm'>"
					 + "<td class='wm'>"+ nString +"</td>"
					 + "<td class='wm'><a class='username_\"" + localUser.uuid + "\"' onClick='myWebRTChub.renameLocalUser(\"" + localUser.uuid + "\")'>"+ localUser.username + "</a>"
					 + "<i style='font-size:70%'><a onClick='myWebRTChub.toggleLocalUsersSiblings(\""+localUser.uuid+"\")'>" + extra + "</a></i>"
					 + "</td>"
					 + "<td class='wm'>"+ this.selectHTMLfromVideoStreamsRects("class='selectForLocalUser_"+localUser.uuid+"'", "myWebRTChub.setCameraRectForLocalUser(\"" + localUser.uuid + "\", this.value)", localUser.videoStream.letter + localUser.videoStreamRectNumber, "") + "</td>"
					 + "<td class='wm'><input class='wm' type='checkbox' onCLick='event.stopPropagation();localUsersUUIDtoObject.get(\"" + uuid + "\").checkedInManageUsers=this.checked' "+(localUser.checkedInManageUsers ? "checked" : "")+"></td>"
			   	if(numMeetingsGlobal > 1)
				  for(let [meetUUID, meetObj] of meetingsUUIDtoObject)
				   if(!meetObj.notYetUsable)
				   {
					let bgColor = meetUUID == meetingIDselectedWebRTChub ? "background-color:#dfd" : ""
					if(true || localUser.isFirstLocalUser) //for the time being is the only option
					  s += "<td onCLick='myWebRTChub.selectMeetObjSelectedWebRTChub(\""+meetUUID+"\");' style='"+bgColor+";color:"+ (localUser.meetingUUID == meetUUID || this.hasSiblingActiveOnThisMeeting(localUser, meetUUID) ? "#080" : "#800")  +"'><b>" + "M" + meetObj.number + "</b></td>"
					else if(meetUUID === localUser.meetingUUID || this.hasSiblingActiveOnThisMeeting(localUser, meetUUID)) 
					  s += "<td style='"+bgColor+"'><input type='checkbox' "+(localUser.disabled ? "" : "checked")+"></td>"
					else
					  s += "<td style='"+bgColor+"'>M"+meetObj.number+"</td>"
				  }
				s += "</tr>"	   
			   }
		   s += "<tr onClick='event.stopPropagation()'>"
			  + "<td colspan='2'><input id='buttonAddNewLocalUserWebRTChub' type='text' onKeyUp='if(event.keyCode == 13) myWebRTChub.createNewLocalUser(this.value)' style='width:8em'></td>"
		      + "<td colspan='2'>"+this.selectHTMLfromVideoStreamsRects("id='selectForLocalUser_addUser'", undefined, undefined, "<option value=''>new</option>")
			  + " &nbsp; <button onClick='myWebRTChub.createNewLocalUser($(\"#buttonAddNewLocalUserWebRTChub\").val())'>+</button>"
			  + "</td>"
			   	if(numMeetingsGlobal > 1)
				  for(let [meetUUID, meetObj] of meetingsUUIDtoObject)
					if(!meetObj.notYetUsable)
					  {
						let bgColor = meetUUID == meetingIDselectedWebRTChub ? "background-color:#dfd" : ""
						s += "<td style='"+bgColor+"'><input id='newLocalUserCheckBoxMeeting_"+meetUUID+"'onClick='meetingsUUIDtoObject.get(\""+meetUUID+"\").addNewUserChecked=this.checked' type='checkbox' "+(meetObj.addNewUserChecked ? "checked" : "")+"></td>"
					  }
			  s += "</tr>"
		   
		   s += "</table>"

		   s += "<br><label><input type='checkbox' onClick='event.stopPropagation(); augmentAutomaticallyNextHeadsDetection=this.checked' "+(augmentAutomaticallyNextHeadsDetection ? "checked" : "")+">" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[50]) + "</label>"

		   s += " &nbsp; <select id='selectAddCameraID' onChange='let s = this.value; if(s)myWebRTChub.addGlobalAudioVideoStream(undefined, true, s)' style='max-width:7em'></select>"

		   s += "</nobr><br></div></div></div>"
		 

   $(element).html(s).show()

   let selRects = "<select id='showActiveCameraRectInManageUsersSELECT' onChange='lastVideoStreamLETTERandNUMBER=this.value;myWebRTChub.manageLocalUsersToSend(true)' style='max-width:3em'>"
   let selRectInputs = ""
   for (let [letter, videoStream] of videoStreamToCopyToCanvas)	
   if(videoStream.screenMode == "NORMAL")
   {
	for (let [number, videoRect] of videoStream.cameraRects)	
	  {
		selRects += "<option "+(lastVideoStreamLETTERandNUMBER == letter + number ? "selected" : "" )+" value='" + letter + number + "'>" + letter + number + " x:"+videoRect.x+" y:"+videoRect.y + " wh:"+videoRect.width+" dy="+videoRect.height+"</option>"
	    if(lastVideoStreamLETTERandNUMBER == letter + number)
          selRectInputs = "X<input type='number' value='"+videoRect.x+"' style='width:4em'>"
	 	 				+ " Y<input type='number' value='"+videoRect.y+"' style='width:4em'>"
	 	 				+ " WH<input type='number' value='"+videoRect.width+"' style='width:4em'>"
	 }


	let dx = videoStream.screenModeDx || videoStream.video.videoWidth
	let dy = videoStream.screenModeDy || videoStream.video.videoHeight


	s = ""
    if(!toggleManageLocalUsersToSendTOP)
		s += "<br>"
	s += "<div style='display:inline-table;margin:2px'>"
			+ "<a onClick='myWebRTChub.addOneCameraRectToVideoStream(\""+ letter+"\")'><b style='background-color:#fdd;color:#f00'>+</b></a>"							

			+ " &nbsp; <b>" + letter + "</b>"
			+ " &nbsp; <select onChange='let videoStream=videoStreamToCopyToCanvas.get(\""+letter+"\");videoStream.fitType=this.value;myWebRTChub.fitManyCameraRects(videoStream)'>"
			+ "<option value='C' "+(videoStream.fitType == "C" ? "selected" : "")+">Center</option>"
			+ "<option value='H' "+(videoStream.fitType == "H" ? "selected" : "")+">Horiz.</option>"
			+ "<option value='HH' "+(videoStream.fitType == "HV" ? "selected" : "")+">H H</option>"
			+ "<option value='HHH' "+(videoStream.fitType == "HHH" ? "selected" : "")+">H H H</option>"
			+ "<option value='HHHH' "+(videoStream.fitType == "HHHH" ? "selected" : "")+">H H H H</option>"
			+ "<option value='V' "+(videoStream.fitType == "V" ? "selected" : "")+">Verti.</option>"
			+ "<option value='VV' "+(videoStream.fitType == "VV" ? "selected" : "")+">V V</option>"
			+ "<option value='VVV' "+(videoStream.fitType == "VVV" ? "selected" : "")+">V V V</option>"
			+ "<option value='VVVV' "+(videoStream.fitType == "VVVV" ? "selected" : "")+">V V V V</option>"
			+ "<option value='A' "+(videoStream.fitType == "A" ? "selected" : "")+">Auto</option>"
			+ "</select>"		

			+ "<select class='parametersForScreenSharingPeers' id='resolutionsFetDisplayMediaPeers'>"
			+ "<option value=''>" + dx +"x"+ dy + "</option>"
			+ "<option value='default'>default</option><option value='fit-screen'>Fit Screen</option><option>4K</option><option>1080p</option><option>720p</option>"
			+ "</select>"
	  	    + "&nbsp; <b onClick='myWebRTChub.removeVideoStream(\""+letter+"\")' style='cursor:pointer; color:#800'> &nbsp X &nbsp </b>"		
					
		let width = 16	
		let height = width * dy / dx
	    s += "<br><div id='divForVideoCamera"+letter+"' style='display:grid;position:relative;border:1px solid #000;max-width:"+width+"em;max-height:"+height+"em'>"
		+ "<canvas id='canvasForVideoCamera"+letter+"' onClick='event.stopPropagation();myWebRTChub.clickedOnCameraWithRects(event, \""+letter+"\")' style='position:absolute;top:0;left:0;width:100%;height:100%'></canvas>"
		+ "</div>"
	element.insertAdjacentHTML("beforeend", s)
	$(videoStream.video)
	   .css("position", "")
	   .css("transform", "")
	   .css("width", width + "em")
	   .css("maxWidth", width + "em")
	   .css("height", height + "em")
	   .css("maxHeight", height + "em")
	videoStream.cameraCanvas = $("#canvasForVideoCamera" + letter)[0]
	
	$("#divForVideoCamera"+letter)[0].insertAdjacentElement("afterbegin", videoStream.video)
	$(videoStream.video).addClass("REMOVE_TO_BODY_POSITION_FIXED_TRANSFORM_MICRO")
   }

selRects += "</select>"

s = "<table><tr><td>"+selRects+"</td><td>"+selRectInputs+"</td><td><b onClick='myWebRTChub.removeCameraRect(\""+lastVideoStreamLETTERandNUMBER+"\")' style='cursor:pointer; color:#800'> &nbsp X &nbsp </b></td></tr></table>"

$("#firstSecionManageUsers")[0].insertAdjacentHTML("beforeend", s)

myWebRTChubEnumerateDevices()
let select = $("#selectAddCameraID")[0]
gotDevicesForPeers(false, false, false, select, true)
select.insertAdjacentHTML("afterbegin", "<option value=''> + camera</option>")

  let op = ""
  for(let [key, o] of simplePeersObjects)
  	op += "<option class='username_"+o.meetingWithUUID+"' value='PEER "+ key +"'>" + o.username + "</option>"
  if(op)  
	select.insertAdjacentHTML("beforeend", "<option value=''> +++ peer videos +++</option>" + op)

select.selectedIndex = 0
	
manageLocalUsersIsShown = true
}
//-------------------------------------------------
removeVideoStream(videoStreamOrLetter, exitingFromMeeting, noMessageToUser)
{
if(!videoStreamOrLetter)
  return 

let videoStream = isString(videoStreamOrLetter) ?  videoStreamToCopyToCanvas.get(videoStreamOrLetter) : videoStreamOrLetter	
if(videoStream)
{
	let oneFailed = false
	let oneSuceeded = false
	if(!exitingFromMeeting)
	  for (let number = videoStream.cameraRects.size; number > 0; number--)	
	    if(this.removeCameraRect(videoStream.letter + number, false))
	      oneSuceeded = true
	    else
	      oneFailed = true
	
    if(!oneFailed)
	{
	this.closeStreamOfsrcObject(videoStream.video)
	videoStreamToCopyToCanvas.delete(videoStream.letter)
	if(!exitingFromMeeting)
		this.refreshManageLocalUsersToSend()
	}
	else if(!oneSuceeded && !noMessageToUser)
	  	 showMessageOnSOSforDuration("<b>not empty</b>", 2000)
	
}

}
//-------------------------------------------------
removeCameraRect(letterNumber, messageIfFailed)
{
let letter = letterNumber.charAt(0)
let number = parseInt(letterNumber.slice(1))
let usernames = ""

//see if possible (no users using it)
for(let [uuid, localUser] of localUsersUUIDtoObject)
  if(localUser.videoStream.letter + localUser.videoStreamRectNumber == letterNumber)
	usernames += localUser.username + "<br>"
	
if(usernames.length > 0)
	{
		if(messageIfFailed)
		   showMessageOnSOSforDuration("<b style='color:#f00'>USERS THAT USE IT:</b><br><b>" + usernames + "</b>", 3000)
    	return false
	}
//adjust users videoStreamRectNumber
for(let [uuid, localUser] of localUsersUUIDtoObject)
  if(localUser.videoStream.letter == letter && localUser.videoStreamRectNumber > number)
	    localUser.videoStreamRectNumber--
	
let videoStream = videoStreamToCopyToCanvas.get(letter)

//adjust cameraRects and remove map entry
let numberToRemove = number
for (let [numberOther, videoRect] of videoStream.cameraRects)	
   if(numberOther > number)	
     {
	 videoStream.cameraRects.set(numberOther-1, videoRect)
	 videoRect.number = numberOther-1
	 numberToRemove = numberOther
	 }	

videoStream.cameraRects.delete(numberToRemove)

if(lastVideoStreamLETTERandNUMBER == letterNumber)
  {
	if(numberToRemove > number)
	  lastVideoStreamLETTERandNUMBER = letter + number
    else if(number > 1)
	  lastVideoStreamLETTERandNUMBER = letter + (number-1)
	else
      lastVideoStreamLETTERandNUMBER = "A1" //not perfect
  }

this.fitManyCameraRects(videoStream)

this.refreshManageLocalUsersToSend()	
	
return true
}
//-------------------------------------------------
clickedOnDivEmcopassingAll(meetingUUID, event, element)
{

if(event && event.srcElement.id !== "divEmcopassingAll_" + meetingUUID)
  return
let meetObj = meetingsUUIDtoObject.get(meetingIDselectedWebRTChub)
let div = $("#divEmcopassingAll_" + meetingUUID)
let divWithDivName = screenDIVparentOfElement(div[0])
let divName = divWithDivName.getAttribute("name")
if(divName !== currentDIVid())
	return actionWhenClickPassiveSpaceInDiv(divWithDivName)

let bkSize = div.css("background-size")	

switch(bkSize)
{
   case "100% 100%":
   case "cover": bkSize = "contain"; break
   case "contain": bkSize = "40%"; break
   case "40%": bkSize = "20%"; break
   case "20%": bkSize = "0px 0px"
   	if(meetObj.numDivsInSidePanel > 0)
     myWebRTChub.showGlobalSidePanel(true)
	break
   default: bkSize = "cover"
}
div.css("background-blend-mode", bkSize == "0 0" ? "color" : "")	
div.css("background-size", isSafari && bkSize == "cover"? "100% 100%" :  bkSize)	
}
//-------------------------------------------------
clickedOnForUseByWebRTChub(event)
{

if(event.srcElement.tagName != "TD")
  return
if(isIn3D)
  {
  	let nextMeeting
	let firstPlace
    for(let [meetingUUID, meetObj] of meetingsUUIDtoObject)
      {
	  let IDSplace = meetObj.numPlace3D + ":151:U"
  	  let place = places.get(IDSplace)
  	  if(!firstPlace)
  	    firstPlace = place
	  if(nextMeeting)
	    {
	    setCameraOnObject(undefined, place, milisecondsMoveCamera)  
		return  
	    }
	  else if(place === cameraOnObject)
	    nextMeeting = true
	  }
	let IDSplace = NUMPLACE_MEETINGS_AND_OTHER_COMMONS_INI + ":151:U"
	let place = places.get(IDSplace)
	if(place != cameraOnObject)
	  setCameraOnObject(undefined, place, milisecondsMoveCamera)  
	else
	  setCameraOnObject(undefined, firstPlace, milisecondsMoveCamera)  
  }
else
  {
  userChangedWhenNoSpaceBottomBar = true //no more automatic on resize
  this.showNotHideWhenNoSpaceBottomBar(!showingWhenNoSpaceBottomBar)
  }
}
//-------------------------------------------------
clickedOnCameraWithRects(event, letter)
{
event.stopPropagation()
let videoStream = videoStreamToCopyToCanvas.get(letter) 
for (let number = videoStream.cameraRects.size; number > 0; number--)	
{
let videoRect = videoStream.cameraRects.get(number)

let x = videoRect.x * videoStream.cameraCanvas.clientWidth / videoStream.video.videoWidth
let y = videoRect.y * videoStream.cameraCanvas.clientHeight / videoStream.video.videoHeight

let width = videoRect.width * videoStream.cameraCanvas.clientWidth / videoStream.video.videoWidth
let height = videoRect.height * videoStream.cameraCanvas.clientHeight / videoStream.video.videoHeight

if(event.offsetX >= x && event.offsetX <= x + width
   && event.offsetY >= y && event.offsetY <= y + height)
  {
	let atLeastOne = false
    for(let [uuid, localUser] of localUsersUUIDtoObject)
      if(localUser.checkedInManageUsers && (localUser.videoStream.letter != letter || localUser.videoStreamRectNumber != number))
		{
		atLeastOne = true
		this.addActiveUserToVideoStreamCameraRect(localUser, letter, number)
		}
	//if(localUser.videoStream.letter == localUser.videoStream.letter
	  // && localUser.videoStreamRectNumber == number)

    if(!atLeastOne && lastVideoStreamLETTERandNUMBER != letter + number)
		{
		lastVideoStreamLETTERandNUMBER = letter + number
		this.refreshManageLocalUsersToSend()
		}

	break
  }
}	
}
//-------------------------------------------------
addOneCameraRectToVideoStream(videoStreamOrLetter)
{
	let videoStream = isString(videoStreamOrLetter) ?  videoStreamToCopyToCanvas.get(videoStreamOrLetter) : videoStreamOrLetter	
	let cameraRectNumber = videoStream.cameraRects.size + 1	
	let cameraRect = {}
	cameraRect.screenMode = videoStream.screenMode
	videoStream.cameraRects.set(cameraRectNumber, cameraRect)
	cameraRect.number = cameraRectNumber
	
	this.fitManyCameraRects(videoStream)
	
	this.refreshManageLocalUsersToSend()
}
//-------------------------------------------------
addActiveUserToVideoStreamCameraRect(localUserORuuid, videoStreamOrLetter, cameraRectNumber, doNotCallSiblings)
{
	
let localUser = isString(localUserORuuid) ?  localUsersUUIDtoObject.get(localUserORuuid) : localUserORuuid	
let videoStream = isString(videoStreamOrLetter) ?  videoStreamToCopyToCanvas.get(videoStreamOrLetter) : videoStreamOrLetter	
let cameraRect
	
if(cameraRectNumber)
  cameraRect = videoStream.cameraRects.get(cameraRectNumber)

if(!cameraRect)
   {
	let newLetterAndNumber = $("#selectForLocalUser_addUser").val()	
    cameraRectNumber = 1
	if(newLetterAndNumber)
	  {
		videoStream = videoStreamToCopyToCanvas.get(newLetterAndNumber.charAt(0))
		cameraRectNumber = parseInt(newLetterAndNumber.slice(1))
	  }
    else 
      for(let [uuid, localUser2] of localUsersUUIDtoObject)
		if(localUser2.meetingUUID == localUser.meetingUUID && localUser2.videoStream == videoStream)
		  cameraRectNumber = Math.max(cameraRectNumber, localUser2.videoStreamRectNumber + 1	)
				
  	cameraRect = {}
	cameraRect.screenMode = videoStream.screenMode
	videoStream.cameraRects.set(cameraRectNumber, cameraRect)
	cameraRect.number = cameraRectNumber
  }
	
localUser.screenMode = cameraRect.screenMode
localUser.videoStream = videoStream
localUser.videoStreamRectNumber = cameraRectNumber

localUser.isWaitingForVideoStreamToCopyToCanvasDIMENSIONS = true


if(!doNotCallSiblings && localUser.siblingsActive)
  for(let lu of localUser.siblingLocalUsers)
	if(lu != localUser)
       this.addActiveUserToVideoStreamCameraRect(lu, videoStream, cameraRectNumber, true)//true to avoid endless loop

$(".selectForLocalUser_"+localUser.uuid).val(videoStream.letter + cameraRectNumber)

}
//-------------------------------------------------
fitManyCameraRectsInAll()
{
for (let [letter, videoStream] of videoStreamToCopyToCanvas)	
	this.fitManyCameraRects(videoStream)
}
//-------------------------------------------------
fitManyCameraRects(videoStream)
{
let dx = videoStream.screenModeDx || videoStream.video.videoWidth
let dy = videoStream.screenModeDy || videoStream.video.videoHeight

if(!dx)
  return setTimeout(function(){myWebRTChub.fitManyCameraRects(videoStream)}, 50)

let numRects = videoStream.cameraRects.size
let area = videoStream.video.videoWidth * videoStream.video.videoHeight
let minWH = Math.min(videoStream.video.videoWidth, videoStream.video.videoHeight)

let fitType = videoStream.fitType
let numRows = 1
let numCols = 1


if(fitType == "HH")
  {
	numRows = numRects > 2 ? 2 : 1
	fitType = "H"
  }
else if(fitType == "VV")
  {
	numCols = numRects > 2 ? 2 : 1
	fitType = "V"
  }
else if(fitType == "HHH")
  {
	if(numRects <= 2)
	  numRows = 1
    else if(numRects <= 6)
	  numRows = 2
    else 
	  numRows = 3
	fitType = "H"
  }
else if(fitType == "HHHH")
  {
	if(numRects <= 2)
	  numRows = 1
    else if(numRects <= 6)
	  numRows = 2
    else if(numRects <= 9)
	  numRows = 3
    else 
	  numRows = 4
	fitType = "H"
  }
else if(fitType == "VVV")
  {
	if(numRects <= 2)
	  numCols = 1
    else if(numRects <= 6)
	  numCols = 2
    else 
	  numCols = 3
	fitType = "V"
  }
else if(fitType == "VVVV")
  {
	if(numRects <= 2)
	  numCols = 1
    else if(numRects <= 6)
	  numCols = 2
    else if(numRects <= 9)
	  numCols = 3
    else 
	  numCols = 4
	fitType = "V"
  }

let side = 640
if(fitType == "H")
while(true)
  {
	if(side * Math.ceil(numRects / numRows) <= dx && side * numRows <= dy)
	  break
    side -= 2
  }
else if(fitType == "V")
while(true)
  {
	if(side *  Math.ceil(numRects / numCols) <= dy && side * numCols <= dx)
	  break
    side -= 2
  }
else if(fitType == "H+H")
while(true)
  {
	if(side * side * numRects <= area)
	  break
    side -= 2
  }

let minNum = 0
let deltaIntervalFirst = 0
let numRectsRowFirst = -1
let numRectsColFirst = -1

let num = 0

if(fitType == "H")
for(let row = numRows - 1; row >= 0; row--)
{ 
  num = 0
  let numRectsThisRow = row == 0 ? Math.floor(numRects / numRows) : Math.ceil(numRects / numRows)
  let maxNum = minNum + numRectsThisRow

  let interval
  if(numRectsThisRow == 1) 
     interval = (dx - side) / 2
  else if (numRows > 1 && row % 2 == 0 && numRectsThisRow != numRectsRowFirst && numRectsRowFirst != -1) 
	 interval = (dx - side * numRectsThisRow - (numRectsThisRow - 1) * deltaIntervalFirst)  / 2
  else
     interval = 0

  for (let [number, videoRect] of videoStream.cameraRects)	
  {
	if(num >= minNum && num < maxNum)
	{
	videoRect.x = interval + side * (num - minNum)
	videoRect.y = (dy / numRows  - side) / 2 + row * dy / numRows
	videoRect.width = side
	videoRect.height = side

	if (numRows > 1 && row % 2 == 0 && numRectsThisRow != numRectsRowFirst && numRectsRowFirst != -1) 
		interval += deltaIntervalFirst
	else if(numRectsThisRow > 1)
		{
			let deltaInterval = (dx - numRectsThisRow * side) / (numRectsThisRow - 1)
			interval += deltaInterval
			if(deltaIntervalFirst == 0)
			  deltaIntervalFirst = deltaInterval
		}
	}
	num++
  }
  if(numRectsRowFirst == -1)
  	numRectsRowFirst = numRectsThisRow
  minNum = maxNum
   
}
else if(fitType == "V")
for(let col = numCols - 1; col >= 0; col--)
{ 
  num = 0
  let numRectsThisCol = col == 0 ? Math.floor(numRects / numCols) : Math.ceil(numRects / numCols)
  let maxNum = minNum + numRectsThisCol

  let interval
  if(numRectsThisCol == 1) 
     interval = (dy - side) / 2
  else if (numCols > 1 && col % 2 == 0 && numRectsThisCol != numRectsColFirst && numRectsColFirst != -1) 
	 interval = (dy - side * numRectsThisCol - (numRectsThisCol - 1) * deltaIntervalFirst)  / 2
  else
     interval = 0

  for (let [number, videoRect] of videoStream.cameraRects)	
  {
	if(num >= minNum && num < maxNum)
	{
	videoRect.x = (dx / numCols  - side) / 2 + col * dx / numCols
	videoRect.y = interval + side * (num - minNum)
	videoRect.width = side
	videoRect.height = side

	if (numCols > 1 && col % 2 == 0 && numRectsThisCol != numRectsColFirst && numRectsColFirst != -1) 
		interval += deltaIntervalFirst
	else if(numRectsThisCol > 1)
		{
			let deltaInterval = (dy - numRectsThisCol * side) / (numRectsThisCol - 1)
			interval += deltaInterval
			if(deltaIntervalFirst == 0)
			  deltaIntervalFirst = deltaInterval
		}
	}
	num++
  }
  if(numRectsColFirst == -1)
  	numRectsColFirst = numRectsThisCol
  minNum = maxNum
   
}
else if(fitType == "C")
  for (let [number, videoRect] of videoStream.cameraRects)	
  {
	videoRect.x = dx * num * 20 / 100 / 2
	videoRect.y = dy * num * 20 / 100 / 2
	videoRect.width = dx - 2 * videoRect.x
	videoRect.height = dy - 2 * videoRect.y
	num++
  }
	
this.updateAllUsersDxDyXYwithVideoRects(true)
}
//-------------------------------------------------
updateCameraRectNumberWithUserNewDxDyXY(localUser)
{
  let videoRect = localUser.videoStream.cameraRects.get(localUser.videoStreamRectNumber)
  if(videoRect.x === undefined)
  	this.fitManyCameraRects(localUser.videoStream)
  else 
    this.updateUserDxDyXYwithVideoRect(localUser, videoRect)
}
//-------------------------------------------------
updateAllUsersDxDyXYwithVideoRects(doNotCallFitManyRect)
{
	for(let [uuid, localUser] of localUsersUUIDtoObject)
		this.updateUserDxDyXYwithVideoRect(localUser, undefined, doNotCallFitManyRect)
		
	this.resizeElementsWithPeersParticipant(undefined)
}
//-------------------------------------------------
updateUserDxDyXYwithVideoRect(localUser, videoRect, doNotCallFitManyRect)
{	
  if(!localUser || !localUser.videoStream)
	 return setTimeout(function(){myWebRTChub.updateUserDxDyXYwithVideoRect(localUser, videoRect, doNotCallFitManyRect)}, 50)
  if(!videoRect)
    videoRect = localUser.videoStream.cameraRects.get(localUser.videoStreamRectNumber)
 
  localUser.screenMode = videoRect.screenMode
  localUser.dxDeltaToCopyFromCameraToCanvas = videoRect.x
  localUser.dyDeltaToCopyFromCameraToCanvas = videoRect.y
  localUser.dxToCopyFromCameraToCanvas = videoRect.width
  localUser.dyToCopyFromCameraToCanvas = videoRect.height
  if(localUser.canvasToSendToPeers)
    {
    localUser.canvasToSendToPeers.width = videoRect.width
    localUser.canvasToSendToPeers.height = videoRect.height
    }
  if(localUser.canvasToSendToPeers2)
    {
    localUser.canvasToSendToPeers2.width = videoRect.width
    localUser.canvasToSendToPeers2.height = videoRect.height
    }

if(!doNotCallFitManyRect)
	this.fitManyCameraRects(localUser.videoStream)

}
//-------------------------------------------------
updateCamerasCanvas()
{
if(!manageLocalUsersIsShown)
  return

/*
for(let [uuid, localUser] of localUsersUUIDtoObject)
{
let videoStream = videoStreamToCopyToCanvas.get(videoStream.letter)
let videoRect =  videoStream.cameraRects.get(videoStream.number)
}
*/		
		   
	  for (let [letter, videoStream] of videoStreamToCopyToCanvas)	
   		{
			if(!videoStream.cameraCanvas)
			  continue
			videoStream.cameraCanvasCTX = videoStream.cameraCanvas.getContext("2d",{alpha:true})
			videoStream.cameraCanvasCTX.setTransform(1, 0, 0, 1, 0, 0)
			videoStream.cameraCanvasCTX.scale(videoStream.cameraCanvas.width / videoStream.video.videoWidth
											 ,videoStream.cameraCanvas.height / videoStream.video.videoHeight)

			let ctx = videoStream.cameraCanvasCTX
			let canvas = videoStream.cameraCanvas
			ctx.clearRect(0, 0, videoStream.video.videoWidth, videoStream.video.videoHeight)
			//CTXtriangle(ctx, "#00f", "#ddd", 10, 10, 100, 50, 50, 50)
			for (let [number, videoRect] of videoStream.cameraRects)	
			{
			let rx = videoRect.x 
			let ry = videoRect.y 

			ctx.strokeStyle = lastVideoStreamLETTERandNUMBER == letter + number ? "#e6007e":"#f00"
			ctx.lineWidth = 4
			ctx.strokeRect(videoRect.x , videoRect.y, videoRect.width, videoRect.height)
			ctx.font = "60px Arial"
			ctx.fillStyle = ctx.strokeStyle
			ctx.textAlign = "center"
			let y = videoRect.y + 50
			ctx.fillText(letter + number, videoRect.x + videoRect.width / 2, y)
			ctx.font = "40px Arial"
			y += 20		    
			for(let [uuid, localUser] of localUsersUUIDtoObject)
			  if(localUser.videoStream.letter + localUser.videoStreamRectNumber == letter + number)
				{
				  y += 30	
				  ctx.fillText(localUser.username, videoRect.x + videoRect.width / 2, y)
			   	}
 
/*
			ctx.beginPath();
			ctx.lineWidth = "2";
			ctx.strokeStyle = "red"//kelly_colors_hex[b]
			ctx.rect(rx
					, ry
					, rx + videoRect.width
					, ry + videoRect.height
					);
			ctx.stroke();
			*/
			}
		}
}
//---------------------------------------------------
createNewLocalUser(username, doNotOpenManage, videoStream)
{
let localUser
  for(let [uuid, localUser] of localUsersUUIDtoObject)	
	if(localUser.defaultNameAddNewUser === username)
	  localUser.defaultNameAddNewUser += "+"
	
	
let joinToMeetingsID = new Set()

for(let [meetUUID, meetObj] of meetingsUUIDtoObject)
 if(!meetObj.notYetUsable)
  if(meetObj.addNewUserChecked)
	   joinToMeetingsID.add(meetUUID)
		
if(joinToMeetingsID.size == 0)
  joinToMeetingsID.add(meetingIDselectedWebRTChub)

username = username.trim()	
if(username.length < 3)
  {
	showMessageOnSOSforDuration(TLtranslate("name must have 3 or more characters"), 2000) //translation in previous page from server
	return false
  }	
else 
{
  let siblingLocalUsers = new Set()
  for(let meetingUUID of joinToMeetingsID)
  {
	let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	if(meetObj.numLocalUsersInMeeting >= maxLocalUsersGlobalPerMeeting)
	   return showMessageOnSOSforDuration("MAXIMUM USERS REACHED = " + maxLocalUsersGlobalPerMeeting + " &nbsp; MEETING = M" + meetObj.number, 2000) 

	localUser = this.addLocalUser(username, meetingUUID, videoStream)
	siblingLocalUsers.add(localUser)
	//cameraRectNumber = localUser.videoStreamRectNumber
  }
  if(siblingLocalUsers.size > 1)
  	for(let localUser of siblingLocalUsers)
 	  {
		localUser.siblingsActive = true
		localUser.siblingLocalUsers = siblingLocalUsers
	  }
}

if(!doNotOpenManage)
   this.refreshManageLocalUsersToSend()

return localUser
}
//---------------------------------------------------
refreshShowMeetingLinksAndPeers()
{
if(this.closeShowMeetingLinksAndPeers())
  this.showMeetingLinksAndPeers()
}
//---------------------------------------------------
closeShowMeetingLinksAndPeers()
{
return clearTopBarToDiv("showMeetingLinksAndPeers") || dismissPopup1("showMeetingLinksAndPeers")
}
//---------------------------------------------------
showMeetingLinksAndPeers(doNotClose)
{
if(this.closeShowMeetingLinksAndPeers() && !doNotClose)
	return
	
let element 

	if(toggleShowMeetingLinksAndPeersTOP)
	{
		addTopBarToDiv(null, "<div id='showMeetingLinksAndPeers_topBar'></div>", "showMeetingLinksAndPeers")
		element = $("#showMeetingLinksAndPeers_topBar")[0]
	}
	else
		element = getPopup1("showMeetingLinksAndPeers", webrtc_div_name)

	element.style.color = "#000"
	element.style.width = ""
	element.style.maxWidth = "100%"
	element.style.maxHeight = "100%"
	element.style.overflow = "auto"
	element.style.height = ""
	element.style.left = ""
	element.style.right = "0"
	element.style.top = 0
	element.style.transform = ""
	element.style.display = "block"
	element.style.backgroundColor = "#fff"


let s = "<div id='firstSecionManageUsers' style='display:inline-table;width:100%;padding-bottom:5px'><table style='width:100%'><tr><td onClick='toggleShowMeetingLinksAndPeersTOP=!toggleShowMeetingLinksAndPeersTOP; myWebRTChub.refreshShowMeetingLinksAndPeers()' style='text-align:left;width:1px;cursor:pointer'><img src='"+cdniverse+"images/open_in_full-black-18dp.svg' style='height:1.5em'></td>"
		+ "<td><b>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[52])+"</b></td>" 
		+ "<td style='text-align:right;width:1px'><b onClick='myWebRTChub.closeShowMeetingLinksAndPeers()' style='cursor:pointer; color:#800'>&nbspX&nbsp</b></td></tr></table>"
		+ "<br>"

for(let [meetingUUID, meetObj] of meetingsUUIDtoObject)
 if(!meetObj.notYetUsable)
   {
   s += "<br><table border='1' style='background-color:"+meetObj.bkColor+";color:"+meetObj.inkColor+"'>"



  for(let [uuid, localUser] of localUsersUUIDtoObject)
    if(localUser.meetingUUID == meetingUUID) 
      s += "<tr>"
      + "<td>options</td>"
	  + "<td style='width:1px'><nobr>" + this.buttonCameraOfLocalUser(localUser) 
	  +       " " +  this.buttonMicrophoneOfLocalUser(localUser) + "</nobr></td>"
      + "<td colspan='2'>" + localUser.username + "</td>"
	  + "</tr>"

   s += "<tr>"
      + "<td>options</td>"
	  + "<td style='width:1px'><nobr>" + this.buttonCameraOfMeeting(meetingUUID)
	  + " " + this.buttonMicrophoneOfMeeting(meetingUUID) + "</nobr></td>"
      +"<th>M"+ meetObj.number + "</th>"
	  + "<td style='width:1px'><nobr>" + this.buttonVideoOfMeetingPeers(meetingUUID)
	  +          this.buttonSpeakersOfMeetingPeers(meetingUUID) + "</nobr></td>"
	  + "</tr>"
		
		
   for(let [key, o] of simplePeersObjects)	
   {
	if(o.meetingUUID != meetingUUID || o.meetingWithUUID.indexOf("_") != -1)
		continue
	for(let [key2, o2] of simplePeersObjects)	
    {
	if(o2.meetingWithUUID == o.meetingWithUUID)
	{
	  s += "<tr><td  class='wm' colspan='2'>"

	  s += "<table class='wm' style='width:100%'>" 
	
	 let classObjectPeer = "TRspecificLocalUserAndObjectPeer_"+o2.meetingWithUUID


	 if(meetObj.numLocalUsersInMeeting > 1)
	  s +=  "<tr><td class='wm'><a onClick='showingOrHidingTRspecificLocalUserAndObjectPeer[\""+classObjectPeer+"\"]=toggleShowHideSelector(\"."+classObjectPeer+"\")'>"+ TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[53]) +"</a>"
        + "<td style='width:1px'><nobr>" + this.buttonCameraOfLocalUserToPeer(undefined, o2, meetingUUID)
	  	+ this.buttonMicrophoneOfLocalUserToPeer(undefined, o2, meetingUUID) + "</nobr></td></tr>"
	
	 let showing = showingOrHidingTRspecificLocalUserAndObjectPeer[classObjectPeer]
	 
	 for(let [uuid,localUser] of localUsersUUIDtoObject)
       if(localUser.meetingUUID == meetingUUID) 
		s +=  "<tr class='"+ classObjectPeer +"' " + (meetObj.numLocalUsersInMeeting > 1 && !showing?  "style='display:none'":"") +"><td class='wm'>"+ localUser.username 
		+"<td class='wm'>" + this.buttonCameraOfLocalUserToPeer(localUser.uuid, o2) 
	  	+ this.buttonMicrophoneOfLocalUserToPeer(localUser.uuid, o2) + "</td></tr>"
	s += "</table></td><td colspan='2'><table style='width:100%'>"
	}
	
	if(o2.meetingWithUUID.startsWith(o.meetingWithUUID))
	  s += "<tr>"
	  + "<td colspan='2'><select><option>" + o2.username + "</option></td>"
	  + "<td class='wm' style='width:1px'>" + this.buttonVideoOfPeer(o2.selector) + "</td>"
	  + "<td class='wm' style='width:1px'>" + this.buttonSpeakersOfPeer(o2.selector) + "</td>"
      + "</tr>"
	}//for key2
	  s += "</table></td></tr>"
    }//for key
	s += "</table><br>"
	
   }
s += "</div>"

if(!loggedIn())
		{
		let sp = ""
		sp += "<br class='hideWhenLogin'><br class='hideWhenLogin'><select class='hideWhenLogin' onChange='myWebRTChub.loginAsHost(this.value)' style='width:14em'><option value=''>"+TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[57])+"</option>"		
		sp += "<option value=''>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[58]) + "</option>"
		for(let [meetingUUID, meetObj2] of meetingsUUIDtoObject)
		 if(!meetObj2.notYetUsable)
		  if(meetObj2.emailsHosts)		   
		    for(let [email, value] of meetObj2.emailsHosts)
		      {
				let h = "<option>" + email + "</option>"
				if(sp.indexOf(h) == -1)
				  sp += h
			  } 
		sp += "</select>"			
		s += sp
		}

s += "<br><br><button onClick='myWebRTChub.showParticipantsStatistics()' ><nobr>"+TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[42])+": <b class='classForNumberofParticipantsWebRTC'>0</b></nobr></button>"

s += "<br><br>" + myWebRTChub.meetingLinksHTML(undefined, undefined, "&nbsp;", "<br>")

$(element).html(s)

$(element).show()
}
//------------------------------------------
buttonSpeakersOfMeeting(meetingUUID)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)
return "<button class='imageCell myWebRTCbuttonLoud_"+meetingUUID+"' onClick='event.stopPropagation();myWebRTChub.meetingsSpeakersMuteNotUnmute(\""+meetingUUID+"\",!compareColors($(this).css(\"backgroundColor\"), \"#fbb\"))' style='"+(meetObj.speakersActive ? "" : "display:none;")+"background-color:#bfb'><img src='"+ cdniverse +"images/baseline-volume_up-24px.svg' style='height:1.5em'></button>"
    + "<button class='imageCell myWebRTCbuttonSilent_"+meetingUUID+"' onClick='event.stopPropagation();myWebRTChub.meetingsSpeakersMuteNotUnmute(\""+meetingUUID+"\",!compareColors($(this).css(\"backgroundColor\"), \"#fbb\"))' style='"+(meetObj.speakersActive ? "display:none;" : "")+"background-color:#fbb'><img src='"+ cdniverse +"images/baseline-volume_off-24px.svg' style='height:1.5em'></button>"
}
//------------------------------------------
buttonCameraOfMeeting(meetingUUID)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)
let muted = !meetObj.cameraActive 
			|| !peersCameraActive
			|| meetObj.disabled 

return "<button class='imageCell myWebRTCbuttonCamera_"+meetingUUID+"' onClick='event.stopPropagation();myWebRTChub.meetingsCameraMuteNotUnmute(\""+meetingUUID+"\",!compareColors($(this).css(\"backgroundColor\"), \"#fbb\"))' style='background-color:"+(meetObj.cameraActive ? muted ? "#ff8":"#bfb" : "#fbb")+"'>"
    + "<img class='myWebRTCbuttonCameraOn_"+meetingUUID+"' src='"+ cdniverse +"images/videocam-black-18dp.svg' style='"+(muted ? "display:none;" : "")+"height:1.5em'>"
    + "<img class='myWebRTCbuttonCameraOff_"+meetingUUID+"' src='"+ cdniverse +"images/videocam_off-black-18dp.svg' style='"+(muted ? "" : "display:none;")+"height:1.5em'>"
    + "</button>"
}
//------------------------------------------
buttonMicrophoneOfMeeting(meetingUUID)
{    
let meetObj = meetingsUUIDtoObject.get(meetingUUID)
let muted = !meetObj.microphoneActive 
			|| meetObj.disabled 
            || !peersMicrophoneActive 
			|| globalIsMutedBecauseOfSeveralReasons > 0
return "<button class='imageCell  myWebRTCbuttonMicrophone_"+meetingUUID+"' onClick='event.stopPropagation();myWebRTChub.meetingsMicrophoneMuteNotUnmute(\""+meetingUUID+"\",!compareColors($(this).css(\"background-color\"),\"#fbb\"))' style='background-color:" + (meetObj.microphoneActive ? muted ? "#ff8" : "#bfb":"#fbb") + "'>"
  + "<img class='myWebRTCbuttonMicrophoneOn_"+meetingUUID+"' src='"+ cdniverse +"images/iconfinder_microphone_322463.svg' style='"+(muted ? "display:none;" : "")+"height:1.5em'>"
  + "<img class='myWebRTCbuttonMicrophoneOff_"+meetingUUID+"'  src='"+ cdniverse +"images/iconfinder_microphone-slash_1608549.svg' style='"+(muted ? "" : "display:none;")+"height:1.5em'>"
  + "</button>"
}
//------------------------------------------
buttonVideoOfMeetingPeers(meetingUUID)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)
return "<button class='imageCell myWebRTCpeerButtonVideoOn_"+meetingUUID+"' onClick='event.stopPropagation();myWebRTChub.meetingsVideoMuteNotUnmute(\""+meetingUUID+"\",true)' style='"+(meetObj.cameraActive ? "" : "display:none;")+"background-color:#bfb'><img src='"+ cdniverse +"images/image-black-18dp.svg' style='height:1.5em'></button>"
	+ "<button class='imageCell myWebRTCpeerButtonVideoOff_"+meetingUUID+"' onClick='event.stopPropagation();myWebRTChub.meetingsVideoMuteNotUnmute(\""+meetingUUID+"\",false)' style='"+(meetObj.cameraActive ? "display:none;" : "")+"background-color:#fbb'><img src='"+ cdniverse +"images/image_not_supported-black-18dp.svg' style='height:1.5em'></button>"
}
//------------------------------------------
buttonSpeakersOfMeetingPeers(meetingUUID)
{    
let meetObj = meetingsUUIDtoObject.get(meetingUUID)
return "<button class='imageCell myWebRTCbuttonLoud_"+meetingUUID+"' onClick='event.stopPropagation();myWebRTChub.meetingsSpeakersMuteNotUnmute(\""+meetingUUID+"\",true)' style='"+(meetObj.speakersActive ? "" : "display:none;")+"background-color:#bfb'><img src='"+ cdniverse +"images/baseline-volume_up-24px.svg' style='height:1.5em'></button>"
    + "<button class='imageCell myWebRTCbuttonSilent_"+meetingUUID+"' onClick='event.stopPropagation();myWebRTChub.meetingsSpeakersMuteNotUnmute(\""+meetingUUID+"\",false)' style='"+(meetObj.speakersActive ? "display:none;" : "")+"background-color:#fbb'><img src='"+ cdniverse +"images/baseline-volume_off-24px.svg' style='height:1.5em'></button>"
}
//------------------------------------------
buttonCameraOfLocalUser(localUser, height = "1.5em")
{
let meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)

let muted = localUser.cameraMuted
  || !peersCameraActive 
  || !meetObj.cameraActive
  || meetObj.disabled 


return "<button class='imageCell myWebRTClocalUserButtonCamera_"+localUser.uuid+"' onClick='event.stopPropagation();myWebRTChub.localUserCameraMuteNotUnmute(\""+localUser.uuid+"\",!compareColors($(this).css(\"backgroundColor\"), \"#fbb\"))' style='background-color:"+(localUser.cameraMuted ? "#fbb" :  muted ? "#ff8":"#bfb")+"'>"
    + "<img class='myWebRTClocalUserButtonCameraOn_"+localUser.uuid+"' src='"+ cdniverse +"images/videocam-black-18dp.svg' style='"+(muted ? "display:none;" : "")+"height:"+height+"'>"
    + "<img class='myWebRTClocalUserButtonCameraOff_"+localUser.uuid+"' src='"+ cdniverse +"images/videocam_off-black-18dp.svg' style='"+(muted ? "" : "display:none;")+"height:"+height+"'></button>"
	+ "</button>"
}
//------------------------------------------
buttonMicrophoneOfLocalUser(localUser, height = "1.5em")
{    
let meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)

let muted = localUser.microphoneMuted 
	|| !meetObj.microphoneActive 
	|| meetObj.disabled 
	|| !peersMicrophoneActive
	|| globalIsMutedBecauseOfSeveralReasons > 0
	
return "<button class='imageCell myWebRTClocalUserButtonMicrophone_"+localUser.uuid+"' onClick='event.stopPropagation();myWebRTChub.localUserMicrophoneMuteNotUnmute(\""+localUser.uuid+"\",!compareColors($(this).css(\"backgroundColor\"),\"#fbb\"))' style='background-color:" +(localUser.microphoneMuted ? "#fbb": muted ? "#ff8" : "#bfb")+ "'>"
   + "<img class='myWebRTClocalUserButtonMicrophoneOn_"+localUser.uuid+"' src='"+ cdniverse +"images/iconfinder_microphone_322463.svg' style='"+(muted ? "display:none;" : "")+"height:"+height+"'>"
   + "<img class='imageCell myWebRTClocalUserButtonMicrophoneOff_"+localUser.uuid+"' src='"+ cdniverse +"images/iconfinder_microphone-slash_1608549.svg' style='"+(muted ? "" : "display:none;")+"height:"+height+"'>"
   + "</button>"
}
//------------------------------------------
buttonCameraOfLocalUserToPeer(uuid, selectorOrObject, belongingToMeetingUUID)
{
let localUser = localUsersUUIDtoObject.get(uuid)	

if(!belongingToMeetingUUID) //localUser or belongingToMeetingUUID must be given
	belongingToMeetingUUID = localUser.meetingUUID

let o = isString(selectorOrObject) ? simplePeersObjects.get(selectorOrObject) : selectorOrObject
let off = "<img src='"+ cdniverse +"images/videocam_off-black-18dp.svg' style='height:1.5em'>"

let meetObj = meetingsUUIDtoObject.get(o.meetingUUID)

if(localUser && localUser.streamToSend.getVideoTracks() == 0)
  return off

let end = "_" + uuid + "_" + o.meetingWithUUID

let muted = (localUser && (localUser.cameraMuted || o.cameraMuted[localUser.uuid]))
  || !peersCameraActive 
  || !meetObj.cameraActive
  || meetObj.disabled 


return "<button class='imageCell myWebRTClocalUserButtonCameraToPeer"+end+"' onClick='event.stopPropagation();myWebRTChub.localUserCameraMuteNotUnmuteToPeer("+(uuid ? "\""+uuid + "\"" : "undefined")+",\""+o.selector+"\",!compareColors($(this).css(\"backgroundColor\"),\"#fbb\"), \""+belongingToMeetingUUID+"\")' style='background-color:"+ ((localUser ? o.cameraMuted[localUser.uuid] : o.oFirstOfPeer.allCameraMuted) ? "#fbb" : muted ? "#ff8":"#bfb" ) + "'>"
    + "<img class='myWebRTClocalUserButtonCameraOnToPeer"+end+"' src='"+ cdniverse +"images/videocam-black-18dp.svg' style='" + (muted ? "display:none;" : "")+"height:1.5em'>"
    + "<img class='myWebRTClocalUserButtonCameraOffToPeer"+end+"' src='"+ cdniverse +"images/videocam_off-black-18dp.svg' style='" + (muted ? "" : "display:none;")+"height:1.5em'>"
    + "</button>"
}
//------------------------------------------
buttonMicrophoneOfLocalUserToPeer(uuid, selectorOrObject, belongingToMeetingUUID)
{    
let localUser = localUsersUUIDtoObject.get(uuid)	

if(!belongingToMeetingUUID) //localUser or belongingToMeetingUUID must be given
	belongingToMeetingUUID = localUser.meetingUUID

let o = isString(selectorOrObject) ? simplePeersObjects.get(selectorOrObject) : selectorOrObject

let meetObj = meetingsUUIDtoObject.get(o.meetingUUID)

let end = "_" + uuid + "_" + o.meetingWithUUID
let muted =  (localUser && (localUser.microphoneMuted || o.microphoneMuted[localUser.uuid]))
  || !peersMicrophoneActive
  || globalIsMutedBecauseOfSeveralReasons > 0
  || !meetObj.microphoneActive
  || meetObj.disabled 


return "<button class='imageCell myWebRTClocalUserButtonMicrophoneToPeer"+end+"' onClick='event.stopPropagation();myWebRTChub.localUserMicrophoneMuteNotUnmuteToPeer("+(uuid ? "\""+uuid + "\"" : "undefined")+",\""+o.selector+"\",!compareColors($(this).css(\"backgroundColor\"),\"#fbb\"),\""+belongingToMeetingUUID+"\")' style='background-color:"+ (( localUser ? o.microphoneMuted[localUser.uuid] : o.oFirstOfPeer.allMicrophoneMuted) ? "#fbb" : muted ? "#ff8":"#bfb") + "'>"
  + "<img class='myWebRTClocalUserButtonMicrophoneOnToPeer"+end+"' src='"+ cdniverse +"images/iconfinder_microphone_322463.svg' style='" + (muted ? "display:none;" : "")+"height:1.5em'>"
  + "<img class='myWebRTClocalUserButtonMicrophoneOffToPeer"+end+"' src='"+ cdniverse +"images/iconfinder_microphone-slash_1608549.svg' style='"+(muted ? "" : "display:none;")+"height:1.5em'>"
+ "</button>"

}
//------------------------------------------
buttonVideoOfPeer(selector)
{
let o = simplePeersObjects.get(selector)

let off = "<img src='"+ cdniverse +"images/image_not_supported-black-18dp.svg' style='height:1.5em'>"

if(!o || !o.midOfVideoTrack)
	return off
return "<button class='imageCell myWebRTCpeerButtonVideoOn_"+o.uuid+"' onClick='event.stopPropagation();myWebRTChub.peerVideoMuteNotUnmute(\""+o.selector+"\",true)' style='"+(o.videoActive ? "" : "display:none;")+"background-color:#bfb'><img src='"+ cdniverse +"images/image-black-18dp.svg' style='height:1.5em'></button>"
	+ "<button class='imageCell myWebRTCpeerButtonVideoOff_"+o.uuid+"' onClick='event.stopPropagation();myWebRTChub.peerVideoMuteNotUnmute(\""+o.selector+"\",false)' style='"+(o.videoActive ? "display:none;" : "")+"background-color:#fbb'>"+off+"</button>"
}
//------------------------------------------
buttonSpeakersOfPeer(selector)
{
let o = simplePeersObjects.get(selector)

let off = "<img src='"+ cdniverse +"images/baseline-volume_off-24px.svg' style='height:1.5em'>"
if(!o || !o.midOfAudioTrack)
	return off
return "<button class='imageCell myWebRTCpeerButtonLoud_"+o.uuid+"' onClick='event.stopPropagation();myWebRTChub.peerSpeakersMuteNotUnmute(\""+o.selector+"\",true)' style='"+(o.speakersActive ? "" : "display:none;")+"background-color:#bfb'><img src='"+ cdniverse +"images/baseline-volume_up-24px.svg' style='height:1.5em'></button>"
      + "<button class='imageCell myWebRTCpeerButtonSilent_"+o.uuid+"' onClick='event.stopPropagation();myWebRTChub.peerSpeakersMuteNotUnmute(\""+o.selector+"\",false)' style='"+(o.speakersActive ? "display:none;" : "")+"background-color:#fbb'>"+off+"</button>"
}
//------------------------------------------
meetingLinksHTML(sep = "", onlyThisUUID = "", sep2 = "", sep3 = "")
{
	
let s = ""
for(let [uuid, meetObj] of meetingsUUIDtoObject)
  if(!meetObj.notYetUsable)
   {
   if(onlyThisUUID != "" && onlyThisUUID != uuid)
	 continue
   let fullLink = this.fullLinkFromMeetObjFullLink(meetObj)
   
   let fullLinkEncoded = encodeURIComponent(fullLink)
   s += sep + (onlyThisUUID ? "<b>M"+meetObj.number+"</b>" : "<button onClick='myWebRTChub.showBottomMenuWaitingForOthers(\""+uuid+"\")'><b>M"+meetObj.number+"</b></button>") + " <input style='color:#00f' onClick='openBrowser(\""+  fullLinkEncoded+"\")' value='" + fullLink + "' style='10em'>"
	+ sep2 + "<img onClick='showUrlQRcodeOf(\""+fullLinkEncoded+"\")' src='"+ cdniverse+"images/iconfinder_qrcode_1608801.svg' style='height:1.5em'>"
   + " <img onClick=\"copyToClipboard(`"+meetObj.shortLink+"`, undefined, true)\" src='"+ cdniverse+"images/baseline-file_copy-24px.svg' style='height:1.5em'>" 
   + (navigator.share
		? "<button onclick='shareToApplications(\"link\",`"+meetObj.shortLink+"`)'><img src='https://storage.googleapis.com/cdniverse/images/baseline-share-24px.svg' style='height:2em'></button>"
		: "") 
   + sep3 
  
}
		
return "<table id='meetingLinks_"+onlyThisUUID+"'><tr><td>" + s
	  + (onlyThisUUID ? "" : 
            sep + "<nobr> &nbsp; <input type='text' onclick='myWebRTChub.treatNewMeetingLink(this.value)' oninput='myWebRTChub.treatNewMeetingLink(this.value)' " + attributeWithTranslation("placeHolder", TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[35])) + ">"
	      + sep + "</nobr> <nobr>&nbsp; " + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[43]) + " <b onclick='localSubmit(REFRESH_INDEX_HTML, undefined, undefined, \"webrtc_nogo_landingPage\")' style='cursor:pointer;color:#c9211e'>nogo</b>")
	  + "</nobr></td></tr></table>"
}
//---------------------------------------------------
fullLinkFromMeetObjFullLink(meetObj)
{
   let fullLink = meetObj.fullLink
   if(fullLink == "undefined")
	 fullLink = (isInLocalhost ? "http://talkisi.localhost:8080" : "https://talkisi.com") +"?meet=" + meetObj.meetingUUID

   if(fullLink.indexOf("/s/") == -1 && meetObj.linkORadvancedParamJSON)
	{
		if(meetObj.linkORadvancedParamJSON.startsWith("http"))
		  fullLink = meetObj.linkORadvancedParamJSON
		else 
		  fullLink += "&ap=" + meetObj.linkORadvancedParamJSON
	}
	return fullLink
}
//---------------------------------------------------
changeToDetectedEmotion(emotionString, certitude0to1)
{
let changed = lastEmotionThatWasDetected === undefined 
  || lastEmotionThatWasDetected.emotion !== emotionString
  || lastEmotionThatWasDetected.value !== certitude0to1
if(!changed)
	return
  
  
if(lastEmotionThatWasDetected !== undefined && lastEmotionThatWasDetected.emotion !== emotionString)
	$("#webRTC_emotion_"+expresionToEmotionIcon[lastEmotionThatWasDetected.emotion]).hide()

if(lastEmotionThatWasDetected === undefined 
		  || lastEmotionThatWasDetected.emotion !== emotionString)
	myWebRTChub.emotion(expresionToEmotionIcon[emotionString])
		

lastEmotionThatWasDetected = { emotion: emotionString, value: certitude0to1}

$("#webRTC_emotion_"+expresionToEmotionIcon[lastEmotionThatWasDetected.emotion]).css("opacity", certitude0to1).show()


}
//---------------------------------------------------
switchOnOrOffEmotionDetection(onNotOff)
{
	let localUser = activeLocalUser
	if(localUser.isInAutomaticEmotionDetectionMode == onNotOff)
		return
		
	this.emotionCornerContents() //to guarantee images are created	
		
	localUser.isInAutomaticEmotionDetectionMode = onNotOff
	
	$(".automatic_emotion_localUser_" + localUser.uuid).prop('checked', onNotOff)
	
	myWebRTChub.emotion()

	if(onNotOff)
		startFaceTrackingWebRTChub()
	else
		{
		if(lastEmotionThatWasDetected != undefined)
			{
			$("#webRTC_emotion_"+expresionToEmotionIcon[lastEmotionThatWasDetected.emotion]).hide()
			lastEmotionThatWasDetected = undefined
			}
		}
			
	if(!onNotOff)
		$(".emotionsToChooseWebRTChub").css("opacity", 1)
	showHideSelector(".emotionsToChooseWebRTChub", !onNotOff)
		
}
//---------------------------------------------------
sharePDF()
{
	if(confirm(TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[16])))
	{
//	this.sendCommandToPeers(undefined, "DIV_REFRESH", refresh)
	}
}
//---------------------------------------------------
menuCloseMeeting() 
{
	
	if(dismissPopup1("menuCloseMeeting"))
	  return
	
	let element = getPopup1("menuCloseMeeting");
	element.style.color = "#000";
	element.style.width = "";
	element.style.height = "";
	element.style.backgroundColor = "#fdd"


	let close = "dismissPopup1(\"menuCloseMeeting\")"

	let s = "<table onClick='"+close+"' style='width:100%'><tr><td> "+TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[19])+"</td><td style='width:40px'><b style='cursor:pointer; color:#800'>X</b></td></tr></table>"
	
	let num = 0
	for(let [meetingUUID, meetObj] of meetingsUUIDtoObject)
	  if(!meetObj.notYetUsable)
	  {
		num++
		let separation = $("#divEmcopassingAll_" + meetingUUID)[0]
		s += "<br><div onClick='"+close+";closeThisMeetingID(\"" + meetingUUID + "\")'><button style='padding:1em;vertical-align:middle'><nobr>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[25])	+ " <b>"+ (meetObj.title || meetObj.name) +"</b></nobr></button>"
				+ " <div style='display:inline-table;background-image:"+ separation.style.backgroundImage +";background-position:" + separation.style.backgroundPosition + ";background-size:100% 100%;background-attachment:scroll;width:4em;height:4em;border:1px solid #000;vertical-align:middle'></div></div>"
	  }
	
	if(num > 1)
		s += "<br><br><button onClick='"+close+";myWebRTChub.closeMyWebRTCdiv()' style='padding:1em;background-color:#800;color:#fff'>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[41])	+ "</button><br>&nbsp;"
	  
		  
	$(element).html(s).show()

}
//---------------------------------------------------
verifyURLlinkChanged(e) 
{
let value = $("#myLinkToOtherPeers").val()
let valid=isURL(value)
showHideSelector(".showHideMyLinkToOtherPeers", valid)
showHideSelector(".hidesWhenShowsMyWebRTCLink", !valid)
if(e && e.keyCode == 13 && valid) 
	myWebRTChub.changedMyLinkToSend(true)
return valid
}
//---------------------------------------------------
updatePeersScreenSharingCenter(localUser = activeLocalUser)
{
let s = "<input id='webrtchub_input_renameScreenSharing' type='text' onKeyUp='if(event.keyCode == 13)myWebRTChub.renameLocalUser(\""+localUser.uuid+"\",this)' value='"+localUser.username+"' style='width:10em;margin-bottom:5px'>"
	+ "<br><nobr><button onCLick='myWebRTChub.renameLocalUser(\""+localUser.uuid+"\",$(\"#webrtchub_input_renameScreenSharing\")[0])'>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[67]) + "</button>"
	+ "<button onClick='if(myWebRTChub.optionOfLocalUser(\"" + localUser.uuid + "\", \"remove\"))myWebRTChub.closeBottomBar()' style='color:red' " + attributeWithTranslation("title", TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[68])) + "><b style='color:#f00'>&nbsp;X&nbsp;</b></button></nobr>"

  $("#usernameScreenShareCenter").html(s)
}
//---------------------------------------------------
updatePeersVideoCenter(localUser = activeLocalUser)
{
let s ="<nobr><table class='wm'><tr>"

	//s += "<td class='imageCell allMyWebRTCelementsRelatedToSendVideo' >"
	//	+ "<table class='wm' id='tableWithButtonsRotateAndPlus' style='display:none'><tr class='wm'><td class='wm' style='width:1px'>"
		+ "<td class='wm'><button onClick='myWebRTChub.rotateVideoGlobalPeers(\".canvasForPeersWebRTC\")'><img src='"+ cdniverse +"images/rotate_90_degrees_ccw-black-18dp.svg' style='height:1.5em'></button>" +
		  "<br>"
	    + "<button onClick='showTopBar(\"enumerateDevices\", undefined, true, \""+ localUser.uuid +"\")'><img src='"+ cdniverse +"images/cameraswitch_black_24dp.svg' style='height:20px'></button>"
	+ "</td>" 
	//+ "</tr></table></td>"

	  s += "<td class='imageCell' id='buttonsPeersOfRotateAndPlus'>" 
		+ "<table><tr><td class='wm' onClick='activeLocalUser.myVideoIsBlackAndWhite=!activeLocalUser.myVideoIsBlackAndWhite' title='color <-> black & white' style='cursor:pointer;border:1px solid #000;background-color:#fff;color:#000;width:2.5em;height:1.5em'>b&w</td></tr></table>"
	  	+ "<br><button class='imageCell' onClick='myWebRTChub.toggleCircleVideoGlobalPeers(); myWebRTChub.toggleCornersVisibility()' style='margin-top:5px'><img src='"+ cdniverse +"images/panorama_fish_eye-black-18dp.svg' style='height:1.5em'></button>"
	  + "</td>"
	  + "</tr></table><br id='breakBetweenTablesOfCircleAndColors' style='display:none'>"
	  + "<table class='wm' style='width:7em'><tr>"
	  +	"<td id='buttonsPeersTrianglesCircleColorsTEXT'>" 
	  + "<img onClick='if(myWebRTChub.changeToShape(\"octogonal\")) return; if(!changeToColorTrianglesCircle(\"#daa520\"))localSubmit("+REFRESH_INDEX_HTML+", undefined, undefined, \"webrtc_octaia_ajuda\")' src='"+cdniverse+"images/octaia/symbol.svg' title='OCTAIA - open communications' style='cursor:pointer;width:20px;height:20px;margin-bottom:5px'>" 
	  + "<img onClick='if(myWebRTChub.changeToShape(\"hexagonal\")) return; if(!changeToColorTrianglesCircle(\"#959ba3\"))localSubmit("+REFRESH_INDEX_HTML+", undefined, undefined, \"webrtc_hexaia_ajuda\")' src='"+cdniverse+"images/hexaia/symbol.svg' title='HEXAIA - global experiences' style='cursor:pointer;width:20px;height:20px;margin-bottom:5px'>"
	  + "<br><table onClick='event.stopPropagation();chooseColorTrianglesCircle()' id='buttonsPeersTrianglesCircleColors' style='cursor:pointer;border:1px solid #000; width:38px;height:38px;background-color:#fff'><tr><td></td></tr></table>"
	  + "</td>"
		  
	  + "<td class='wm' style='vertical-align:top'>"
	  + "<table border='1' style='min-width:3.5em'>"
	  + "<tr>" + myWebRTChub.tdCorner("[1]", 1, localUser) + myWebRTChub.tdCorner("[1, 2]",5, localUser) + myWebRTChub.tdCorner("[2]", 2, localUser) + "</tr>" 
	  + "<tr>" + myWebRTChub.tdCorner("[1, 4]",6, localUser) + myWebRTChub.tdCorner("[1, 2, 3, 4]", undefined, localUser) + myWebRTChub.tdCorner("[2, 3]",7, localUser) + "</tr>" 
	  + "<tr>" + myWebRTChub.tdCorner("[4]", 4, localUser) + myWebRTChub.tdCorner("[4, 3]", 8, localUser) + myWebRTChub.tdCorner("[3]", 3, localUser) + "</tr>" 
	  + "</table>"
	  + "</td>"

	s += "<td><button onClick='myWebRTChub.menuUserCaption(\""+localUser.uuid+"\")'>captions</button>"

	if(isInLocalhost)
	   s += "<br><select onChange='myWebRTChub_chooseBanubaEffect(\""+ localUser.uuid +"\", this.value)'>" 
		 + "<option>AR effects</option>"	
		 + "<option>Background 1</option>"	
		 + "<option>Hat+Glasses</option>"	
		 + "</select>"
	s += "</td></tr></table></nobr>"
	
  $("#peersVideoCenter").html(s)

  s = "<input id='webrtchub_input_renameLocalUser' type='text' onKeyUp='if(event.keyCode == 13)myWebRTChub.renameLocalUser(\""+localUser.uuid+"\",this)' value='"+localUser.username+"' style='width:10em;margin-bottom:5px'>"
	+ "<br><nobr><button onCLick='myWebRTChub.renameLocalUser(\""+localUser.uuid+"\",$(\"#webrtchub_input_renameLocalUser\")[0])'>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[67]) + "</button>"
	+ "<button onClick='if(myWebRTChub.optionOfLocalUser(\"" + localUser.uuid + "\", \"remove\"))myWebRTChub.closeBottomBar()' style='color:red' " + attributeWithTranslation("title", TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[68])) + "><b style='color:#f00'>&nbsp;X&nbsp;</b></button></nobr>"

  $("#usernameVideoCenter").html(s)

	
}
//---------------------------------------------------
menuUserCaption(localuserID)
{
	if(dismissPopup1("myWebRTChub_menuUserCaption") && localuserID === lastMenuUserCaptionLocaluserID)
		return
	lastMenuUserCaptionLocaluserID = localuserID
	
    let localUser = localUsersUUIDtoObject.get(localuserID)	
	let meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)

	let element = getPopup1("myWebRTChub_menuUserCaption")
	element.style.color = "#000"
	element.style.width = ""
	element.style.height = ""
	element.style.backgroundColor = "#fff"
	element.classList.add("belongs_to_meeting_" + localUser.meetingUUID)
	element.classList.add("belongs_to_localUser_" + localUser.uuid)
	
	let close = "dismissPopup1(`myWebRTChub_menuUserCaption`)"	

	let s = "<table onClick='"+close+"' style='display:table;width:100%'><tr><td><b>"+ (meetObj.name || meetObj.title) +": " + localUser.username+"</b> - speech captioning</td><td style='width:40px'><b style='cursor:pointer; color:#800'>X</b></td></tr></table>"

	if(localUser.sendCaptionsWhenMicOn1orMicOffm1orBoth0 === undefined)
	   localUser.sendCaptionsWhenMicOn1orMicOffm1orBoth0 = 1 //when Mic On	
	const micSend = localUser.sendCaptionsWhenMicOn1orMicOffm1orBoth0

	s += "<label><input id='checkbox_user_enable_disable_captioning_"+localuserID+"' type='checkbox' onClick='myWebRTChub.enableOrDisableUserCaptionGeneration(\""+localuserID+"\", this.checked)' " + (localUser.captionGenerationEnabled ? "checked" : "")+">voice captions</label> &nbsp; "
	   + "<table style='border:1px solid #000;vertical-align:middle'><tr>"
	   +"<td style='background-color:#cfc;'><input type='radio' "+(micSend == 1 ? "checked" : "")+" onClick='myWebRTChub.changeUserCaptionSendWithMic(\""+localuserID+"\", 1)' name='radioCaptionsMicOnOffBoth_"+localuserID+"' title='when mic on'></td><td style='background-color:#cfc;'><img src='"+cdniverse+"images/iconfinder_microphone_322463.svg' style='height: 1.5em'>"
	   + "</td><td style='background-color:#ffc;'><input type='radio' "+(micSend == 0 ? "checked" : "")+" onClick='myWebRTChub.changeUserCaptionSendWithMic(\""+localuserID+"\", 0)' name='radioCaptionsMicOnOffBoth_"+localuserID+"' title='always'></td><td style='background-color:#fcc;'><img src='"+cdniverse+"images/iconfinder_microphone-slash_1608549.svg' style='height: 1.5em'>"
	   + "</td><td style='background-color:#fcc;'><input type='radio' "+(micSend == -1 ? "checked" : "")+" onClick='myWebRTChub.changeUserCaptionSendWithMic(\""+localuserID+"\", -1)' name='radioCaptionsMicOnOffBoth_"+localuserID+"' title='when mic off'></td></tr></table>"

	s += "<br><select onChange='myWebRTChub.detectThisLanguageOfUser(this, \""+localuserID+"\", this.value)' style='margin:1em'><option value=''>-- no language --</option>"
	for(let [code, dialect] of dialectToLanguageCounterCodeMAP)
	  {
		if(localUser.captionLanguageActive === undefined
			&& preferredLanguage === code)
		  localUser.captionLanguageActive = preferredLanguage	
		s += "<option value='"+code+"' "+(localUser.captionLanguageActive === code ? "selected" : "")+" >" + dialect + "</option>"
	  }
	s += "</select>"

	s += "<br>" + showHideCLickingOnHeader("edit caption text to send" 
	        , "<textarea id='textAreaToEditCaption_" + localuserID+"' onkeydown='if(event.keyCode == 13){event.stopPropagation();event.preventDefault();myWebRTChub.sendCaptionFromTextArea(\""+localuserID+"\");return false}' placeHolder='text to send' style='width:25em;height:10em'></textarea>"
	   + "<br><label><input id='checkboxToEditVoicetextCaption_" + localuserID+"' type='checkbox' >edit voice text</label> &nbsp; &nbsp; <button onClick='myWebRTChub.sendCaptionFromTextArea(\""+localuserID+"\")'>send caption</button>")

	
	s += "<div id='share_captions_among_users_"+localuserID+"'></div>"
	
	s += showHideCLickingOnHeader("<b style='color:red'>IMPORTANT: microphone & loops</b>" 
	  , "Uses system defined microphone!!!"
	   + "<br>(can differ from the webcam mic)"
	   + "<br><br><b>ADVICE: use headphones to avoid or reduce sound loops.")

	s += "<br><br>"
	let s1 = "translations &nbsp;<button onClick='myWebRTChub.addOfferUserTranslation(\""+localuserID+"\")' " + (localUser.captionGenerationEnabled ? "checked" : "")+">offer</button>"
	       + " &nbsp; <button onClick='myWebRTChub.addAskForUserTranslation(\""+localuserID+"\")' " + (localUser.captionGenerationEnabled ? "checked" : "")+">ask for</button>"
    let s2 = "<select id='select_user_add_translation_"+ localuserID +"' style='margin:1em'><option value=''>-- translate to --</option>"
	for(let [code, dialect] of dialectToLanguageCounterCodeMAP)
	  {
		if(localUser.translationLanguageActive === undefined
			&& preferredLanguage === code)
		  localUser.translationLanguageActive = preferredLanguage	
		s2 += "<option value='"+code+"' "+(localUser.translationLanguageActive === code ? "selected" : "")+" >" + dialect + "</option>"
	  }
	s2 += "</select>"
	s2 += "<br><div id='div_to_translations_offered_and_asked_for_"+localuserID+"'></div>"
	
	s += s1 + "<br>" + s2 //showHideCLickingOnHeader(s1, s2) + "&nbsp;"
	$(element).html(s).show()

    this.updateLanguagesOfferedAndAskedFor(localuserID)	
	this.updateShareCaptionsAmongUsers(localuserID)
}
//---------------------------------------------------
changeUserCaptionSendWithMic(localuserID, micSend)
{
let localUser = localUsersUUIDtoObject.get(localuserID)	
localUser.sendCaptionsWhenMicOn1orMicOffm1orBoth0 = micSend	
}
//---------------------------------------------------
sendCaptionFromTextArea(localuserID)
{
let localUser = localUsersUUIDtoObject.get(localuserID)	
const textAreaJQ = $("#textAreaToEditCaption_" + localuserID)
const text = textAreaJQ.val().trim()
if(!text)
  return showMessageOnSOSforDuration("please, type some text", 2000)		
if(!localUser.captionLanguageActive)
  return showMessageOnSOSforDuration("please, choose your language", 2000)		

textAreaJQ[0].setSelectionRange(0, textAreaJQ[0].value.length)
textAreaJQ[0].focus()

myWebRTChub.setCaptionsOfUserAndSendToOthers(localuserID, text)
	
}
//---------------------------------------------------
addOfferUserTranslation(localuserID, language)
{
	if(!loggedIn(true))
		return 

	let localUser = localUsersUUIDtoObject.get(localuserID)	

	if(!language)
		language = $("#select_user_add_translation_"+ localuserID)[0].value

	if(!language)
	  return showMessageErrorOnSOSforDuration("Must choose translation language", 2000)		
    if(!localUser.translationLanguagesOffered)
		localUser.translationLanguagesOffered = new Map()
	if(localUser.translationLanguagesOffered.has(language))
	  return showMessageErrorOnSOSforDuration("language already offered", 2000)		
			
	localUser.translationLanguagesOffered.set(language, {active:true})
	this.updateLanguagesOfferedAndAskedFor(localuserID)	
	
}
//---------------------------------------------------
addAskForUserTranslation(localuserID)
{
	let localUser = localUsersUUIDtoObject.get(localuserID)	
	let language = $("#select_user_add_translation_"+ localuserID)[0].value

	if(!language)
	  return showMessageErrorOnSOSforDuration("Must choose translation language", 2000)		
	if(localUser.translationLanguagesAskedFor.has(language))
	  return showMessageErrorOnSOSforDuration("language already asked for", 2000)		
			
	localUser.translationLanguagesAskedFor.set(language, {active:true})
	this.updateLanguagesOfferedAndAskedFor(localuserID)	
	
	this.sendCommandToPeers(undefined, "ASK_TRANSLATE_LANGUAGE", localUser.uuid + " Y" + language)
}
//---------------------------------------------------
updateLanguagesOfferedAndAskedFor(localuserID)	
{
let localUser = localUsersUUIDtoObject.get(localuserID)	
let meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)

let s = ""
	
if(localUser.translationLanguagesOffered && localUser.translationLanguagesOffered.size)	
{
	s += "<br><b style='color:green'>Translations offered</b><br><table border=1><tr><th>language</th><th>offer</th><th>users</th><th>remove</th></tr>"
	for(let [code, obj] of localUser.translationLanguagesOffered)
	{
		let peersThasAskedForLanguage = localUser.translationsOthersAskedFor ? localUser.translationsOthersAskedFor.get(code) : undefined
		s += "<tr><td>" + dialectToLanguageCounterCodeMAP.get(code) + "</td>"
			  +"<td><input type='checkbox' onClick='myWebRTChub.activeNotActiveTranslationUserOffered(\"" + localuserID +"\", \""+code+"\", this.checked)' "+ (obj.active ? "checked" : "") +"></td>"
			  +"<td>" + (peersThasAskedForLanguage ? peersThasAskedForLanguage.size : 0) + "</td>"
			  +"<td><button onClick='myWebRTChub.activeNotActiveTranslationUserOffered(\"" + localuserID +"\", \""+code+"\")'><b style='color:red'>X</b></td>"
			  +"</tr>"
	}
	s += "</table><br>"
}	
if(localUser.translationLanguagesAskedFor.size)	
{
	s += "<br><b style='color:blue'>Translations you ask for</b><br><table border=1><tr><th>language</th><th>remove</th></tr>"
	for(let [code, obj] of localUser.translationLanguagesAskedFor)
		s += "<tr><td>" + dialectToLanguageCounterCodeMAP.get(code) + "</td>"
			  +"<td><button onClick='myWebRTChub.activeNotActiveTranslationUserAskedFor(\"" + localuserID +"\", \""+code+"\")'><b style='color:red'>X</b></td>"
			  +"</tr>"
	s += "</table><br>"
}	

let languages = new Map()
for(let [uuid, o] of meetObj.simplePeersObjects)
  for(let language of o.askForTranslateLanguage)
	{
		let others = languages.get(language)
		if(!others)
		{
			others = new Set()
			languages.set(language, others)
		}
		others.add(o)
	}


//IMPORTANT 
//translationLanguagesOffered : languages that users ask for
//translationsOthersAskedFor : languages that DINAMICALLY users are using and asked for AFTER receiving the captions

if(languages.size)
{
	s += "<br><b style='color:blue'>Translations others asked for</b><br><table border=1><tr><th>Language</th><th>peers</th><th>offer</th></tr>"
	for(let [language, others] of languages)
		s += "<tr><td>" + dialectToLanguageCounterCodeMAP.get(language) + "</td>"
			  + "<td>" + others.size + "</td>"
			  + "<td>" + ((language === localUser.captionLanguageActive 
								&& localUser.captionGenerationEnabled)
							|| (localUser.translationLanguagesOffered
								&& localUser.translationLanguagesOffered.has(language))
							? "included" 
							: "<button onClick='myWebRTChub.addOfferUserTranslation(\""+ localuserID +"\", \""+language+"\")'>offer</button>") 
			 + "</td>"
			+"</tr>"
	s += "</table><br>"
}
	
$("#div_to_translations_offered_and_asked_for_"+localuserID).html(s)	
}
//---------------------------------------------------
updateShareCaptionsAmongUsers(localuserID)
{
if(!localuserID)
{
  for(let [uuid, localUser] of localUsersUUIDtoObject)
    this.updateShareCaptionsAmongUsers(uuid) 
  return	
}	
	
let localUser = localUsersUUIDtoObject.get(localuserID)	
if(!localUser)
  return
if(!localUser.shareCaptionsToTheseLocalUsers)
  localUser.shareCaptionsToTheseLocalUsers = new Set()
if(!localUser.shareCaptionsFromTheseLocalUsers)
  localUser.shareCaptionsFromTheseLocalUsers = new Set()

let rows = ""
for(let [meetingUUID, meetObj] of meetingsUUIDtoObject)
{
  let sMeeting = ""
  for(let [uuid2, localUser2] of localUsersUUIDtoObject)
	if(uuid2 !== localuserID 
		&& localUser2.screenMode === "NORMAL" //excludes screen share, youtube and others
		&& localUser2.meetingUUID === meetingUUID)
	{
		if(!localUser2.shareCaptionsToTheseLocalUsers)
  			localUser2.shareCaptionsToTheseLocalUsers = new Set()
		if(!localUser2.shareCaptionsFromTheseLocalUsers)
  			localUser2.shareCaptionsFromTheseLocalUsers = new Set()
	    if(localUser2.sendCaptionsWhenMicOn1orMicOffm1orBoth0 === undefined)
			localUser2.sendCaptionsWhenMicOn1orMicOffm1orBoth0 = 1 //mic on
		const micSend = localUser2.sendCaptionsWhenMicOn1orMicOffm1orBoth0
		rows += "<tr><td><b>" + (meetObj.title || meetObj.name) 
		    + "</b>: <a onclick='myWebRTChub.menuUserCaption(\""+uuid2+"\")'>" + localUser2.username + "</a>"
		  	+ "<br><nobr><label><input type='checkbox' onClick='myWebRTChub.shareCaptionsAmongLocalUsers(this.checked, \""+ localuserID +"\", \"" + uuid2 + "\")' "+(localUser.shareCaptionsToTheseLocalUsers.has(localUser2) ? "checked" : "")+">to</label>"
		  	+ " &nbsp; <label><input type='checkbox' onClick='myWebRTChub.shareCaptionsAmongLocalUsers(this.checked, \""+ uuid2 +"\", \"" + localuserID + "\")' "+(localUser.shareCaptionsFromTheseLocalUsers.has(localUser2) ? "checked" : "")+">from</label>"
			+ "</nobr></td><td><table class='wm' style='width:100%'><tr>"
	 	 		   + "<td style='background-color:#cfc'><input type='radio' "+(micSend == 1 ? "checked" : "")+" onClick='myWebRTChub.changeUserCaptionSendWithMic(\""+uuid2+"\", 1)' name='radioCaptionsMicOnOffBoth_small_"+uuid2+"' title='when mic on'></td>"
	   			   + "<td style='background-color:#ffc'><input type='radio' "+(micSend == 0 ? "checked" : "")+" onClick='myWebRTChub.changeUserCaptionSendWithMic(\""+uuid2+"\", 0)' name='radioCaptionsMicOnOffBoth_small_"+uuid2+"' title='send always'></td>"
	   			   + "<td style='background-color:#fcc'><input type='radio' "+(micSend == -1 ? "checked" : "")+" onClick='myWebRTChub.changeUserCaptionSendWithMic(\""+uuid2+"\", -1)' name='radioCaptionsMicOnOffBoth_small_"+uuid2+"' title='when mic off'></td>"
			+ "</tr></table></td>"
		   + "</tr>"

	}
}

let s = ""

if(rows)
  s = "<table border=1><thead><th><nobr>local users</nobr><br><nobr>share to or from</nobr></th>" 
	 + "<th><table class='wm' style='width:100%'><tr>"
	 	 +"<td style='background-color:#cfc'><img src='"+cdniverse+"images/iconfinder_microphone_322463.svg' style='height: 1.5em'></td>"
		 +"<td style='background-color:#ffc;width:33%'></td>"
		 +"<td style='background-color:#fcc'><img src='"+cdniverse+"images/iconfinder_microphone-slash_1608549.svg' style='height: 1.5em'></td>"
		+"</tr></table>"
	   +"</th></tr></thead><tbody>" + rows + "</tbody></table><br><br>"

$("#share_captions_among_users_" + localuserID).html("<br>" + s)
	
}
//---------------------------------------------------
shareCaptionsAmongLocalUsers(connect, localUserID1, localUserID2)
{
let localUser1 = isString(localUserID1) ? localUsersUUIDtoObject.get(localUserID1) : localUserID1	
let localUser2 = isString(localUserID2) ? localUsersUUIDtoObject.get(localUserID2) : localUserID2	

if(connect)
{
	localUser1.shareCaptionsToTheseLocalUsers.add(localUser2)
	localUser2.shareCaptionsFromTheseLocalUsers.add(localUser1)
}	
else
{
	localUser1.shareCaptionsToTheseLocalUsers.delete(localUser2)
	localUser2.shareCaptionsFromTheseLocalUsers.delete(localUser1)
}

this.updateShareCaptionsAmongUsers(localUser1.uuid)
this.updateShareCaptionsAmongUsers(localUser2.uuid)
	
}
//---------------------------------------------------
activeNotActiveTranslationUserOffered(localuserID, code, offerNotOffer)
{
let localUser = localUsersUUIDtoObject.get(localuserID)	
if(offerNotOffer === undefined)
  {
  localUser.translationLanguagesOffered.delete(code)	
  this.updateLanguagesOfferedAndAskedFor(localuserID)
  }
else
  localUser.translationLanguagesOffered.get(code).active = offerNotOffer	
}
//---------------------------------------------------
activeNotActiveTranslationUserAskedFor(localuserID, code, offerNotOffer)
{
let localUser = localUsersUUIDtoObject.get(localuserID)	
if(offerNotOffer === undefined)
  {
  localUser.translationLanguagesAskedFor.delete(code)
  this.sendCommandToPeers(undefined, "ASK_TRANSLATE_LANGUAGE", localUser.uuid + " N" + code)
  this.updateLanguagesOfferedAndAskedFor(localuserID)
  }
else
  localUser.translationLanguagesAskedFor.get(code).active = offerNotOffer	
}
//---------------------------------------------------
enableOrDisableUserCaptionGeneration(localuserID, enabledNotDisable)
{
	let localUser = localUsersUUIDtoObject.get(localuserID)	

	if(!localUser.captionLanguageActive)
	  {
		showMessageErrorOnSOSforDuration("Must choose your language", 2000)		
		enabledNotDisable = false
	  }
	localUser.captionGenerationEnabled = enabledNotDisable

	$("#checkbox_user_enable_disable_captioning_" + localuserID).prop('checked', enabledNotDisable)
	
	if(enabledNotDisable)
		this.detectThisLanguageOfUser(undefined, localuserID, localUser.captionLanguageActive)		
	else 
		{
		myWebRTChub.setCaptionsOfUserAndSendToOthers(localuserID, "", true)
		if(localUser.speechRecognition)
		   localUser.speechRecognition.stop()
		localUser.speechRecognition = undefined
		}
	this.updateLanguagesOfferedAndAskedFor(localuserID)
}
//---------------------------------------------------
detectThisLanguageOfUser(selectElement, localuserID, languageCode, doNotShowMessages)
{
	let localUser = localUsersUUIDtoObject.get(localuserID)	
    
	localUser.captionGenerationEnabled = false
	if(localUser.speechRecognition)
		localUser.speechRecognition.stop()

	localUser.speechRecognition = undefined

	if(selectElement)
	{
	localUser.captionLanguageActive = selectElement.value
	if(selectElement.value == "")
		return this.enableOrDisableUserCaptionGeneration(localuserID, false)
	}
	

	getMySpeechRecognition()

	if(!window.SpeechRecognition)
		{
		if(selectElement)
			selectElement.value = ""
		showMessageErrorOnSOSforDuration("Speech recognition not available", 2000)		
		}
	else
		{
		let message = "speech captioning disabled"
		if(languageCode)
			{
				localUser.captionGenerationEnabled = true
				message = dialectToLanguageCounterCodeMAP.get(languageCode) + " -> speech captioning active"
				localUser.speechRecognition = new window.SpeechRecognition()
				//const speechRecognitionList = new SpeechGrammarList()
				//speechRecognitionList.addFromString(grammar, 1)
				//speechRecognition.grammars = speechRecognitionList
				localUser.speechRecognition.continuous = true
				localUser.speechRecognition.lang = languageCode
				localUser.speechRecognition.interimResults = true
				localUser.speechRecognition.maxAlternatives = 1
				localUser.speechRecognition.addEventListener("result", 
					function(event)
					{
						let s = ""
						const res = event.results[event.results.length-1] //only the last
						if(!res.isFinal)
							return
						s += res[0].transcript + " "
						
						if($("#checkboxToEditVoicetextCaption_" + localuserID).prop("checked"))
							$("#textAreaToEditCaption_" + localuserID).val(s)	
						else 
						  myWebRTChub.setCaptionsOfUserAndSendToOthers(localuserID, s )
					})
					
				localUser.speechRecognition.addEventListener("speechend", () => 
				{
					myWebRTChub.setCaptionsOfUserAndSendToOthers(localuserID, "")
				})	
				localUser.speechRecognition.addEventListener("audioend", () => 
				{
					if(localUser.captionLanguageActive && localUser.captionGenerationEnabled) //then restarts!!!
					  myWebRTChub.detectThisLanguageOfUser(undefined, localuserID, localUser.captionLanguageActive, true)
				})	
					
				localUser.speechRecognition.start()
			}
			
			if(!doNotShowMessages)
				showMessageOnSOSforDuration(message, 2000)		
		}
				
}
//---------------------------------------------------
setCaptionsOfUserAndSendToOthers(localuserID, text = "", finishCaptions, counterUUIDtoSend, fromServerAfterTranslations, language, setOfLocalUsersID = new Set())
{
if(setOfLocalUsersID.has(localuserID))
	return //avoid loops
setOfLocalUsersID.add(localuserID)

let localUser = localUsersUUIDtoObject.get(localuserID)	

text = text.trim()

let textPadded = text ? "<div style='display:inline-table;width:fit-content;background-color:rgb(255, 255, 255, 0.5);color:#fff'><b style='padding:5px'>" + text.trim() + "</b></div>" : ""

$("#peersGlobalVideoCAPTIONS_"+localuserID)[0].innerHTML = textPadded

if(language === undefined)
  language = finishCaptions ? "STOP" 
	: localUser.speechRecognition 
		? localUser.speechRecognition.lang
		: localUser.translationLanguageActive

if(counterUUIDtoSend === undefined)
  counterUUIDtoSend = generateUUID().replaceAll("-","")

let languagesAndText = "F" + language + " " + text.length + " " + text

let translationsNeeded = new Set()
let translationsCodeSent = new Set()

//EMPTY TEXT SHOULD ALSO BE SENT IN ALL LANGUAGES!!!
if(!finishCaptions && localUser.translationLanguagesOffered)
  for(let [code, obj] of localUser.translationLanguagesOffered)
	if(obj.active && code !== language)
	{
		if(!fromServerAfterTranslations
			&& TLtranslationNeededFromLangToLang(language, code, text))
		{
		  let peersThasAskedForLanguage = localUser.translationsOthersAskedFor 
				  ? localUser.translationsOthersAskedFor.get(code)
				  : undefined
		  if(peersThasAskedForLanguage && peersThasAskedForLanguage.size)
		    translationsNeeded.add({fromLang:language, toLang:code, text: text})	
		  languagesAndText += "T" + code + " 0 " //send so that others say if they want it
		}	
	else 
		{
		translationsCodeSent.add(code)
		let translated = TLtranslateFromTo(text, language, code)
		languagesAndText += "F" + code + " " + translated.length + " " + translated
		}

	}
	

if(!localUser.captionsSentMap)
  localUser.captionsSentMap = new Map()
if(text)
	localUser.captionsSentMap.set(counterUUIDtoSend, {text: text, language: language, translations: translationsCodeSent})

if(localUser.sendCaptionsWhenMicOn1orMicOffm1orBoth0 === undefined)
  localUser.sendCaptionsWhenMicOn1orMicOffm1orBoth0 = 1 //when microphone ON
this.sendCommandToPeers(undefined, "CAPTION", localUser.uuid + " " + counterUUIDtoSend +" " + translationsNeeded.size + " " + languagesAndText, localUser.meetingUUID, localUser.sendCaptionsWhenMicOn1orMicOffm1orBoth0)

if(localUser.shareCaptionsToTheseLocalUsers)
  for(let localUser2 of localUser.shareCaptionsToTheseLocalUsers)
	translationsNeeded = new Set([...translationsNeeded, ...this.setCaptionsOfUserAndSendToOthers(localUser2.uuid, text, finishCaptions, counterUUIDtoSend, fromServerAfterTranslations, language, setOfLocalUsersID)]) 


	//only in the original call
if(setOfLocalUsersID.size == 1 && translationsNeeded.size)
  translateMultipleOnServerReturningJScall(translationsNeeded, "myWebRTChub.setCaptionsOfUserAndSendToOthers(`"+ localuserID +"`, `"+ text +"`, undefined, \""+counterUUIDtoSend+"\", true)")

setOfLocalUsersID.delete(localuserID)

return translationsNeeded
}
//---------------------------------------------------
otherPeerAnsweredToCaption(o, parameters)
{
let lastPos = 0
let pos = parameters.indexOf(" ", lastPos)	
let localuserID = parameters.slice(lastPos, pos) 
let localUser = localUsersUUIDtoObject.get(localuserID)	
if(!localUser.translationsOthersAskedFor) 
  localUser.translationsOthersAskedFor = new Map()

lastPos = pos + 1

pos = parameters.indexOf(" ", lastPos)	
let counterUUID = parameters.slice(lastPos, pos)
let objectCaptionSent = localUser && localUser.captionsSentMap ? localUser.captionsSentMap.get(counterUUID) : undefined
//objectCaptionSent can be undefined if it is a general setting not related to a certain caption

lastPos = pos + 1

let sendAgainWithMoreTranslations = false
let needsUpdate = false

while(lastPos < parameters.length)
{
let YesOrNoUse = parameters.charAt(lastPos)
lastPos++
pos = parameters.indexOf(" ", lastPos)	
if(pos == -1)
   pos = parameters.length
let languageCode = parameters.slice(lastPos, pos)
lastPos = pos + 1

let peersThasAskedForLanguage = localUser.translationsOthersAskedFor.get(languageCode)
if(!peersThasAskedForLanguage)
   {
	peersThasAskedForLanguage = new Map()
	localUser.translationsOthersAskedFor.set(languageCode, peersThasAskedForLanguage)
   }

if(YesOrNoUse === "Y")
  {
	if(!peersThasAskedForLanguage.has(o.meetingWithUUID))
		needsUpdate = true
	peersThasAskedForLanguage.set(o.meetingWithUUID, {})//object in the future may have new info/settings
	if(objectCaptionSent && objectCaptionSent.language !== languageCode
		&& !objectCaptionSent.translations.has(languageCode))
	  sendAgainWithMoreTranslations = true
  }	
else 
  if(peersThasAskedForLanguage.delete(o.meetingWithUUID))
	needsUpdate = true
}

if(sendAgainWithMoreTranslations)
  this.setCaptionsOfUserAndSendToOthers(localUser.uuid, objectCaptionSent.text, false, counterUUID, false, objectCaptionSent.language)
if(needsUpdate)
  this.updateLanguagesOfferedAndAskedFor(localuserID)
	
}
//---------------------------------------------------------
otherPeerAsksForTranslateLanguage(oIgnore, parameters)
{
let pos = parameters.indexOf(' ')
let oUUID = parameters.slice(0, pos)
let o = meetingWithUUIDtoPeersObjects.get(oUUID)
let YesOrNo = parameters.charAt(pos + 1)
let language = parameters.slice(pos + 2)

if(YesOrNo === "Y")
	o.askForTranslateLanguage.add(language)
else 
	o.askForTranslateLanguage.delete(language)

this.updateLanguagesOfferedAndAskedForInMeeting(o.meetingUUID)
	
}
//---------------------------------------------------
updateLanguagesOfferedAndAskedForInMeeting(meetingUUID)
{
for(let [uuid, localUser] of localUsersUUIDtoObject)
  if(localUser.meetingUUID === meetingUUID)
	 this.updateLanguagesOfferedAndAskedFor(uuid)	
}	
//---------------------------------------------------
updateOthersVideoCenter(otherSELECTOR = activeOtherUserSELECTOR)
{
activeOtherUserSELECTOR = otherSELECTOR
activeOtherUser = simplePeersObjects.get(activeOtherUserSELECTOR)	
	
let s ="<table class='wm' style='width:100%'><tr><td id='menuOtherUserCAPTION_"+activeOtherUser.meetingWithUUID+"' >"

   s += "</td><td><b>"+activeOtherUser.username+"</b><br>invite to meeting</td><td>"

	for(let [uuid, localUser] of localUsersUUIDtoObject)
	  if(localUser.meetingUUID == activeOtherUser.meetingUUID)
		s += " <button onClick='sosConfirm(\""+ activeOtherUser.username +": invite to private meeting \",`let meetingUUID=nogoLinkEditor.generateMeetingUUID();allPrivateMeetingUUID[meetingUUID]=\"" + localUser.uuid + "\"; myWebRTChub.captureImageToUseInPrivateMeeting(meetingUUID, \""+activeOtherUser.meetingWithUUID+"\");myWebRTChub.sendCommandToPeers(\""+ activeOtherUser.uuid +"\", \"INVITE_TO_PRIVATE_MEETING\", \"" + activeOtherUser.meetingWithUUID + "\" + \" \" + meetingUUID + \" \" + \""+ localUser.uuid +"\")`)'  style='display:inline-table;vertical-align:middle'>"+localUser.username+"<br>private</button>"
	for(let [meetingUUID, meetObj] of meetingsUUIDtoObject)
		if(meetingUUID != activeOtherUser.meetingUUID)
		{
			let separation = $("#divEmcopassingAll_" + meetingUUID)[0]
			s += " <div onClick='sosConfirm(\""+ activeOtherUser.username +": invite to meeting\", `myWebRTChub.sendCommandToPeers(\""+ activeOtherUser.uuid +"\", \"INVITE_TO_MEETING\", \"" + activeOtherUser.meetingWithUUID + " "  + meetingUUID + " " + encodeURIComponent(this.fullLinkFromMeetObjFullLink(meetObj)) + "\")`)'  style='display:inline-table;background-image:"+ separation.style.backgroundImage +";background-position:" + separation.style.backgroundPosition + ";background-size:100% 100%;background-attachment:scroll;width:4em;height:4em;border:1px solid #000;vertical-align:middle'></div></div>"
		}
   s += "     </td>"

	+ "</tr></table>"
	
  $("#peersControlXYzoomOfOthersCamera").html(s)

  this.updateCaptionReceived(activeOtherUser)	
}
//---------------------------------------------------
captureImageToUseInPrivateMeeting(meetingUUID, otherUUID)
{
	let peer = meetingWithUUIDtoPeersObjects.get(otherUUID)
  	let imageURL = videoToImageURL(peer.videoReceive)
    allPrivateMeetingUUIDimage[meetingUUID] = imageURL
}
//---------------------------------------------------
spaceInMainScreenForThisUser(rri, localUser)
{
let meetObj = meetingsUUIDtoObject.get(localUser.meetingUUID)

let s = "<table class='wm tableLocalUser width100PercentWhenIn3D' id='tableLocalUser_"+localUser.uuid+"' style='height:100%;font-size:80%;overflow:hidden' title='"+localUser.username+"'>"
		+ "<tr id='rowOfLocalUser_"+localUser.uuid+"' style='background-color:#666;color:#fff;'>"
		+ "<td class='wm' style='width:1px'><nobr>" + this.buttonCameraOfLocalUser(localUser, "1em")  + this.buttonMicrophoneOfLocalUser(localUser, "1em") + "</nobr></td>"
		
		+ "<td class='wm userNameOfMySelf username_"+localUser.uuid+"' style='text-align:center;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;max-width: 1px'>"+(localUser.username || TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[31]))+"</td>"
		+ "<td class='imageCell' style='width:1px'><table><tr>"
		
        s += "<td class='wm'><nobr>"
        if(!localUser.videoStream || localUser.videoStream.screenMode == "NORMAL") 
          s += "<button class='webrtchub_hide_when_less_than' hideLessThanPixels='150' onClick='myWebRTChub.setActiveLocalUser(\""+localUser.uuid+"\");myWebRTChub.activateCorner(\"peersControlXYzoomOfMyCamera\")'><img src='"+ cdniverse +"images/settings-black-18dp.svg' style='height:1.5em'></button>"
		else if(localUser.videoStream && localUser.videoStream.screenMode == "SCREEN_SHARE") 
          s += "<button class='webrtchub_hide_when_less_than' hideLessThanPixels='150' onClick='myWebRTChub.setActiveLocalUser(\""+localUser.uuid+"\");myWebRTChub.activateCorner(\"peersControlMyActiveScreenSharing\")'><img src='"+ cdniverse +"images/settings-black-18dp.svg' style='height:1.5em'></button>"

		s += myWebRTChub.buttonsExpandRetract(localUser.meetingUUID, "#mySelfInMainScreen_" + localUser.uuid)		
		  + "</nobr></td>"
			
	  //	  + "<td class='TDforButtonControlZoomXYinMySelfInMainScreen wm'><button class='imageCell' onClick='myWebRTChub.activateCorner(\"peersControlXYzoomOfMyCamera\")'><img src='"+ cdniverse +"images/control_camera-black-18dp.svg' style='height:1.5em'></button></td>"

      // if(numLocalUsersGlobal > 1)
	  //	s += "<td class='wm' style='cursor:pointer'><b onClick='myWebRTChub.removeLocalUser(\""+localUser.uuid+"\")'>&nbsp;X&nbsp;</b></td>"

		s += "</tr></table></td>"
		+ "</tr>" 
		+ "<tr class='wm'><td class='imageCell' colspan='3' onClick='myWebRTChub.clickedCanvas(event, \""+localUser.uuid+"\")'>"
		+   "<div style='display:block;position:relative'>" //so that position absolute of IMG icon may work
		//https://stackoverflow.com/questions/49066011/overflow-hidden-with-border-radius-not-working-on-safari
		+    "<div class='imageCell' class='peersGlobalVideoSendDIV_main' id='peersGlobalVideoSendDIV_main_"+localUser.uuid + "' style='overflow: visible;-webkit-mask-image:-webkit-radial-gradient(white, black)'>"
		
		//+      "<canvas class='canvasForPeersWebRTC' id='canvasForPeersWebRTC_"+localUser.uuid+"' onClick='myWebRTChub.clickedCanvas(event, \""+localUser.uuid+"\")' width='120' height='120' style='overflow:hidden;z-index:10;width:"+peersMainVideoWidth+";height:"+peersMainVideoHeight+"'></canvas>"
		+      "<img class='peersGlobalVideoINSTRUCTIONS' id='peersGlobalVideoINSTRUCTIONS_"+localUser.uuid + "' src ='"+cdniverse +"images/talkisi/corners_help13_main.svg' style='display:none;z-index:20;pointer-events:none;position:absolute;top:0px;left:0px;width:100%;height:100%;object-fit:cover'/>"
		+      "<div class='CAPTION_SEND_OR_RECEIVE' id='peersGlobalVideoCAPTIONS_"+localUser.uuid+"' style='position:absolute;bottom:0px;left:0px;width:100%;color: #fff;text-align: center;display: block'></div>"
		+   "</div>"
		+  "</div>"
		+ "</td>"
		+"</tr>"
		+ "</table>"
	
s = surroundByTableFor3D(undefined, s, "mySelfInMainScreen_"+localUser.uuid, "mySelfInMainScreen contentsAndNoHeight webrtchub_senderOrReceiver_"+localUser.meetingUUID+" username_title_"+localUser.uuid, "display:inline-table;margin:2px;padding:0px;vertical-align:middle", "", "username_"+localUser.uuid, false)	
	
let afterORbefore = !localUser.videoStream || localUser.videoStream.screenMode == "NORMAL" ?  "afterbegin" : "beforeend"
$("#divEmcopassingAll_INSIDE"+ localUser.meetingUUID)[0]
	.insertAdjacentHTML(afterORbefore, s);	//should be the first

for(let uuid in adjustNewLocalUserInMyWebRTChubUUID)
	adjustNewLocalUserInMyWebRTChubUUID[uuid](localUser)


if(meetObj.numDivsInMainScreen == 1 
	&& localUser.screenMode == "NORMAL"
	&& (meetObj.numDivsInSidePanel > 0 || !meetObj.activeLocalUser))
  $("#mySelfInMainScreen_"+localUser.uuid)[0].isInSidePanel = true

myWebRTChub.addOrRemoveFromMainScreen(rri, localUser.meetingUUID, "SHOW_MAIN_IN_MAIN")
}
//---------------------------------------------------
treatNewMeetingLink(meetingLink, username, image, meetingLinkOrig)
{
	if(meetingLink == "" && isInLocalhost)
	{
		if(!meetingsUUIDtoObject.get("18437_07f3ed42-fde7-4560-ab88-ef86fe3c3805"))
		    meetingLink = `http://nogoparty.localhost:8080?meet=18437_07f3ed42-fde7-4560-ab88-ef86fe3c3805&ap=~(iU~'https*3a*2f*2fstorage.googleapis.com*2fcdniverse*2fimages*2fnogo*2fdomains*2fparty*2fbirthday-cake-380178_1280.jpg)`
        else
            meetingLink = `http://eupasseio.localhost:8080/?meet=18440_ed16fe0f-d513-4c11-be22-7241952f69ca&ap=~(wwpovID~%275484363999346688XfiuDepgBDFjBqddDqEtuboDAwu~iU~%27http*3a*2f*2flocalhost*3a8080*2f_ah*2fimg*2fzxUsnE2A7iw9yxBPT21RoQ*3ds1024)`
    }

	let shortLink
	if(meetingLink.indexOf("/s/") != -1)
	{
		if(meetingLinkOrig)
		{
		shortLink = meetingLink	
		meetingLink = meetingLinkOrig
		}
		else return localSubmit(CONVERT_SHORT_LINK, undefined, undefined, meetingLink, "myWebRTChub.treatNewMeetingLink(", ",undefined, undefined, \""+ meetingLink +"\")")
	}
	
	let pos = meetingLink.indexOf("?meet=")
	if(pos == -1)
	  return
    let pos2 = meetingLink.indexOf("&", pos)
	if(pos2 == -1)
		pos2 = meetingLink.length
	let meetingUUID = meetingLink.slice(pos + 6, pos2)

	const localUserInvited = meetingUUIDtoLocalUserInvited.get(meetingUUID)
	

	let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	if(meetObj)
	{
		if(!localUserInvited || !localUserInvited.isLoadingFromLocalOrCloud)
			showMessageOnSOSforDuration("ALREADY PRESENT: " + meetingUUID, 3000)		
	}
	else if(meetingLink.indexOf("?") == 0)
	{
	firstTimeLeavingDIVwithPeersWebRTChub = false
	meetObj = nogoLinkEditor.createEmptyMeetObj(meetingUUID, "PRIVATE/" + meetingUUID, image ||  cdniverse + "images/remote/15216_hacker_intruder_killer_thief_user_icon.png","no_show_waiting_for_others")
	meetObj.fullLink = meetingLink
	meetObj.shortLink = shortLink
	let localUserInvited = meetingUUIDtoLocalUserInvited.get(meetingUUID)
	myWebRTChub.inviteToInstantTalk(meetingUUID, username 
												 || (localUserInvited 
													? localUserInvited.username : "ME"))
	}
	else
	{
		if(localUserInvited && localUserInvited.enterImmediately)
		  {
		  registerChannelForUUIDpeers[meetingUUID] = localUserInvited.channel
		  meetObj = nogoLinkEditor.revertAndApplyJSONstring(meetingLink.slice(meetingLink.indexOf("&ap=")+ 4), meetingUUID, undefined, undefined, true)
		  meetObj.fullLink = meetingLinkOrig || meetingLink
	 	  meetObj.shortLink = shortLink
		  myWebRTChub.inviteToInstantTalk(meetingUUID, localUserInvited.username)
		  }
		else
		   actedByTypeClicked("webrtc_hub","","NEW_MEETING_LINK " + encodeURIComponent(meetingLink))
	}

		if(localUserInvited && localUserInvited.isLoadingFromLocalOrCloud)
		      myWebRTChub.updateMenuSettingsMeeting(meetingUUID, localUserInvited.title) 

		
	if(meetingLink.startsWith("?"))
	{
	if(!meetObj.optionsObject)
	   meetObj.optionsObject = {}	
	meetObj.optionsObject.endMeetingWhenLastUserCloses = true	
	}	
		
}
//---------------------------------------------------
showHideForUseByWebRTChub(showNotHide)
{
	let selector = "#webRTChub_mainTableBottomBar_ID"
	
	if(showNotHide !== undefined)
		{
			
			if(showNotHide ^ $(selector).is(":visible"))
			{
			slideDownCloseUp(selector, showNotHide, 0.35, "72px", function()
				{
				resizeREALLY()
				//myWebRTChub.resizeElementsWithPeersParticipant(undefined, undefined,undefined,undefined,true)
				})
			return true
			}
			return false
		}
	
	return $(selector).is(":visible")
}
//---------------------------------------------------
refreshAllEnableNotDisableMeeting(always)
{
	lastObjectsMovedToSidePanel.clear()
	
 	for(let [uuid, meetObj] of meetingsUUIDtoObject)
	    myWebRTChub.enableNotDisableMeeting(uuid, !meetObj.disabled, always, true)
}
//---------------------------------------------------
enableNotDisableMeeting(meetingUUID, enableNotDisable, always, doNotResetLastObjectsMovedToSidePanel)
{
	try
	{
	enteredResizeReally++
	
	let meetObj = meetingsUUIDtoObject.get(meetingUUID)

	if(!always && meetObj.disabled ^ enableNotDisable)
		return false
		
	meetObj.disabled = !enableNotDisable

	let meetingEnabled = $("#divEmcopassingAll_" + meetingUUID).css("display") != "none"
	if(false && meetingEnabled != enableNotDisable)
	{
	showHideSelector(".meeting_show_hide_" + meetingUUID, enableNotDisable)
	showHideSelector("#divEmcopassingAll_" + meetingUUID, enableNotDisable)
	numMeetingsGlobalHidden +=  enableNotDisable ? -1 : 1 
	}
	
	$("#globalMeetingCheckbox_"+meetingUUID).prop("checked",enableNotDisable)
	resizeREALLY()

   this.meetingsSpeakersMuteNotUnmute(meetingUUID)
   this.meetingsCameraMuteNotUnmute(meetingUUID)
   this.meetingsMicrophoneMuteNotUnmute(meetingUUID, undefined, true)					

   this.addOrRemoveFromMainScreen(undefined, meetingUUID, undefined, undefined, doNotResetLastObjectsMovedToSidePanel)
   cameraCSS3Dchanged = true //to adjust margin_left in CSS3D child objects
   return true
   }finally
   {
	enteredResizeReally--
   }
}
//---------------------------------------------------
enableOnlyThisMeeting(meetingUUID)
{
    let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	const divName = webrtcDivName(meetingUUID)
	if(isIn3D)
	{
		let IDSplace = meetObj.numPlace3D + ":151:U"
  		let place = places.get(IDSplace)
  		if(place != cameraOnObject)
		  return setCameraOnObject(undefined, place, milisecondsMoveCamera)
	}
	else if(divName !== currentDIVid())
		{
			typesDivsSelect(undefined, divName)
			addThisDivnameToLastDivsNameOfDivActedUpon(divName)
			return
		}
		
	let changed = false
 	for(let [uuid, meetObj2] of meetingsUUIDtoObject)
	  if(meetObj.notYetUsable)
		continue
	  else if(myWebRTChub.enableNotDisableMeeting(uuid, meetingUUID === uuid))
	   changed = true
		
  if(this.selectMeetObjSelectedWebRTChub(meetingUUID))
    changed = true

  if(!changed)
  {
	let mute = meetObj.cameraActive || meetObj.microphoneActive || meetObj.speakerActive
    this.meetingsCameraMuteNotUnmute(meetingUUID, mute) 
    this.meetingsMicrophoneMuteNotUnmute(meetingUUID, mute) 
    this.meetingsSpeakersMuteNotUnmute(meetingUUID, mute) 
  }
}
//---------------------------------------------------
closeBottomBar()
{

if(afterChangeToEmotionExecuteThis)
  {
  myEval(afterChangeToEmotionExecuteThis)
  afterChangeToEmotionExecuteThis = undefined
  resizeREALLY()
  }
else 
  myWebRTChub.showHideForUseByWebRTChub(false)
}
//---------------------------------------------------
selectMeetObjSelectedWebRTChub(uuid)
{
let changed = meetingIDselectedWebRTChub != uuid
meetingIDselectedWebRTChub = uuid
meetObjActive = meetingsUUIDtoObject.get(uuid)
this.refreshManageLocalUsersToSend()
$(".buttonsOfEachMeeting_ALL").css("border", "1px solid #000")
$("#buttonsOfEachMeeting_" + uuid).css("border","2px solid #0f0")

return changed
}
//---------------------------------------------------
showMeetingIn3Dplace(meetingUUID)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)	
setCameraOnObject(undefined, places.get(meetObj.numPlace3D + ":151:U"))
placeDistancesOfActiveObject(undefined, milisecondsMoveCamera)
}
//---------------------------------------------------
showMeetingIn3Davatar(meetingUUID)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)	

let avatar = objectDataWithIDS(meetObj.numPlace3D + ":158:U")
let oldActive = cameraOnObject
if(oldActive != avatar)
  setOmnatarActive(undefined, avatar, false, 0)
setOmnatarActive(undefined, avatar, false, milisecondsMoveObjects)
}
//---------------------------------------------------
showBottomMenuWaitingForOthers(meetingUUID = meetingIDselectedWebRTChub)
{
	if(meetingUUID == lastMeetingUUIDwaitingForOthers && $("#bottomMenuWaitingForOthers").is(":visible"))
	   return this.activateCorner()
	   
	lastMeetingUUIDwaitingForOthers = meetingUUID
	
    let meetObj = meetingsUUIDtoObject.get(meetingUUID)	
	let sp = "<table class='wm WAITINGFORMYWEBRTC_TD_"+meetingUUID+"' style='max-width:100%;width:100%;height:72px;text-align:center;padding:1em;overflow:hidden;background-color:#fff;margin:2px;align-self:center;vertical-align:top'><tr class='wm'>"
	      + "<td class='wm' style='height:72px;text-align:center;vertical-align:middle'>"
	      
	   	sp += " <nobr style='vertical-align:middle'>" + myWebRTChub.meetingLinksHTML("", meetingUUID, "") + "</nobr>" 

	   if(windowWidth() > 1000)     
	      sp += " &nbsp; <b class='messageWaitingForOthers_"+meetingUUID+"' style='color:#080;font-size:90%'>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[meetObj.emailsHosts.size == 0 ? 0 : 60])+"</b> &nbsp; "
	   if(!loggedIn())
		{
		sp += " &nbsp; <select class='wm hideWhenLogin' onChange='myWebRTChub.loginAsHost(this.value)' style='width:14em'><option value=''>"+TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[57])+"</option>"		
		sp += "<option value=''>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[58]) + "</option>"
		for(let [email, value] of meetObj.emailsHosts)
		   sp += "<option>" + email + "</option>"
		sp += "</select> &nbsp; "			
		}
		else if(meetObj.emailsHosts.get(nomeUtilizador) !== undefined)
			this.actionAfterBecomingHost()
	
		 //s += "<button onClick='myWebRTChub.changedZoomModeForFaceWebRTChub(\"auto\")'>TRY TRACKING</button>"
	
	sp += "</td>"
	
	if(isInLocalhost)
	   sp += "<td><button onClick='myWebRTChub.activateCorner(\"peersBottomRight\");$(\"#myLinkToOtherPeers\").val(\"https://storage.googleapis.com/cdniverse/pdf/CHUSJ_USE_CASES.pdf\");myWebRTChub.verifyURLlinkChanged()'>SET PDF file</button></td>"

	 sp += "</tr></table>"

$("#bottomMenuWaitingForOthers").html(sp)
this.activateCorner("bottomMenuWaitingForOthers")
	

 }	
//---------------------------------------------------
createWebRTChubDIV(meetingUUID, linkORadvancedParamJSON = "", username)
{

if($("#divEmcopassingAll_" + meetingUUID).length == 1)
  return

let first = numMeetingsGlobal == 0

numMeetingsGlobal++	

let meetObj = meetingsUUIDtoObject.get(meetingUUID) || {}
meetObj.meetingUUID = meetingUUID
meetObj.linkORadvancedParamJSON =  decodeURIComponent(linkORadvancedParamJSON)
meetingsUUIDtoObject.set(meetingUUID, meetObj)
meetObj.notYetUsable = undefined
meetObj.disabled = false

meetingIDselectedWebRTChub = meetingUUID

meetObj.numLocalUsersInMeeting = 0
meetObj.number = nextNumberForMeeting
meetObj.name = "M" + meetObj.number

meetObj.title = meetObj.title || ""
meetObj.emailsHosts = new Map() // undefined = not host   false = host but not logged in   channelName_uuid = host and has already final channelName
meetObj.channelOriginal = registerChannelForUUIDpeers[meetingUUID]
meetObj.makeConnectionALREADY = []
meetObj.startedConnectionALREADY = []
meetObj.completeConnectionALREADY = []
meetObj.sent_fromUUID_lessThan_myUUID_ALREADY = []

meetObj.audioContext = new (window.AudioContext || window.webkitAudioContext)()

meetObj.emptyMediaStream = undefined

meetObj.simplePeersObjects = new Map()


let pos = meetingUUID.indexOf("HOSTS")
if(pos != -1)
{
	let emails = meetingUUID.slice(pos + 5, meetingUUID.length - 8) //8 for CRC32
	while(emails.length > 0)
	{
	pos = emails.indexOf('_')
	let numberW = parseInt(emails.slice(0, pos))
	emails = emails.slice(pos + 1)
	pos = emails.indexOf('_')	
	let numberW2 = parseInt(emails.slice(0, pos))
	emails = emails.slice(pos + 1)
	let email = emails.slice(0, numberW)
	emails = emails.slice(numberW)	
	email = email.slice(0, numberW2) + "@" + email.slice(numberW2)
	meetObj.emailsHosts.set(replaceAll(email,"_-_", "."), false);
	}	
}

meetObj.videoActive = peersVideoActive
meetObj.cameraActive = true
meetObj.microphoneActive = true 
meetObj.speakersActive = peersSpeakersActive 

meetObj.spareCanvas = []
meetObj.spareVideos = []
meetObj.spareTracks = []
meetObj.globalTracksToSend = []

nextNumberForMeeting++


let arr = $(".inputWithOpenBrowserLink")
meetObj.fullLink = meetObj.fullLink || decodeURIComponent(nextFullLinkGlobal || arr.attr("fullLink"))
nextFullLinkGlobal = undefined
arr.removeClass("inputWithOpenBrowserLink")
let object = meetingUuid_later[meetingUUID]
if(object)
	meetObj.username = object.username_later
meetObj.bkColor = meetObj.number == 1 ? "#fff" : kellyColor(meetObj.number - 2)
meetObj.inkColor = getContrastColor(meetObj.bkColor)

    let s = 
       "<div class='divEmcopassing_meetings separate_subDivUnderDIVfor3D' id='divEmcopassingAll_"+meetingUUID+"' onClick='myWebRTChub.clickedOnDivEmcopassingAll(\""+meetingUUID+"\", event, this)' style='display:flex;align-items:center;justify-content: center;flex-grow: 1;flex-basis: 0;background-color:"+meetObj.bkColor+";vertical-align:bottom;width:100%;height:100%;align-items:center;overflow:visible;background-color:#fff'>"
//	    + "<div class='' style='width:100%;height:100%'>"
	    + "<div class='divEmcopassingAll_HIDDEN_"+meetingUUID+"' style='pointer-events:none;width:100%;height:100%;display:grid;position:var(--fixed_when_in_3D);margin:0;place-items:center center;min-height:99%;'>"
			+ "<div class='divEmcopassingAll_HIDDEN_"+meetingUUID+"' id='divEmcopassingAll_INSIDE"+meetingUUID+"' style='width:100%;max-height:100%'>"
//  	        + "<div class='talkisi_instant' id='talkisi_instant_"+meetingUUID+"' style='display:inline-table;vertical-align: top;'></div>"

if(!meetingUUIDtoLocalUserInvited.get(meetingUUID))
  if(!meetObj.extraParameters || meetObj.extraParameters.indexOf("no_show_waiting_for_others") == -1)
  	setTimeout(function(){myWebRTChub.showBottomMenuWaitingForOthers(meetingUUID)}, 10)

    let shortLink = meetObj.shortLink || myWebRTChub.fullLinkFromMeetObjFullLink(meetObj)
   	
	s += "</div></div>"
		+ "<div class='onlyShowIn3D'" + (isIn3D?"":" style='display:none'")+">"
		+ "<br>" + this.titleWithBackGround(meetingUUID, "20px")
		+ "<br><br><button class='webrtchub_button_to_go_to_place' onClick='myWebRTChub.showMeetingIn3Davatar(\""+ meetingUUID +"\")' style='width:4em;height:2.5em;font-size:30px;background-color:#00f;color:#fff'>avatar</button>"
		+ "<br><br>"
		+ "<button class='webrtchub_button_to_go_to_place' onClick='myWebRTChub.showMeetingIn3Dplace(\""+ meetingUUID +"\")' style='width:4em;height:2.5em;font-size:30px'>place</button>"
		+ "<br><br>"
		+ "<button class='webrtchub_button_to_go_to_place' onClick='copyToClipboard(`" + encodeURIComponent(shortLink) + "`, undefined, true)' style='width:4em;height:1.5em;font-size:30px;background-color:#f00;color:#fff'>link</button>"
		+ "<br>&nbsp;</div>"
		+"</div>"

     const divEmcopassingPAGE = $("#divEmcopassingPAGE_" + meetingUUID)[0]
	 divEmcopassingPAGE.insertAdjacentHTML("beforeend", s)

    s =  "<table class='buttonsOfEachMeeting_ALL' id='buttonsOfEachMeeting_"+meetingUUID+"' onClick='event.stopPropagation();myWebRTChub.enableOnlyThisMeeting(\""+meetingUUID+"\")' style='user-select:none;background-color:"+meetObj.bkColor+";cursor:pointer;margin:2px' " + attributeWithTranslation("title", TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[76])) +"><tr><td>"
	+ "<b style='color:"+meetObj.inkColor+"'>" + meetObj.number + "</b> <input class='wm' id='globalMeetingCheckbox_"+meetingUUID+"' onClick='event.stopPropagation();myWebRTChub.enableNotDisableMeeting(\""+meetingUUID+"\", this.checked)' type='checkbox' checked>"
	+ " <b class='mywebrtc_hide_whenNoSpaceBottomBar' "+(!showingWhenNoSpaceBottomBar ? "style='display:none'" : "")+">" 
	+ " " + this.buttonSpeakersOfMeeting(meetingUUID)
	+ " <nobr>" + this.buttonCameraOfMeeting(meetingUUID)
	+ " " + this.buttonMicrophoneOfMeeting(meetingUUID)
	+ "</nobr></b></td></tr></table>"

	$("#meetingsSelectionTD")[0].insertAdjacentHTML("beforeend",s)
	if(numMeetingsGlobal > 1)
		$("#meetingsSelectionTD").show() //once shown never hides again


this.selectMeetObjSelectedWebRTChub(meetingUUID)
    

nogoLinkEditor.revertAndApplyDefault(meetingUUID, true)	

const divName = "webrtchub_landing_page_" + meetingUUID.replaceAll("-", "")
evalForClosingNextDiv(divName, "")
removeOneOfTheDIVSbyID(divName)

this.arrangeBottomBarWithEachMeeting()

let localUser = this.addLocalUser(username, meetingUUID, undefined, 1)
myWebRTChub.showFullBottomBar()

myWebRTChub.addGlobalAudioVideoStream(meetingUUID, true, undefined, undefined, undefined, undefined, localUser) //not to use addGlobalAudioVideoStream
recomputeScrollElementSize()	




//initiateNoGoLinkEditor(meetObj)

if(typeof afterMyWebRTChubInitialisationDoThis === "function")
	afterMyWebRTChubInitialisationDoThis(meetingUUID)
	
this.refreshShowMeetingLinksAndPeers()

if(isIn3D)
  {
	setCameraOnObject(undefined, places.get(myWebRTChub.orderOfMeeting(meetObj) + ":151:U"))
	placeDistancesOfActiveObject(undefined, milisecondsMoveCamera)
  }
	
//myWebRTChub.resizeElementsWithPeersParticipant(undefined)
	
subtleGenerateKey()
  .then((keyPair) => {
		meetObj.keyPairKeepPrivateSendPublic = keyPair //others encrypt and send to me
		subtleExportKey(keyPair.publicKey)
			.then((publicKeyJWK) =>
			{
				meetObj.keyKeepPrivateSendPublicJWK = replaceCharsForInsideQuotes(JSON.stringify(publicKeyJWK))
			})
			
    })

this.call_mapOfFunctionCallsWhenMeetingsChange()
	
}
//---------------------------------------------------
call_mapOfFunctionCallsWhenMeetingsChange()
{
for(let [index, functionCall] of mapOfFunctionCallsWhenMeetingsChange)
	functionCall(index)
}
//---------------------------------------------------
loginAsHost(email)
{

if(email)
{
onlyAcceptThisDefaultLoginCreate = true
defaultLoginCreate = email
}
	
changeToThisDIVidAfterLogin="typesDivsSelect(undefined, \""+currentDIVid()+"\"); myWebRTChub.actionAfterBecomingHost()"
pageLogin()


}
//---------------------------------------------------
atLeastHostIsOneOfTheMeetings()
{
for(let [meetingUUID, meetObj] of meetingsUUIDtoObject)
  if(meetObj.notYetUsable)
		continue
  else if(meetObj.emailsHosts)
    if(meetObj.emailsHosts.get(nomeUtilizador))
	  return true
return false	
}
//---------------------------------------------------
actionAfterBecomingHost()
{

for(let [meetingUUID, meetObj] of meetingsUUIDtoObject)
  if(!meetObj.notYetUsable)
   if(meetObj.emailsHosts.get(nomeUtilizador) === false)
	try
	{
	messagePopupIfZero++
	localSubmit(WEBRTC_GET_CHANNEL_CREATED_BY_HOST, undefined, undefined, registerChannelForUUIDpeers[meetingUUID], meetingUUID) //fails if not logged in and no permission
	}
	finally
	{
	messagePopupIfZero--
	}	
	

}
//---------------------------------------------------
hostRequestOthersMakeConnection(meetingUUID)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)

if(!meetObj || meetObj.channelCreatedByHost)
  return

this.sendMakeConnectionMessage(meetingUUID)
}
//---------------------------------------------------
arrangeBottomBarWithEachMeeting()
{
//one shown show always showHideSelector(".buttonsOfEachMeeting_ALL", numMeetingsGlobal > 1)
if(numMeetingsGlobal == 1)
  for(let [meetUUID, meetObj] of meetingsUUIDtoObject)
	if(!meetObj.notYetUsable)
	  this.enableNotDisableMeeting(meetUUID, true)
}
//---------------------------------------------------
closeStreamOfsrcObject(elementWithSrcObject)
{
	if(!elementWithSrcObject)
	  this.closeStream(elementWithSrcObject)
}
//---------------------------------------------------
closeStreamOfdeviceID(meetingUUID, deviceID)
{
	if(!deviceID)
		return
	
	let streamAndUses = mapVideoIDtoOrigStream.get(deviceID)
	if(!streamAndUses)
	  return
    streamAndUses.uses.delete(meetingUUID)
	if(streamAndUses.uses.size === 0)
		{
		  mapVideoIDtoOrigStream.delete(deviceID)
		  this.closeStream(streamAndUses.stream)
		}
		
}
//---------------------------------------------------
addStreamToElement(element, stream)
{
	if(stream.elementsThatUseIt === undefined)
	   stream.elementsThatUseIt = []
	element.srcObject = stream 
	stream.elementsThatUseIt.push(element)
}
//---------------------------------------------------
closeStream(elementWithStreamORstream)
{
	
	if(!elementWithStreamORstream)
		return
	
	let stream
	if(MediaStream.prototype.isPrototypeOf(elementWithStreamORstream))
    {
	stream = elementWithStreamORstream
	elementWithStreamORstream = undefined
   }
   else
     stream = 	elementWithStreamORstream.srcObject
	
	if(!stream)
	  return

		if(stream.elementsThatUseIt)
		  for(let i = stream.elementsThatUseIt.length - 1; i >= 0; i--)
		  {
			let element = stream.elementsThatUseIt[i]
			if(elementWithStreamORstream == element || !elementWithStreamORstream)
		  		 {
				element.srcObject = undefined
				stream.elementsThatUseIt.splice(i, 1)
				} 
		  }

	const tracks = stream.getTracks()
	if(!stream.elementsThatUseIt || !stream.elementsThatUseIt.length)
	  for(let track of tracks)
        if (track.readyState == 'live')
        	{
			track.enabled = false
			stream.removeTrack(track)
			//track.stop()  //it will be reused in future peerUser!!!  
			}
			
}
//---------------------------------------------------
closeMyWebRTCdiv()
{
	while(meetingsUUIDtoObject.size > 0)
	    closeThisMeetingID(meetingIDselectedWebRTChub)
	
	
	if(closeMyWebRTCdivIfZero > 0)
	  return
	  
    try
	{
	closeMyWebRTCdivIfZero++

	this.exit()

    this.closeStreamOfsrcObject(screenStreamToCopyToCanvas)

	for(let [meetingUUID, meetObj] of meetingsUUIDtoObject)
	  if(!meetObj.notYetUsable)
		initiateNoGoLinkEditor(meetObj) //reset variables cleaning up
	
	while(videoStreamToCopyToCanvas.size > 0)
	  myWebRTChub.removeVideoStream(videoStreamToCopyToCanvas.keys().next().value, true) //first key
	
	if(memorySelectedTypeDiv.length == 1)
	  {
		  confirmBeforeUnload = false
		  location.reload()
	  }
	else
	  {
		forUseByWebRTChub.style.display = "none"
		//no sense, removing meeting should be enough  initiateVarsMyWebRTChub()
		removeOneOfTheDIVSbyID(webrtcDivName(meetingUUID))
	  }
   }
catch(e)
  {
	
  }
closeMyWebRTCdivIfZero--
}
//---------------------------------------------------
meetingInThisPlace3D(numPlace3D)
{
	return meetingsUUIDtoObject.get(myWebRTChub.numPlace3DtoMeetingUUID(numPlace3D))
}
//---------------------------------------------------
toCallMoveNotCopyObjectFromNotToPlace(command, toIDSplace, divName, object3d, moveNotCopy, fromNotTo, fromIDSplace, thisData)
{
	
	const justToInform = fromIDSplace == toIDSplace
	
	const IDSplace = fromNotTo ? fromIDSplace : toIDSplace
	
	let meetObj = myWebRTChub.meetingInThisPlace3D(IDSplace)
	if(!meetObj)
		return true //allow whatever they want

	if(command == "CAN_STORE")
	  return !meetObj.mapFromUniqueUUIDtoObject3Ddivs 
         || !meetObj.mapFromUniqueUUIDtoObject3Ddivs.get(object3d.uniqueUUID)
	 
    if(command == "MOVE_NOT_COPY")
	{
	
	if(justToInform)
	  {
	  object3DmustHaveUniqueID(object3d)
	  if(!meetObj.mapFromUniqueUUIDtoObject3Ddivs)
	     meetObj.mapFromUniqueUUIDtoObject3Ddivs = new Map()
	  if(!fromNotTo)
	    {
		
		 if(undefined === meetObj.mapFromUniqueUUIDtoObject3Ddivs.get(object3d.uniqueUUID)) //else it is receiving the object
	       if(meetObj.mapFromUniqueUUIDtoObject3Ddivs.set(object3d.uniqueUUID, object3d))
              if(UseFirebaseToShareObjectsNotMessages)
				 sendFireBaseMessageDIRECTLY(meetObj.channelKey + "/DIVS/uniqueUUID_" + object3d.uniqueUUID 
					, myUUID(meetObj) + " " + divName + " " + encodeURIComponent(object3d.uniqueUUID + " " + thisData)
				, undefined, false)
		      else
				myWebRTChub.sendCommandToPeers(undefined, "ADDED_DIV_TO_PLACE", object3d.uniqueUUID + " " + divName + " " + thisData, meetObj.meetingUUID)
	   	}	
     else if(moveNotCopy)
			myWebRTChub.removeThisUniqueUUIDfromMeeting(object3d.uniqueUUID, meetObj.meetingUUID)
   	   		
	   myWebRTChub.refreshInformationAboutDIVSinMeeting(meetObj.meetingUUID)
       return true
	  }
	
	if(fromNotTo)
	  return true
	
	if(!fromNotTo && thisData)
	  return true

	  
	 showMessageErrorOnSOSforDuration("object has no useful data", 2000)
	return false //should give a reason why if it blocks and does nothing with it.
	}//command MOVE_NOT_COPY

return true //any other commands (to allow whatever they want to do)

}
//---------------------------------------------------
removeThisUniqueUUIDfromMeeting(uniqueUUID, meetingUUID)
{
	let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	
	if(meetObj.mapFromUniqueUUIDtoObject3Ddivs.delete(uniqueUUID))
    {
	  myWebRTChub.refreshInformationAboutDIVSinMeeting(meetingUUID)
      if(UseFirebaseToShareObjectsNotMessages)
		sendFireBaseMessageDeleteChannelKeyDIRECTLY(meetObj.channelKey + "/DIVS/uniqueUUID_" + uniqueUUID)
	  else
		myWebRTChub.sendCommandToPeers(undefined, "REMOVED_DIV_FROM_PLACE", uniqueUUID, meetingUUID)
	}
}
//---------------------------------------------------
processDivShared(meetingUUID, fromUUID, encodedData)
{
//old format
return 	(processingThisOnFirebaseMessagePath + "/" + processingThisOnFirebaseMessageNode)
}
//---------------------------------------------------------
processNewDivObject(meetingUUID, divName, parameters, o, processAlways) //o was from sending in messages
{
	let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	
	let lastPos = 0

	let pos = parameters.indexOf(" ", lastPos)
	let uniqueUUID = parameters.slice(0, pos)
	lastPos = pos + 1

	pos = parameters.indexOf(" ", lastPos)
	let numChars = parseInt(parameters.slice(lastPos, pos))
	if(isNaN(numChars)) //bad format
	  return sendFireBaseMessageDeleteChannelKeyDIRECTLY(meetObj.channelKey + "/DIVS/uniqueUUID_" + uniqueUUID)
		
	lastPos = pos + 1

	let name = parameters.slice(lastPos, lastPos + numChars)

	lastPos += numChars
	
	let thisData =  parameters.slice(lastPos)

	if(!meetObj.mapFromUniqueUUIDtoObject3Ddivs)
      meetObj.mapFromUniqueUUIDtoObject3Ddivs = new Map()
	meetObj.mapFromUniqueUUIDtoObject3Ddivs.set(uniqueUUID, name) //indicates it is waiting	  
	
	if(!isIn3D && !processAlways)
	{
	if(!meetObj.mapNotProcessedNewDivObject)
		meetObj.mapNotProcessedNewDivObject = new Map()
	meetObj.mapNotProcessedNewDivObject.set(uniqueUUID, function(){myWebRTChub.processNewDivObject(meetingUUID, divName, parameters, o, true)}) 	
	myWebRTChub.refreshInformationAboutDIVSinMeeting(meetingUUID)
	return
	}
	
	if(pos == -1) //never happens if not o
	        return myWebRTChub.sendCommandToPeers(o, "GET_DIV_UNIQUE_UUID_THIS_DATA", uniqueUUID)
	        	
	let divNameCopy = uniqueDivNameItselfOrCopy(divName)
	try
	{
	uniqueDivNameItselfOrCopyWhenZero++
	  	 
	let data = {divName: divNameCopy, 
			IDSplace: meetObj.numPlace3D+ ":151:U",
		    uniqueUUID: uniqueUUID,
			name: name
			}

	mapCheckNewObject3dWithUniqueUUIDorDivName.set(meetObj.meetingUUID, checkNewObject3dOrDivNameObject3d)
	if(!meetObj.numWaitingAtMapCheckNewObject)
	  meetObj.numWaitingAtMapCheckNewObject = 1
	else
	   meetObj.numWaitingAtMapCheckNewObject++
	
	addMapingsUniqueUUIDWithDivName(uniqueUUID, divNameCopy)

	loadUmniverseFiles(function(rri)
	{
		loaded3Dinfo.set(data.divName, data)
		setDataOfThisDivName(rri, data, thisData)
		arrangeDivsInThisPlace(rri, data.IDSplace, true)
		myWebRTChub.refreshInformationAboutDIVSinMeeting(meetingUUID)
	}
	, uniqueUUID, true)

	}
	finally
	{
	  uniqueDivNameItselfOrCopyWhenZero--
	}
}			  
//---------------------------------------------------
refreshInformationAboutDIVSinMeeting(meetingUUID, doNotCallRefreshInformationAboutAllMeetings)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)

if(!doNotCallRefreshInformationAboutAllMeetings)
   myWebRTChub.refreshInformationAboutAllMeetings(true)
}
//---------------------------------------------------
refreshInformationAboutAllMeetings(doNotCallRefreshInformationAboutDIVSinMeeting)
{
let atLeastOne
for(let [meetingUUID, meetObj] of meetingsUUIDtoObject)
  if(!meetObj.notYetUsable && !meetObj.disabled)
	{
		let s = "<table style='width:100%'><tr>"
		if(!doNotCallRefreshInformationAboutDIVSinMeeting)	
		  myWebRTChub.refreshInformationAboutDIVSinMeeting(meetingUUID, true)

		let numFiles = 0
		if(meetObj.mapFromUniqueUUIDtoObject3Ddivs)
		  numFiles =  meetObj.mapFromUniqueUUIDtoObject3Ddivs.size
		if(numFiles == 0)
			continue
		atLeastOne = true
		s += "<td><select onChange=myWebRTChub.selectedMeetingUUIDdivUniqueUUID(\"" + meetingUUID + "\",this)>"
		  + "<option value='first'><b class='text_title_meeting_"+meetingUUID+"'>"+ (meetObj.title || meetObj.name) + "</b>" + (numFiles ? " (" + numFiles + " files)" : "") + "</option>"
		for(let [uniqueUUID, object3d] of meetObj.mapFromUniqueUUIDtoObject3Ddivs)
			s += "<option value='"+ uniqueUUID +"'>" + (isString(object3d) ? object3d : object3d.name) + "</option>"			
		s += "<option disabled>-----------</option>"
		for(let [uniqueUUID, object3d] of meetObj.mapFromUniqueUUIDtoObject3Ddivs)
			s += "<option value='REMOVE_* "+ uniqueUUID +"'>REMOVE " + (isString(object3d) ? object3d : object3d.name) + "</option>"			
		s += "</select></td>"
	s += "</tr></table>"
	addTopBarToDiv(webrtcDivName(meetingUUID), atLeastOne ? s : " ")
	}




}
//---------------------------------------------------
selectedMeetingUUIDdivUniqueUUID(meetingUUID, select)
{
	let object3d_uniqueUUID = select.value
	if(object3d_uniqueUUID === "first")
	  return
	let viewNotRemove = true
    if(object3d_uniqueUUID.startsWith("REMOVE_* "))
	{
	viewNotRemove = false	
	object3d_uniqueUUID = object3d_uniqueUUID.slice("REMOVE_* ".length)
	}

	select.value = "first"
	
	let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	let object3d = meetObj.mapFromUniqueUUIDtoObject3Ddivs.get(object3d_uniqueUUID)
	let divName = mapFromObject3dUniqueUUIDtoDivName.get(object3d_uniqueUUID) //may be undefined

	if(!viewNotRemove)
	{
		if(!confirm("Remove object from meeting?"))
		  return
		closeCurrentDiv(divName, true)
		myWebRTChub.removeThisUniqueUUIDfromMeeting(object3d_uniqueUUID, meetingUUID)

		if(mapFromObject3dUniqueUUIDtoDivName)
			mapFromObject3dUniqueUUIDtoDivName.delete(object3d_uniqueUUID)
		if(meetObj.mapFromUniqueUUIDtoObject3Ddivs)
			meetObj.mapFromUniqueUUIDtoObject3Ddivs.delete(object3d_uniqueUUID)
	 	if(meetObj.mapNotProcessedNewDivObject)
			meetObj.mapNotProcessedNewDivObject.delete(object3d_uniqueUUID)
	}
	else if(isString(object3d))
	{
	 let thisCall = meetObj.mapNotProcessedNewDivObject.get(object3d_uniqueUUID)
	 if(typeof thisCall == "function")
		{
	 	thisCall()
	    if(isIn3D)
	 		meetObj.mapNotProcessedNewDivObject.delete(object3d_uniqueUUID)
		}
	  else
        typesDivsSelect(undefined, divName)
	 return
	}
	
	typesDivsSelect(undefined, divName)
	
}
//---------------------------------------------------
manageSeparateAndSubDivUnderDIVfor3D(separation, subdiv, separateTotal, subDivTotal, nSeparate, nTotal, nSubDiv, subDivInSeparationTotal)
{
let result = {}
let separateNOTsubdiv = nSubDiv === undefined
result.staticRelationToParent = true

let meetingUUID = separation.id.slice("divEmcopassingAll_".length)
let meetObj = meetingsUUIDtoObject.get(meetingUUID)

result.squareNumber = meetObj.numPlace3D

if(separateNOTsubdiv)
  {
	result.squareNumber = 5
	
	if(meetObj.mapNotProcessedNewDivObject)
	{
	 let mapNotProcessed = meetObj.mapNotProcessedNewDivObject
	 meetObj.mapNotProcessedNewDivObject = undefined
	 for(let [uniqueUUID, callThis] of mapNotProcessed)
			setTimeout(function(){callThis()}, 10)
	}
		
	myWebRTChub.setMeetingInItsPlace(meetObj, separation.style.backgroundImage)
	
  }	
else
  {
	result.y = 300
	result.z = -1
	result.allHaveThisTopHeight = 1	//arranged by arrangePlace	
	result.scaleX = 14
	result.scaleY = 0.2
	result.scaleZ = 16
  }
  

return result
}
//---------------------------------------------------
setMeetingInItsPlace(meetObj, backgroundImage)
{
	let meetingUUID = meetObj.meetingUUID
	
	if(!backgroundImage)
	{
		backgroundImage = $("#divEmcopassingAll_" + meetingUUID).css("background-image")
	}   
		
	let placeIDS = myWebRTChub.orderOfMeeting(meetObj, true) + ":151:U"

	divNameAncestorOfSubDiv_to_IDSplace.set(webrtcDivName(meetingUUID), placeIDS)

    if(meetObj.mapFromUniqueUUIDtoObject3Ddivs)
	   for (let [uniqueUUID, object3d] of meetObj.mapFromUniqueUUIDtoObject3Ddivs)
		 if(typeof object3d == "object")     
 		   joinToPlace(object3d, placeIDS)
		 else
	       joinTapalifeDivToUmniverseWhenLoaded(undefined, mapFromObject3dUniqueUUIDtoDivName.get(uniqueUUID), placeIDS, true)

	 let extraStylesMap = new Map()
	 extraStylesMap.set("background-position", "50% 0%")

	 setImageIn3Dplace(placeIDS, backgroundImage, "100% 92%", myWebRTChub.toCallMoveNotCopyObjectFromNotToPlace, extraStylesMap)

		let s = "<div class='wm cleanToShowFloor' id='place_originalTexts_"+ numberUnderscoreOwnerOfPlace3D(placeIDS) +"' style='font-size:16px;position:fixed;bottom:0px;width:100%'><table style='width:100%'>"

	    s +="<tr><td colspan=2><table class='BORDER_RADIUS_10' style='background-color:rgba(255,255,255, 0.9)' title='not streaming'>"
	    	s +="<tr><td class='wm'>you</td><td class='wm'> &nbsp; availability &nbsp; </td><td class='wm'>call</td></tr>"
	    if(meetObj.title == " work ")
	    	s +=  myWebRTChub.yourAvailabilityCall(0, "boss", -1)
                + myWebRTChub.yourAvailabilityCall(0, "Elisabeth B.", 0)
	    if(meetObj.title == " family ")
	    	s +=  myWebRTChub.yourAvailabilityCall(1, "Joana", -1)
                + myWebRTChub.yourAvailabilityCall(1, "Ana Maria", 0)
                + myWebRTChub.yourAvailabilityCall(1, "Stephanie", 1)
		 s += "</table></td></tr>"
		
		s += "<tr style='height:160px'><td colspan=2></td></tr>"
		
	    let shortLink = meetObj.shortLink || myWebRTChub.fullLinkFromMeetObjFullLink(meetObj)
		const divName = webrtcDivName(meetingUUID)
   
	    s += "<tr><td class='wm' style='padding-left:5px;vertical-align:bottom'>" +  myWebRTChub.titleWithBackGround(meetingUUID, "30px") + "</font></td>"
		s += "<td class='wm' style='text-align:right'><b style='font-size:30px;background-color:#fff'>"
		  +" <img onClick=\"event.stopPropagation();showUrlQRcodeOf(`"+encodeURIComponent(shortLink)+"`, undefined, undefined, undefined, undefined, true, true)\" src='"+ cdniverse +"images/8723136_link_icon.svg' style='height:30px'>" 
          + myWebRTChub.buttonsScreenShareAndSecondCameraAndOthers(meetingUUID, false) 
          + "<img onClick='event.stopPropagation();event.preventDefault();myWebRTChub.menuMoveMeetingToPlace(\"" + meetingUUID + "\")' src='"+ cdniverse +"images/umniverse/nine_squares_black.svg' style='width:28px;height:30px'>" 
		  + "<br><nobr>"
		  + "<b class='show_in_left_side_2D_"+divName+"' onClick='event.stopPropagation();viewDivNameIn2DonTheSideof3D(0,\""+ divName +"\", undefined, true)'><table class='wm table_3_columns_rotate' border=1 title='left bar' style='cursor:pointer;background-color:#fff;vertical-align:middle;width:30px;height:24px'><tr><td style='width:33%;background-color:black'></td><td></td></tr></table></b>"
		     + "<b class='return_to_3D_left_side_2D_" + divName + "' onclick='event.stopPropagation();unviewDivNameIn2DonTheSideof3D(\""+ divName +"\")' style='display:none;vertical-align:text-bottom;cursor:pointer;'>X</b>"
		  + " <b class='wm show_in_right_side_2D_" + divName + "' onClick='event.stopPropagation();viewDivNameIn2DonTheSideof3D(1,\""+ divName +"\", undefined, true)'><table class='wm table_3_columns_rotate' border=1 title='left bar' style='cursor:pointer;background-color:#fff;vertical-align:middle;width:30px;height:24px'><tr><td></td><td style='width:33%;background-color:black'></td></tr></table></b>"
		     + "<b class='return_to_3D_right_side_2D_" + divName + "' onclick='event.stopPropagation();unviewDivNameIn2DonTheSideof3D(\""+ divName +"\")' style='display:none;vertical-align:text-bottom;cursor:pointer;'>X</b>"
		  + "<b onClick='event.stopPropagation();toggle3D(undefined,false); typesDivsSelect(undefined, \"webrtchub_main\")' style='font-size:80%;cursor:pointer;' title='2D'>&nbsp;2D&nbsp;</b>"
  		  + "<b style='line-height:1.1em'>" + getIconArrangePlaceString(placeIDS, 0.5) 
		  + "</b></nobr></td>"
	      +"</tr></table></div>"
	    
		setHTMLin3Dplace(placeIDS, s)
		
		resizeSidesOf2Dof3D() //to orientate table_3_columns_rotate
}
//---------------------------------------------------
redMinusYellowZeroGreenPlusToColor(redMinusYellowZeroGreenPlus)
{
switch(redMinusYellowZeroGreenPlus)
{
	case -1: return "#800"
	case 0: return "#dd0"
	case 1: return "#0a0"
	default: return "#ddd"
}	
	
}
//---------------------------------------------------
yourAvailabilityCall(yourRmYzGp, name, callRmYzGp)
{
	return "<tr><td><div style='height:20px;width:20px;background-color:"+this.redMinusYellowZeroGreenPlusToColor(yourRmYzGp)+";border-radius: 50%'></div></td><td class='wm'>" + name + "</td><td><div style='height:20px;width:20px;background-color:"+this.redMinusYellowZeroGreenPlusToColor(callRmYzGp)+";border-radius: 50%'></div></td></tr>"
}
//---------------------------------------------------
menuSettingsMeeting(meetingUUID)
{
	
	if(dismissPopup1("menuSettingsMeeting"))
		return

    let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	
	let element = getPopup1("menuSettingsMeeting")
	element.style.color = "#000"
	element.style.width = ""
	element.style.height = ""
	element.style.backgroundColor = "#fff"
	element.classList.add("belongs_to_meeting_" + meetingUUID)
	
	let close = "dismissPopup1(`menuSettingsMeeting`)"	

	 let s = "<table onClick='"+close+"' style='display:table;width:100%'><tr><td><b>Meeting settings</b></td><td style='width:40px'><b style='cursor:pointer; color:#800'>X</b></td></tr></table>"

    s += "<input type='text'  onKeyUp='if(event.keyCode == 13)clickNextButton(this)'  value='" + meetObj.title + "' placeHolder='title'> <button onClick='event.stopPropagation(); event.preventDefault();myWebRTChub.updateMenuSettingsMeeting(\""+meetingUUID+"\",previousSiblingTag(this, \"INPUT\").value);"+ close+"'>update</button>"
     
	$(element).html(s).show()
}
//---------------------------------------------------
updateMenuSettingsMeeting(meetingUUID, title)
{
    let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	if(title)
		{
	    meetObj.title = title
		$(".text_title_meeting_"+meetingUUID).html(title)
		}
		
}
//---------------------------------------------------
menuMoveMeetingToPlace(meetingUUID)
{
	if(dismissPopup1("menuMoveMeetingToPlace") 
		&& lastMeetingUUIDinMenuMoveMeetingToPlace == meetingUUID)
		return
    lastMeetingUUIDinMenuMoveMeetingToPlace = meetingUUID
 
    let meetObj = meetingsUUIDtoObject.get(meetingUUID)
	
	let element = getPopup1("menuMoveMeetingToPlace")
	element.style.color = "#000"
	element.style.width = ""
	element.style.height = ""
	element.style.backgroundColor = "#fff"
	element.classList.add("belongs_to_meeting_" + meetingUUID)
	
	let close = "dismissPopup1(`menuMoveMeetingToPlace`)"	
	let s = "<table onClick='"+close+"' style='display:table;width:100%'><tr><td><b>" + (meetObj.title) + "</b> move to</td><td style='width:40px'><b style='cursor:pointer; color:#800'>X</b></td></tr></table>"

	let menuMoveMeetingToPlaceBuildTableCell = function(place, color, imageURL, classes, style)
	  {

		  let objects = [...objectsThatCanBeMovedAndRearranged(place.objectsOnThisPlace)]
		  let numObjectsStr = objects.length == 0 ? "" : "<br>(" + objects.length + ")"

			let border
			if(meetObj.numPlace3D == place.numPlace)
			  border =  "border:3px solid #f00"
			else if(imageURL != "none" || objects.length)
			  border =  "border:1px solid #f00"
			else
			  border = "border:1px solid #000"
			  	
			return "class='wm " + classes +"' onClick='myWebRTChub.moveMeetingToThisPlace(\""+meetingUUID+"\","+place.numPlace+");" + close + "' style='"+border+";user-select:none;"+style+"'>"
		  	    + "<b>" + place.char +"</b>" + numObjectsStr
      } 

	s += cycleThroughVerticalAndHorizontaAccordingToInnerRotation(placesForMeetingsMap, undefined, menuMoveMeetingToPlaceBuildTableCell, undefined, undefined, undefined, true)	
     
	$(element).html(s).show()
}
//---------------------------------------------------
moveMeetingToThisPlace(meetingUUID, numPlace)
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)

if(meetObj.numPlace3D == numPlace)
  return showMessageOnSOSforDuration("already there", 2000)

let numPlaceBefore = meetObj.numPlace3D

let futureIDSplace = numPlace + ":151:U"
let place = places.get(futureIDSplace)

if(!place)
   return

const previousIDSplace = meetObj.numPlace3D + ":151:U"
const previousPlace = places.get(previousIDSplace)

if(place.elementImportant().style.backgroundImage != "")
  return showMessageOnSOSforDuration("already occupied", 2000)

let objects = objectsInThisPlace(futureIDSplace, true, true)

if(objects.length > 0)
  return showMessageErrorOnSOSforDuration(objects.length + " objects already there", 2000)


objects = [...objectsThatCanBeMovedAndRearranged(previousPlace.objectsOnThisPlace)]
for(let object3D of objects)
  setPlaceIDSonlyHere(undefined, object3D, futureIDSplace)

const typeID = GSiC.mapMyUniqueIDtoTypeID.get(type_groupOfPlacesFromBrowser)
for(let [baID, ba] of GSiC.mapBaIDsToBaseApp)
  if(ba.typeID === typeID)
  {
	if(ba.loadedPlaces && ba.loadedPlaces.has(previousIDSplace))
		{
			ba.loadedPlaces.delete(previousIDSplace)
			ba.loadedPlaces.set(futureIDSplace, place)
		}
	const cegp = GSiC.groupUUID_to_createEditGroupPlaces(ba.getGroupNameSpaceID())
	if(cegp && cegp.selected && cegp.selected.delete(previousPlace.numPlace))
	   cegp.selected.add(numPlace)
  }
	
removeMeetingFromPlace(meetObj, futureIDSplace)
meetObj.numPlace3D = numPlace

place.typeOfObjects3Darrangement = previousPlace.typeOfObjects3Darrangement
previousPlace.typeOfObjects3Darrangement = 1 //octogonally spaced

myWebRTChub.setMeetingInItsPlace(meetObj)

arrangeDivsInThisPlace(undefined, futureIDSplace, true)

GSiC.updateTransferDivForGroupOfPlaces(groupUUIDbeingEdited)

//treatSubDivUnderDIVfor3D(undefined, $(myGetElementByDIVid("webrtchub_main")).find(".tablesUnderDIVfor3D")[0], true, undefined, true)

}
//---------------------------------------------------
titleWithBackGround(meetingUUID, fontSize = "20px")
{
let meetObj = meetingsUUIDtoObject.get(meetingUUID)
return "<b onClick='event.stopPropagation();event.preventDefault();myWebRTChub.menuSettingsMeeting(\""+ meetingUUID+ "\")' style='font-size:"+fontSize+";line-height:33px;background-color:#fff;vertical-align:text-bottom;padding:0px 5px'><b class='text_title_meeting_"+meetingUUID+"' >"+(meetObj.title || meetObj.name || "no title") + "</b></b>"
}
//---------------------------------------------------
buttonsScreenShareAndSecondCameraAndOthers(meetingUUID = "", onlyVisibleIn2D)
{
	let s = ""
	
	let classStr = onlyVisibleIn2D ? " onlyShowIn2D " : ""

	if(!isMobile)	
	   s += "<img class='" + classStr + "mywebrtc_hide_whenNoSpaceBottomBar' onClick='event.stopPropagation();myWebRTChub.startScreenShare(\""+meetingUUID+"\")' " + attributeWithTranslation("title", TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[21]))+" src='"+ cdniverse +"images/screen_share-black-18dp.svg' style='height:36px'>"
    s += "<img class='" + classStr + "mywebrtc_hide_whenNoSpaceBottomBar' onClick='event.stopPropagation();myWebRTChub.toggleSecondCameraShare(\""+meetingUUID+"\")' " + attributeWithTranslation("title", TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[47]))+" src='"+ cdniverse +"images/camera_enhance-black-18dp.svg' style='height:34px'>"
	return s
}	
//---------------------------------------------------
updateBottomBar(uuid)
{
let meetObj = meetingsUUIDtoObject.get(uuid)

if(nogoLinkEditor && !nogoLinkEditor.isReadyToUpdateBottomBar(meetObj))
	return setTimeout(function(){myWebRTChub.updateBottomBar(uuid)}, 50)

const divName = webrtcDivName(uuid)

	let s = "<div class='contentsAndNoHeight verticalCenter' id='divEmcopassingPAGE_"+ uuid +"' style='display:flex;flex-direction:column;height:100%'>" //flex:1 1 1em;flex-direction: column;height:100%;width:0px'>" //width:0px essential for healthy resizing!!!
				+ "</div>"

	$("#TLtranslateFromToTopMenuSendChatPeers").html(TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[66]))
	
	
	doNoAddVerticalCenterToNextDiv = true
	lastStyleForDIV = "overflow:hidden"
	let resultDiv = returnThisDIV(undefined, divName, "Video conference", "NOGO.LINK", s)
	s = ""
	//resultDiv.activeDiv.preferedPlaceFor3D = 2
	divWithWebRTChub = resultDiv.activeDiv
	resultDiv.activeDiv.children[0].in3DmustBeInDivsInBothTapalifeAndUmniverse = true
	resultDiv.activeDiv.manageSeparateAndSubDivUnderDIVfor3D = myWebRTChub.manageSeparateAndSubDivUnderDIVfor3D
	
	observer_webrtchub.observe(resultDiv.activeDiv)
	
	evalForNextDiv(divName, function(newID){enteringDIVwithPeersWebRTChub(uuid, newID)})
	evalForLeavingNextDiv(divName, "leavingDIVwithPeersWebRTChub(\""+uuid+"\")")
	
	evalForClosingNextDiv(divName, "closeThisMeetingID(\""+uuid+"\")")
	doNoAddVerticalCenterToNextDiv = false


if(alreadyInitializedInUpdateBottomBar)
{
  $("#forUseByWebRTChub").show() //hidden if deleted all meetings
  return false
}

alreadyInitializedInUpdateBottomBar = true		

observer_webrtchub.observe(globalSidePanel_vertical)

	
redButtonToReturnToVideoConference = "<button onClick='toggle3D(undefined, false);typesDivsSelect(undefined, \""+currentDIVid()+"\")' style='background-color:#800'><img src='"+cdniverse+"images/keyboard_return-white-18dp.svg' style='width:1.5em'></button>"

if($("#globalSidePanel_inside_top_vertical").length)
	return $("#forUseByWebRTChub").show()

$("#globalSidePanel_horizontal")[0].insertAdjacentHTML("afterbegin",
  `<div style='display:flex;max-height:140px'> 
	  <table class='wm' style='margin: -20px -15px;min-height:11em'>
        <tr><td style='width:1px'><img onClick='myWebRTChub.slideSwitchVerticalHorizontal()' src='https://storage.googleapis.com/cdniverse/images/open_in_full-black-18dp.svg' style='height:1em'>
        </td></tr>
        <tr><td><p style='transform:rotate(270deg);transform-origin:50% 50%'><b>video</b></p></td></tr>
        <tr><td style='width:1px'>`
		+`<b onClick='myWebRTChub.closeGlobalSidePanel()' style='color:red;cursor:pointer'>X</b>
		</td></tr>
      </table>
      <div id='globalSidePanel_inside_parent_horizontal' style='width:100%;left:20px;right:0px;top:0px;bottom:0px;overflow-y:auto;overflow-x:hidden;text-align:center'>
   		<div id='globalSidePanel_inside_top_horizontal' style='display:contents;vertical-align:middle;'>
   		</div>
        <div id='globalSidePanel_inside_horizontal' style='vertical-align:middle;left:20px;right:0px;top:0px;bottom:0px;overflow-y:auto;overflow-x:hidden;text-align:center'>
        </div>
      </div>
  </div>
	`)

globalSidePanel_vertical.insertAdjacentHTML("afterbegin",
  "<div id='globalSidePanel_inside' style='text-align:center;width:100%'>"
   + "<table style='width:100%;min-height:20px;margin:-6px 0px'><tr>"
      + "<td style='width:1px'><nobr><img onClick='myWebRTChub.slideSwitchVerticalHorizontal()' src='"+cdniverse+"images/open_in_full-black-18dp.svg' style='height:1em'></td>"
      + "<td><select onChange='webrtchub_numSideSize=parseInt(this.value);myWebRTChub.showGlobalSidePanel()' title='size'><option value=1>S</option><option value=2>M</option><option value=3>L</option><option value=4>XL</option></select>"
      + " <select onChange='webrtchub_numSideElements=parseInt(this.value);myWebRTChub.showGlobalSidePanel();resizeREALLY()' title='columns'><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select>"
      + "</td>"
      + "<td style='width:1px'><b onClick='myWebRTChub.closeGlobalSidePanel()' style='width:1px;color:red;cursor:pointer'><b>&nbsp;X&nbsp;</b></nobr></td>"
	  + "</tr></table>"
   + "<div id='globalSidePanel_inside_parent_vertical' style='width:100%;top:20px;bottom:0px;overflow-y:auto;overflow-x:hidden'>"
   + 	"<div id='globalSidePanel_inside_top_vertical' style='width:100%'>"
   + 	"</div>"
   + 	"<div id='globalSidePanel_inside_vertical' style='width:100%'>"
   + 	"</div>"
   + "</div>"
  )

s +="<div id='webRTChub_mainTableBottomBar_ID' style='display:none;width:100%;overflow:hidden'><table class='wm' style='width:100%;max-width:100%;height:100%'><tr class='wm' style='height:1%'>"	
		
		
		let src = cdniverse + "images/talkisi/question_mark.svg"
		$.get(src, function (data) 
					{
					    let xml = SVG_XML_cleanAndComplete(new XMLSerializer().serializeToString(data.documentElement))
					    questionRawData = xml
					})
		src = cdniverse + "images/iconfinder_link-rounded_4417094.svg"
		$.get(src, function (data) 
					{
					    let xml = SVG_XML_cleanAndComplete(new XMLSerializer().serializeToString(data.documentElement))
					    URLlinkRawData = xml
					})

    

s += "<td class='imageCell' id='showBottomSendToPeersTD' onClick='event.stopPropagation();if(event.target.offsetWidth > 200)myWebRTChub.activateCorner()' style='width:100%'>"

s += "<div class='sameSizeAsBottomBarWebRTChub' id='peersTopRight' style='display:none;line-height: 0px;max-height:70px;overflow-y:auto'><p>"
for(let i = 0; i < openMojis.length; i++)
	{
	src = cdniverse + "images/OpenMoji/"+openMojis[i]+".svg"
	s += "<img id='webRTC_icon_"+openMojis[i]+"' onClick='myWebRTChub.icon(\""+openMojis[i]+"\")'  style='height:2.2em;background-color:#fff'>"
	$.get(src, function (data) 
			{
			    let xml = SVG_XML_cleanAndComplete(new XMLSerializer().serializeToString(data.documentElement))
			    let pos = xml.indexOf(' viewBox="0 0 72 72"')
			    if(pos != -1)
			    	xml = xml.slice(0, pos) + ' width="72" height="72"' + xml.slice(pos)
			    iconsRawData[openMojis[i]] = xml
				var svg = new Blob([xml], {type:"image/svg+xml"}) //SAFARI does not like ;charset=utf-8
		        let domURL = self.URL || self.webkitURL || self
		        let url = domURL.createObjectURL(svg)
			    
			    let img = $("#webRTC_icon_"+openMojis[i])[0];

			    img.onload = function () {
			        domURL.revokeObjectURL(url);
			    };
			    img.src = url
			})
	}
s += "</p></div>" 
s += "<div class='wm sameSizeAsBottomBarWebRTChub' id='peersTopLeft' style='display:none;line-height: 0px;max-height:70px;overflow-y:auto'>"
s += "</div>"
s += "<div class='sameSizeAsBottomBarWebRTChub' id='peersBottomLeft' style='display:none;width:100%;max-height:70px;overflow-y:auto'>"
	  + "</div>"
s += "<div class='sameSizeAsBottomBarWebRTChub' id='peersBottomRight' style='display:none;max-height:70px;overflow-y:auto'>" 
	+ "<table style='width:100%'>"
	 + "<tr>" 
	   + "<td class='imageCell' style='width:1px'><img class='wm' src='"+cdniverse+"images/iconfinder_link-rounded_4417094.svg' style='height:2em'></td>"
	   + "<td class='imageCell' colspan='2' style='text-align:left'><input id='myLinkToOtherPeers' type='url' onKeyUp='myWebRTChub.verifyURLlinkChanged(event)' placeHolder='url' style='width:14em'></td>"
	 + "</tr>"
	 + "<tr>"
	 	+" <td class='imageCell'>"
 		+ "<input class='showHideMyLinkToOtherPeers' type='checkbox' onClick='myWebRTChub.changedMyLinkToSend()' style='display:none'>"
		+ "<img class='wm hidesWhenShowsMyWebRTCLink' onClick='loadScripts(\""+compiledOrNotPathJS + "/static/tapalife_files"+ compiledOrNotJS +".js\", \"tapalifeFiles.mainWindow()\")' src='"+cdniverse+"images/iconfinder_folder-new_118756.svg' style='height:2em'>"
 		+ "</td>" 
	 	+ "<td class='imageCell imageCell showHideMyLinkToOtherPeers' style='display:none'>"
	 		+ "<button onClick='openLinkInIframe($(\"#myLinkToOtherPeers\").val())' ><img class='wm' src='"+cdniverse+"images/open_in_browser-black-18dp.svg' style='height:2em'></button>"
	 		+ "<button onClick='loadScripts(\"" + compiledOrNotPathJS + "/static/tapalife_files"+ compiledOrNotJS +".js,https://www.youtube.com/iframe_api\", \"tapalifeFiles.mainWindow()\")'><img src='"+cdniverse+"images/iconfinder_folder-new_118756.svg' style='height:2em'></button>"
	 		+ "<button onClick='loadScripts(\"" + compiledOrNotPathJS + "/static/tapalife_files"+ compiledOrNotJS +".js,https://www.youtube.com/iframe_api\", \"tapalifeFiles.processThisLinkREALLY(undefined, $(`#myLinkToOtherPeers`).val(),`pdf`)\")'><img src='"+cdniverse+"images/iconfinder_pdf_272705.svg' style='height:2em'></button>"
	 		+ "<button onClick='loadScripts(\"" + compiledOrNotPathJS + "/static/tapalife_youtube"+ compiledOrNotJS +".js,https://www.youtube.com/iframe_api\", \"processThisLinkYOUTUBE(undefined, $(`#myLinkToOtherPeers`).val())\")'><img src='"+cdniverse+"images/iconfinder_social_style_3_youtube_341094.svg' style='height:2em'></button>"
	 	+ "</td>"
	 	+ "<td><form class='hidesWhenShowsMyWebRTCLink'><input id='fileInputIDwebrtcHub'  type='file' onchange='loadLocalFile(event);this.form.reset()'></form></td>"	
	+"</tr>"
	+"</table>"
	+"</div>"
		
	s += "<div class='wm' id='peersInstructionsClickCorners' style='display:none;height:15px'>" 
		+ "<br><b style='color:#00f'>" + TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[22]) + "</b></br>&nbsp;"
		+ "</div>"

      s += "<div class='wm' id='peersControlXYzoomOfOthersCamera' style='display:none;width:100%;text-align:center;max-height:76px;overflow:auto'>" 
          + "</div>"

      s += "<div class='wm' id='bottomMenuWaitingForOthers' style='display:none;width:100%;text-align:center;max-height:76px;overflow:auto'>" 
          + "</div>"

     s += "<div class='wm' id='peersControlXYzoomOfMyCamera' style='display:none;width:100%;text-align:center;max-height:76px;overflow:auto'>" 
         + "<div style='display:inline;position:relative;margin:auto'>"

	  s += " <div class='wm' id='usernameVideoCenter' style='display:inline-table;overflow-y:auto;vertical-align:middle'>" 
		  + "</div>"


	    s += " <table class='wm sameSizeAsBottomBarWebRTChub' id='peersStatsAndExit' onClick='myWebRTChub.removePeersGlobalVideoINSTRUCTIONS()' style='vertical-align:middle;overflow-y:auto'><tr>"
	    let images4 = ["images/emotions/iconfinder_EMOJI_ICON_SET-03.svg","images/talkisi/question_mark.svg","images/iconfinder_link-rounded_4417094.svg","images/OpenMoji/"+openMojis[0]+".svg"]
		let posMap = [];posMap[0]=0;posMap[1]=3;posMap[2]=1;posMap[3]=2
		for(let n = 0; n < images4.length; n++)
		  {
			let i4 = posMap[n]
			if(n == 2)
			  s += "</tr><tr>"
			s += "<td class='imageCell'><button onClick='myWebRTChub.clickedCanvas(undefined, undefined, "+ i4 +");afterChangeToEmotionExecuteThis=\"myWebRTChub.activateCorner(\\\"peersControlXYzoomOfMyCamera\\\")\"' style='max-width:28px;max-height:28px'><img src='"+cdniverse + images4[i4] +"' style='height:1.4em'></button></td>"
		  }
		s += "</tr></table>"



   	 	s += " <table class='wm' style='vertical-align:middle'><tr class='imageCell'><td class='imageCell' >"
   	 	+ "<label style='background-color:#080'><input class='wm' id='zoomCameraRange1to10' type='range' orient='vertical' onInput='myWebRTChub.recalculateDxDyAndDeltasAndZoom()' min='1' max='4' step='any' value='1' style='-webkit-appearance: slider-vertical;height:62px;min-width:30px;max-width:30px'></label></td>"
   	 	+ "<td  class='imageCell' style='line-height:1em'><label style='background-color:#080'><input id='dxMyCameraRangeMinus100plus100' type='range' onInput='myWebRTChub.recalculateDxDyAndDeltasAndZoom()' min='-100' max='100' value='0' style='max-width:80px'></label>"
   	 	+ "<br>zoom dx dy"
   	 	+ "<br> <select id='selectZoomModeForFaceWebRTChub' onChange='myWebRTChub.changedZoomModeForFaceWebRTChub(this.value)'>"
   	 			+ "<option>manual</option>"
   	 			+ "<option>auto</option>"
//   	 			+ "<option>draw</option>"
   	 			+ "</select> "
   	 	+ "<td class='imageCell'><label style='background-color:#080'><input class='wm' id='dyMyCameraRangeMinus100plus100' type='range' orient='vertical' onInput='myWebRTChub.recalculateDxDyAndDeltasAndZoom()' min='-100' max='100' value='0' style='-webkit-appearance: slider-vertical;height:62px;min-width:30px;max-width:30px'></label></td>"
   	 	+ "</tr></table>"

	  s += " <div class='wm' id='peersVideoCenter' style='display:inline-table;overflow-y:auto;vertical-align:middle'>" 
		  + "</div>"
	  s	+= "</div></div>"

	s += " <div class='wm' id='usernameScreenShareCenter' style='display:inline-table;overflow-y:auto;vertical-align:middle'>" 
		  + "</div>"
	    + "<div class='imageCell' id='peersControlMyActiveScreenSharing' style='display:none;vertical-align:middle'>" 
		+ "<table class='wm' style='width:100%'><tr class='imageCell'>"
		+ "<td><input id='webrtchub_activeInOverlap' type='checkbox' checked> active"
		+ "<br><input onChange='myWebRTChub.changedZoomModeForFaceWebRTChub(this.checked ? \"auto\": \"manual\",true) ' type='checkbox'> faces"
		+ "</td><td class='imageCell' style='text-align:right;width:90px'>"
		+ "<table border='1'>"
		for(let y = -1; y <= 1; y++)
		  {
			s += "<tr>"
			for(let x = -1; x <= 1; x++)
				s += "<td class='imageCell cursorBlue noselect squareWhereToShowVideoOnScreenSharing' id='squareWhereToShowVideoOnScreenSharing_"+(y * 3 + x)+"' onClick='myWebRTChub.selectSquareWhereToShowVideoOnScreenSharing("+(y * 3 + x)+")'  style='width:25px;height:20px;background-color:"+(showMyVideoInScreenSharing3x3pos == y * 3 + x ? "#f00" : "#ffa" )+"'>&nbsp;</td>"
			s += "</tr>"
		  }
	s += "</table></td>"
	s += "<td class='imageCell' style='text-align:left;padding-left:10px'><label style='background-color:#f00'><input class='wm' type='range' orient='vertical' onInput='zoomVideoCameraProjectingOverScreenSharing = this.value' min='0.3' max='3' step='any' value='1' style='-webkit-appearance:slider-vertical;height:62px;min-width:30px;max-width:30px'></label></td>"
	s += "<td class='mywebrtc_hide_whenNoSpaceBottomBar'><button onClick='myWebRTChub.startScreenShare()' style='background-color:#f00'><img src='"+ cdniverse +"images/screen_share-white-18dp.svg' style='height:2em'></button>"
			+ "</td>"
 	s += "</tr></table></div>"
 		
	+ "</td>"
  
s += "<td class='hideForSettingsGlobalPeersTD' style='display:none;width:100%;text-align:center'><div class='wm' id='chatReceivedGlobalPeers' style='display:inline-block;background-color:#fff;overflow-y:auto;overflow-wrap:break-word;border:1px solid #000;max-width:600px;width:100%;height:75px;max-height:75px;text-align:left'></div></td>"

s += "<td class='settingsGlobalPeersTD' style='display:none;width:100%;text-align:center'>ºpskdgfºçsdkgçskdçlgk</td>"

s += "<td onClick='myWebRTChub.closeBottomBar()' style='width:1px;color:#800;cursor:pointer'><img src='"+cdniverse+"images/close-black-18dp.svg' style='width:20px;height:20px'></td>"

s += "</tr>"
s += "</tr></table></div>" //webRTChub_mainTableBottomBar_ID

s += "<table class='wm' id='tableWithButtonsRotateAndPlus' style='width:100%;overflow-x:hidden;pointer-events:all'><tr class='wm'>"
	+ "<td class='wm' style='text-align:left;vertical-align:middle'>&nbsp;"
	+ "<i id='myWebRTChub_button_video_sidepanel' style='display:none'><button class='imageCell' onClick='myWebRTChub.showGlobalSidePanel(false, true)' style='min-width:1.5em;background-color:rgb(255, 255, 221)'><b id='webrtchub_textOpenCloseSidePanel'>+</b></button>"
  	+ "</i>&nbsp;<button class='imageCell myWebRTCbuttonLoud' onClick='event.stopPropagation();peersSpeakersActive = false;myWebRTChub.meetingsSpeakersMuteNotUnmute(undefined, true)' style='"+(peersSpeakersActive ? "" : "display:none;")+"background-color:#bfb'><img src='"+ cdniverse +"images/baseline-volume_up-24px.svg' style='height:1.5em'></button>"
    + "<button class='imageCell myWebRTCbuttonSilent' onClick='event.stopPropagation();peersSpeakersActive = true;myWebRTChub.meetingsSpeakersMuteNotUnmute(undefined, false)' style='"+(peersSpeakersActive ? "display:none;" : "")+"background-color:#fbb'><img src='"+ cdniverse +"images/baseline-volume_off-24px.svg' style='height:1.5em'></button>"
	+ " <nobr>"
	+ "<button class='imageCell myWebRTCbuttonCameraOn' onClick='event.stopPropagation();myWebRTChub.meetingsCameraMuteNotUnmute(undefined, true)' style='"+(peersCameraActive ? "" : "display:none;")+"background-color:#bfb'><img src='"+ cdniverse +"images/videocam-black-18dp.svg' style='height:1.5em'></button>"
    + "<button class='imageCell myWebRTCbuttonCameraOff' onClick='event.stopPropagation();myWebRTChub.meetingsCameraMuteNotUnmute(undefined, false)' style='"+(peersCameraActive ? "display:none;" : "")+"background-color:#fbb'><img src='"+ cdniverse +"images/videocam_off-black-18dp.svg' style='height:1.5em'></button>"
    
	+ " <button class='imageCell myWebRTCbuttonMicrophone' id='myWebRTCbuttonMicrophone_global' onClick='event.stopPropagation();myWebRTChub.meetingsMicrophoneMuteNotUnmute(undefined, undefined)' style='background-color:"+(peersMicrophoneActive ? "#bfb" : "#fbb")+"'>"
	     + "<img class='myWebRTCbuttonMicrophoneOn' id='myWebRTCbuttonMicrophoneOn_global' src='"+ cdniverse +"images/iconfinder_microphone_322463.svg' style='"+(peersMicrophoneActive ? "" : "display:none;")+"height:1.5em'>"
	     + "<img class='myWebRTCbuttonMicrophoneOff' id='myWebRTCbuttonMicrophoneOff_global' src='"+ cdniverse +"images/iconfinder_microphone-slash_1608549.svg' style='"+(peersMicrophoneActive ? "display:none;" : "")+"height:1.5em'>"
         + "</button>"
	+ "<i id='webrtc_audio_volume'></i>"
	+ "</nobr>"
    + "</td>"

	s += "<td id='meetingsSelectionTD' style='display:none'></td>"

    s += "<td id='cellForExtraElementsOutsideMyWebRTChub' style='display:none'>" 
        + "<button onCLick='myWebRTChub.sendCurrentScreen()'>"+TLtranslateFromTo(SENTENCES_OF_MY_WEBRTC_HUB[4])+"</button>"
		+ " " + redButtonToReturnToVideoConference
		+ "</td>"

	s += "<td id='showMeetingLinksTD' style='text-align:right'><div style='display:inline-table;text-align:center'>"
	  + "<img class='mywebrtc_hide_whenNoSpaceBottomBar' onCLick='manageYoutube()' title='YouTube' src='"+ cdniverse +"images/iconfinder_18-youtube_104482.svg' style='height:32px'>"
	
	s += myWebRTChub.buttonsScreenShareAndSecondCameraAndOthers(undefined, true)
	
	 s += "<nobr class='mywebrtc_hide_whenNoSpaceBottomBar'><button onClick='myWebRTChub.manageLocalUsersToSend()'><img src='"+cdniverse+"images/face-black-18dp.svg' style='height:1.5em'></button>"
	  + "<button onClick='myWebRTChub.showMeetingLinksAndPeers()'><img src='"+cdniverse+"images/group-black-18dp.svg' style='height:1.5em'></button>"
	  + "</nobr>"
	  + "<button id='buttonShowUsersInHost' onClick='removeFromBlinkingElements(\"#buttonShowUsersInHost\");myWebRTChub.showUsersWaitingForHostAcceptance(undefined, true)' style='display:none;color:#fcc'><img src='"+cdniverse+"images/webrtc/iconfinder_Home_4200470.svg' style='height:1.5em'></button>"
	  + "<button id='buttonShowGlobalChatWebRTCpeers' onClick='myWebRTChub.showGlobalChat(undefined, true, undefined, this)' style='background-color:#bfb'><img src='"+ cdniverse +"images/chat-black-18dp.svg' style='height:1.5em'></button>"
	  + " <nobr><button class='button_toggle3D mywebrtc_hide_whenNoSpaceBottomBar buttonOnRightBottomSideTo3D' onClick='toggle3D();if(!isIn3D)myWebRTChub.showAllMeetingsIn2D()' style='background-color:#c9211e;color:#fff;vertical-align:middle;height:1.5em'><b>"+(isIn3D ? 2 : 3)+"D</b></button>"
  	  + "<button onClick='myWebRTChub.menuCloseMeeting()' style='background-color:#c00;color:#fff'><img src='"+cdniverse+"images/call_end-white-18dp.svg' style='height:1.5em'></button>"
	  + "<div class='display_inline_table hideWhenNavigationEnabled' style='"+(memorySelectedTypeDiv.length >1 ? "display:none":"")+"'>&nbsp;<button class='navbut navigationEnabled' id='buttonToAccessQuickBottomChoicesID' onclick='event.stopPropagation();SOSdefaultTopBar();' ><b>&#8285;</b></button>"
	  + "</div></nobr></div></td>"
	+ "</tr></table>"

s += soundHTML(cdniverse + "sounds/another-message-has-arrived.mp3", false, "soundOfPeerArrived")
s += soundHTML(cdniverse + "sounds/salamisound-4752896-three-times-to-knock-on-wood.mp3", false, "knockWoodDoor")

forUseByWebRTChub.style.display = "grid"
forUseByWebRTChub.innerHTML = s


showTopBar("") //to initialize HTML
		
if(windowWidth() < 450)
    this.showNotHideWhenNoSpaceBottomBar(false)
		
addBottomBarToDiv(currentDIVid(), " ")

//place instead parent div in "observer_webrtchub"
//jsGlobalOnResize.push("myWebRTChub.resizeElementsWithPeersParticipant(undefined, true, undefined, undefined, true)")

loadedGSAPgreensock() //so not to wait in other actions 

//plugin defaults
questionsControlCenterPOINTER = myWebRTChub.questionsControlCenter

const FPS = lowerFrameRate
setInterval(function()
    {
   	for(let [uuid, localUser] of localUsersUUIDtoObject)
   	    myWebRTChub.redrawCanvasAsStream(localUser)
    myWebRTChub.updateCamerasCanvas() 
    },100)

setOnlyShowIn2Dor3D()

return true
  
}

}//class

var myWebRTChub = new MyWebRTChub("example")

//here and not in tapalife_youtube
addSettingsToSendAndReceive["tapalifeYouTube"] = "tapalifeYouTube_addToSettingsToSendToOther"

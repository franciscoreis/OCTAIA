package AppClasses.WebRTC;

import java.io.Serializable;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.zip.CRC32;
import java.util.zip.Checksum;

import com.google.firebase.messaging.FirebaseMessaging;
import com.googlecode.objectify.annotation.Subclass;
import com.lifeinpulse.Commands;
import com.lifeinpulse.IndexHtmlForClient;
import com.lifeinpulse.StructureForManifestData;
import com.lifeinpulse.TapalifeServlet;
import com.lifeinpulse.User;
import com.lifeinpulse.TPA.Association;
import com.lifeinpulse.TPA.Property;
import com.lifeinpulse.TPA.PropertyClientContext;
import com.lifeinpulse.TPA.Tipo;
import com.lifeinpulse.URLshort.FullToDomainShortURL;
import com.lifeinpulse.domains.CantoDaAtalaia;
import com.lifeinpulse.domains.Hospital21;
import com.lifeinpulse.domains.OmeuPortugalCorrupto;
import com.lifeinpulse.domains.Portugalo;
import com.lifeinpulse.firebase.FirebaseChannel;
import com.lifeinpulse.firebase.FirebaseUtilities;
import com.lifeinpulse.translationLanguages.TL;

import AppClasses.BaseType;
import AppClasses.ARlocalizedObjects.GroupOfLocalizedObjects;
import AppClasses.ARlocalizedObjects.LocalizedObject;
import AppClasses.AugmentedReality.UtilitiesForAugmentedReality;
import AppClasses.ProblemSolver.ProblemSolver;
import AppClasses.VisiTrue.VisiTrue;
import AppClasses.VisualSupport.MyImageManager;
import AppClasses.WebRTC.descendants.EnsinoDistancia.ARatSchool3D;
import AppClasses.WebRTC.descendants.EnsinoDistancia.Aular;
import AppClasses.WebRTC.descendants.EnsinoDistancia.ClassGroom;
import AppClasses.WebRTC.descendants.EnsinoDistancia.Classes3D;
import AppClasses.WebRTC.descendants.EnsinoDistancia.Flex25;
import AppClasses.WebRTC.descendants.EnsinoDistancia.NoGoClass;
import AppClasses.WebRTC.nogo.*;
import AppClasses.WebRTC.nogo.comunication.EuPasseioCom;
import AppClasses.WebRTC.nogo.comunication.OmnatarHub;
import AppClasses.WebRTC.nogo.comunication.PDFwalk;
import AppClasses.WebRTC.nogo.comunication.Talkisi;
import AppClasses.WebRTC.nogo.comunication.ThreeDesktop;
import AppClasses.WebRTC.nogo.comunication.ToWalkMe;
import AppClasses.WebRTC.nogo.comunication.TransLightHouses;
import AppClasses.WebRTC.nogo.comunication.UmniverseNogo;
import AppClasses.WebRTC.nogo.comunication.WorlDesktop;
import AppClasses.WebRTC.nogo.nogoParty.NoGoParty;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goals;
import Messaging.MessageSent;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal1;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal2;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal3;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal4;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal5;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal6;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal7;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal8;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal9;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal10;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal11;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal12;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal13;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal14;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal15;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal16;
import AppClasses.WebRTC.sustainabilityDevelopmentGoals.Goal17;
import RRI.RequestResponseInfo;
import UtilitiesForOtherClasses.Primiti;
import UtilitiesForOtherClasses.Utilities;
import UtilitiesHTML.UtilitiesUsingHTML;
import virtual_apps.BaseApp;

@Subclass(index=true)
public class WebRTChub extends BaseType implements Serializable
{
		private static final long serialVersionUID = 1209L; //uses lastSerialVersionUID
		
		public static final String[] COLORS_OF_AIA = {"","","#c9211e","#003fca","#006a37","#a46628", "#959ba3", "#33b3a6", "#daa520","#c9211e"};
		public static final String[] NAMES_OF_AIA = {"","","zoomings","triaia","tetraia","pentaia", "hexaia", "heptaia", "octaia", "nogo"};
		
		public static final String[] SENTENCES_OF_MY_WEBRTC_HUB = {
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

				};
		
		
		public static String type_WebRTChub;
		public static long property_WebRTChub_designation;
		public static long property_WebRTChub_comments;

		public static final String varIDmainSearch = "nogo_main_search_text";

		
//----------------------------------------------------------------------------
@Override
public void createVerifyFields(RequestResponseInfo rri, int typesPropertiesNotAssociations) 
{
		switch(typesPropertiesNotAssociations)
		{
		case BaseType.CREATE_VERIFY_FIELDS_OPTION_CREATE_TYPES_PROPERTY:
			property_WebRTChub_designation = Property.createProperty(rri, type_WebRTChub, 1, 1,"Name", null, Property.PROPERTY_STRING, Property.longOptions(Property.LONG_OPTION_PLACE_IN_NAME), false, 0,  TL.E_UK, false);
			property_WebRTChub_comments = Property.createProperty(rri, type_WebRTChub, 2, 1,"Comments", null, Property.PROPERTY_STRING_MULTIPLE_LINE, null, true, 0,  TL.E_UK, false);
			break;
		case BaseType.CREATE_VERIFY_FIELDS_OPTION_CREATE_ASSOCIATIONS:

			break;
		}
}
//-----------------------------------------------------------------------------------------------
@Override
public String iconOfType(RequestResponseInfo rri, String size, boolean canCallImage, String extraClassOrStyle) 
{
	return "<img "+extraClassOrStyle+" src='"+ IndexHtmlForClient.cdn+"images/class_icons/iconfinder_Reach-smartphone-human-people-communication-tablet_2992660.svg' style='width:"+size+";height:"+size+"'>";
}
//-----------------------------------------------------------------------------------------
@Override
public String view(RequestResponseInfo rri, List<Property> properties, boolean edit)
{
	
	String s = "<br>";
	s += "<div id='test_"+keyID(rri)+"'>";
	
	webRTCreturnLoadJavascriptModule(rri, extraJavaScriptFilesNeeded(rri)
			, "myWebRTChub.initiateHTML(\"#test_" + keyID(rri) + "\")", false);
	
	return s;
}
//----------------------------------------------------
public void talkisi(RequestResponseInfo rri) 
{
	String s = "<br>";
	s += "<div><a target='_blank' href='https://talkisi.com'><img src='"+IndexHtmlForClient.cdn+"images/talkisi/symbol_logo.svg' style='width:13em'></a><br><b>"+underLogoSentence(rri) + "</b></div>";

	
	String uuid = UUID.randomUUID().toString();
	String meetParam = UUID.randomUUID().toString();

	s += talkisiProcessParameters(rri, null, meetParam);

	rri.arrayResponseDIV.add("</div><br>&nbsp;"); //divEmcopassingAll_

	rri.returnTopBarForNextDIV(null, " ");
	//webrtchub_landing_page MUST BE COMMON TO ALL DESCENDANTS HOME PAGE
	rri.returnThisDIV("webrtchub_landing_page_" + meetParam.replaceAll("-", ""), "Augmented Reality",  "Places with objects"
			, "<br><div id='divLoginInAll_"+rri.reqGetParameterValues("meet")+"' class='BORDER_RADIUS_7' style='display:inline-table;text-align:unset;padding:0.5em;background-color:rgba(255,255,255,0.90);border-color:#fff'>" + s);
}
//------------------------------------------------------------------
public String underLogoSentence(RequestResponseInfo rri) 
{
	return TL.transLang(rri, "instant video meetings");
}
//---------------------------------------------------------
public String talkisiProcessParameters(RequestResponseInfo rri, String meetingCreateParameters, String uuid)
{
	String s = "";
	String meetParam = rri.reqGetParameterValues("meet");// getParametersInURLformat(null);
	if(meetParam != null && meetParam.length() > 0) 
	{
	String title = rri.reqGetParameterValues("title");
	String subject = rri.reqGetParameterValues("subject");
	String date = rri.reqGetParameterValues("date");
	String time = rri.reqGetParameterValues("time");
	String advancedParamJSON = rri.reqGetParameterValues("ap");
	if(rri.requestURLoriginal.indexOf("/s/") != -1)
		rri.temporaryString2 = rri.requestURLoriginal;
	
	if(meetParam.indexOf("HOSTS") != -1 && meetParam.indexOf("_-_") != -1)
	{
		String withCrc32 = computeWithCRC32(meetParam.substring(0, meetParam.length() - 8));
		if(!withCrc32.equals(meetParam))
			{
			rri.returnMessage("<b style='color:red'>" + TL.transLang(rri, "THE MEETING LINK DID NOT PASS SECURY TEST") + "</b>"
					+ "<br><br>" + TL.transLang(rri, "One or more characters was changed."));
			}
	}
	
	s += talkisiEnterMeeting(rri, meetParam, title, subject, date, time, false, advancedParamJSON, uuid);
	}
	else 
		s += "<br><br>" + talkisiCreateMeeting(rri, meetingCreateParameters, uuid);

	return s;
}
//----------------------------------------------------
static private String computeWithCRC32(String uuid) 
{
	Checksum crc32 = new CRC32();
    //some variations to avoid guessing!
	byte[] bytes = (uuid + "my-secret"+ (uuid.length() + 5) * 3).getBytes();
	crc32.update(bytes, 0, bytes.length);
	String crcHex = Long.toHexString(crc32.getValue());
	if(crcHex.length() > 8)
		crcHex = crcHex.substring(0, 8);
	else
		while(crcHex.length() < 8)
		  crcHex = "0" + crcHex;
	
	uuid +=  crcHex;
	return uuid;
}
//----------------------------------------------------
	public String talkisiEnterMeeting(RequestResponseInfo rri, String meetParam, String title, String subject, String date, String time, boolean justCreated, String advancedParamJSON, String uuid) 
	{
	String s = "";
	
	if(title == null)
		title = "";
	if(subject == null)
		subject = "";
	if(date == null)
		date = "";
	if(time == null)
		time = "";

	String extraJavaScriptFiles = "";

	String jsExtra = "";
	
	String uniqueToFindVerticalCenter = "";
	if(advancedParamJSON != null && advancedParamJSON.length() > 0)
		uniqueToFindVerticalCenter = "uniqueToFindVerticalCenter_" + uuid;
	else advancedParamJSON = "";
	
	jsExtra += "nogoLinkEditor.revertAndApplyJSONstring(\""+ UtilitiesUsingHTML.replaceCharsForInsideQuotes(advancedParamJSON) +"\",\""+meetParam+"\",\"" + Primiti.encodeURIComponent(initialConfigInJsonString(rri)) + "\",\""+uuid+"\");";

	extraJavaScriptFiles += extraJavaScriptFilesNeeded(rri);
	

	  //TALKISI is where all the others are joined 
		String titleEncoded = Primiti.encodeURIComponent(title);
		String subjectEncoded = Primiti.encodeURIComponent(subject);
		String fullLink = domainURL(rri) + "?meet="+ (meetParam == null ? "":meetParam) + (title.length() > 0 ? "&title=" +  titleEncoded : "") + (subject.length() > 0 ? "&subject=" +  subjectEncoded : "") + (date.length() > 0 ? "&date=" + date : "") + (time.length() > 0 ? "&time=" + time.replace(':', '-') : "") +  (advancedParamJSON.length() > 0 ? "&ap=" + advancedParamJSON : "");
		String[] return2strings = inputWithLink(rri, fullLink, justCreated);
		String s2 = "<br>" + return2strings[0];
		String shortLink = return2strings[1];
	
	jsExtra += processLink(rri, meetParam);
	String s1 = "<div id='"+uniqueToFindVerticalCenter+"'>"
			+ "<br><input  id='inputForUsernameEnterMeeting_"+meetParam+"'  type='text' onKeyUp='if(event.keyCode == 13) $(nextSiblingTag(this, \"BUTTON\")).click()' placeholder='"+TL.transLang(rri, "your name")+"' value='" +(rri.user != null ? rri.user.name(rri) : TapalifeServlet.runLocal  ? "t " + Math.round(Math.random() * 98 + 1)   : "") + "' style='font-size:120%;width:10em'>"
			+ "<br><br><button class='VISIBILITY_AFTER_LOADED_TAPALIFE_JS' onClick='event.stopPropagation(); let inp = previousSiblingTag(this, \"INPUT\"); let name = inp.value; if(name.length < 3) {$(inp).focus();showMessageOnSOSforDuration(\""+ TL.transLang(rri, "name must have 3 or more characters") + "\",3000)} else "
										+"{evalUntilSuccess(`myWebRTChub.inviteToInstantTalk(\""+meetParam+"\",\"`+name+`\",undefined, undefined, undefined, undefined,\""+ Primiti.encodeURIComponent(rri.temporaryString2 != null ? rri.temporaryString2 : advancedParamJSON)+"\",\"" + shortLink+ "\")`);$(this.parentNode).hide()}' style='height:60px;border-radius:30px;padding:0px 20px;background-color:"+webrtcButtonBackgroundColor()+";color:#fff;font-size:150%'><b>" + buttonTextEnterMeeting(rri) + "</b></button>"
			+ "</div><br>";

	 String s3 = (date.length() == 0 ? "" : " &nbsp; " + TL.transLang(rri, "day") + " <b>" + date.replace('-', ':') +"</b>" + (time.length() == 0 ? "<br>" : ""))
			   + (time.length() == 0 ? "" : " &nbsp; " + TL.transLang(rri, "time") + " <b>" + time +"</b><br>")
			   + (title.length() == 0 ? "" : "<br><b>"+ title.replaceAll("\n", "<br>") +"</b><br>")
	 		   + (subject.length() == 0 ? "" : "<br><b>"+ subject.replaceAll("\n", "<br>") +"</b><br>");

			 if(s3.length() > 0)
				 s1 = s1 + s3 + "<br>";

	s1 += "<table><tr>"
		+ "<td><img onClick='event.stopPropagation();myWebRTChub.toggleSecondCameraShare(\""+meetParam+"\",\"#initial_camera_"+meetParam+"\")' src='"+ IndexHtmlForClient.cdn +"images/cameraswitch_black_24dp.svg' style='height:2em'>"
		+ "</td><td> &nbsp; <img class='myWebRTCbuttonCameraOn' onClick='event.stopPropagation();myWebRTChub.meetingsCameraMuteNotUnmute(undefined, true)' src='"+ IndexHtmlForClient.cdn +"images/videocam-black-18dp.svg' style='height:2em'>"
			  + "<img class='myWebRTCbuttonCameraOff' onClick='event.stopPropagation();myWebRTChub.meetingsCameraMuteNotUnmute(undefined, false)' src='"+ IndexHtmlForClient.cdn +"images/videocam_off-black-18dp.svg' style='display:none;height:2em'>";
	s1 += "</td><td> &nbsp; </td><td><img class='myWebRTCbuttonMicrophoneOn' onClick='event.stopPropagation();myWebRTChub.meetingsMicrophoneMuteNotUnmute(undefined, true)' src='"+ IndexHtmlForClient.cdn +"images/iconfinder_microphone_322463.svg' style='display:none;height:1.5em'></button>"
			  + "<img class='myWebRTCbuttonMicrophoneOff' onClick='event.stopPropagation();myWebRTChub.toggleSecondMicrophoneShare()' src='"+ IndexHtmlForClient.cdn +"images/iconfinder_microphone-slash_1608549.svg' style='height:1.5em'></button>";
	s1 += "</td><td> &nbsp; </td><td><img class='myWebRTCbuttonLoud' onClick='event.stopPropagation();peersSpeakersActive = false;myWebRTChub.meetingsSpeakersMuteNotUnmute(undefined, true)' src='"+ IndexHtmlForClient.cdn +"images/baseline-volume_up-24px.svg' style='height:2em'>"
		      + "<img class='myWebRTCbuttonSilent' onClick='event.stopPropagation();peersSpeakersActive = true;myWebRTChub.meetingsSpeakersMuteNotUnmute(undefined, false)' src='"+ IndexHtmlForClient.cdn +"images/baseline-volume_off-24px.svg' style='display:none;height:2em'></button>";
	s1 += "</td><td> &nbsp; &nbsp; </td><td><img onClick='localSubmit("+Commands.REFRESH_INDEX_HTML+", \"\", \"\", \"webrtc_"+multiPurposeName(rri)+"_error\")' src='"+ IndexHtmlForClient.cdn +"images/help-black-18dp.svg' style='height:2em'></button>";
	s1 += "</td></tr></table><br><video id='initial_camera_"+meetParam+"' title='initial camera' muted style='display:none;background-color:#fcc;width:15em;max-width:15em'></video>";
	
	
	s += justCreated ? s2 + "<br>" + s1 : s1 + s2;
	
	if(jsExtra == null)
		jsExtra = "";
	jsExtra += ";myWebRTChub.initializeAfterDivOfEnterMeeting(\""+meetParam+"\", \""+titleEncoded+"\",\""+subjectEncoded+"\",\""+Primiti.encodeURIComponent(fullLink)+"\");myWebRTChub.toggleSecondCameraShare('" + meetParam + "','#initial_camera_"+meetParam+"', true)";
	
	webRTCreturnLoadJavascriptModule(rri, extraJavaScriptFiles,  jsExtra, false);
	
	rri.returnBottomBarForNextDIV(null, htmlForWebrtcBottomBar(rri));
	
	rri.returnEVALforClosingNextDIV(null, "closeThisMeetingID(\""+meetParam+"\")");
	
	rri.arrayResponseDIV.add("<br>");

	return s;
}		
//----------------------------------------------------
public static void webRTCreturnLoadJavascriptModule(RequestResponseInfo rri, String extraJavaScriptFiles, String executeAfterLoad, boolean doNotExecuteEvenIfAlreadyImported)
		{
	    if(extraJavaScriptFiles == null)
	    	extraJavaScriptFiles = "";
	    if(executeAfterLoad == null)
	    	executeAfterLoad = "";
		rri.returnLoadJavascriptModule( 
			(TapalifeServlet.SEND_WEBRTCFILES_ON_START ? "" : IndexHtmlForClient.compiledOrNotPathJSOrRequestURLserver(rri.requestURLserverOriginal,"/SimplePeer_webRTC/myWebRTChub"+IndexHtmlForClient.compiledOrNotJS+".js")
//			+ "," + rri.requestURLserverOriginal+"/SimplePeer_webRTC/webrtc_adapter_2/release/adapter.js"
//			+ ",https://cdnjs.cloudflare.com/ajax/libs/webrtc-adapter/8.1.2/adapter.min.js"
			+ "," + IndexHtmlForClient.compiledOrNotPathJSOrRequestURLserver(rri.requestURLserverOriginal , "/SimplePeer_webRTC/myWebRTCasync"+IndexHtmlForClient.compiledOrNotJS+".js")
			+ "," + IndexHtmlForClient.compiledOrNotPathJSOrRequestURLserver(rri.requestURLserverOriginal , "/SimplePeer_webRTC/simplepeer6.min.js")
			+ "," + IndexHtmlForClient.compiledOrNotPathJSOrRequestURLserver(rri.requestURLserverOriginal , "/nogoSuite/NogoLinkEditor"+ IndexHtmlForClient.compiledOrNotJS +".js")
			)
			+
			extraJavaScriptFiles, executeAfterLoad,doNotExecuteEvenIfAlreadyImported);
		}
//----------------------------------------------------
public String extraJavaScriptFilesNeeded(RequestResponseInfo rri) 
{
	return "," + IndexHtmlForClient.compiledOrNotPathJSOrRequestURLserver(rri.requestURLserverOriginal,"/nogoSuite/Nogo3D"+ IndexHtmlForClient.compiledOrNotJS +".js");
}
//----------------------------------------------------
public String initialConfigInJsonString(RequestResponseInfo rri) 
{
	return "";
}
//----------------------------------------------------
public String onClickChangeDevices(RequestResponseInfo rri)
{
	return " onClick='showTopBar(\"enumerateDevices\", undefined, true)' ";
}
//----------------------------------------------------
public String talkisiCreateMeeting(RequestResponseInfo rri, String meetingCreateParameters, String uuid) 
		{
		String s = "";
		
			s +=  buttonToIntitiateMeetingHTML(rri, meetingCreateParameters, uuid);
			
		String jsExtra = "";	
		String executeAfterLoading = "";	
			
		String ap = rri.reqGetParameterValues("ap");
		if(ap == null)
			ap = "";
		String json = initialConfigInJsonString(rri);
		if(json != null && json.length() > 0)                                  //NO uuid !!!
			executeAfterLoading += "nogoLinkEditor.revertAndApplyJSONstring(\""+ ap +"\",\"\",\"" + Primiti.encodeURIComponent(json) + "\");";
			
		jsExtra += extraJavaScriptFilesNeeded(rri);
		
		webRTCreturnLoadJavascriptModule(rri, jsExtra, executeAfterLoading, false);
		
		rri.nextDivHasThisClasses("contentsAndNoHeight");  
		
		return s;
	}		
//----------------------------------------------------------
	static public void howToStart(RequestResponseInfo rri) 
	{
		// TODO Auto-generated method stub
		String s = "<br>";

		s += "<br><br><b class='table_title'>" + TL.transLang(rri, "bring friends safely together") + "</b>";
		s += "<br><img class='BORDER_RADIUS_7' src='"+ IndexHtmlForClient.cdn +"images/PartyVirus/orlando/IMG_orlando_58.jpg' style='width:640px;max-width:95%'>";

		s += "<br><br><b class='table_title'>" + TL.transLang(rri, "keep one to one moments") + "</b>";
		s += "<br><img class='BORDER_RADIUS_7' src='"+ IndexHtmlForClient.cdn +"images/PartyVirus/orlando/IMG_pedro_orlando.jpg' style='width:640px;max-width:95%'>";

		s += "<br><br>" + TL.transLang(rri, "under construction") + "...<br>";

		s += "<br>";
		
		rri.returnThisDIV("party_virus_makeItViral", "Party Virus", "make it viral", s);
		
	}
//----------------------------------------------------------------------
private String buttonToIntitiateMeetingHTML(RequestResponseInfo rri, String meetingCreateParameters, String uuid) 
{
	if(meetingCreateParameters == null)
		meetingCreateParameters = "";

	boolean hasData = meetingCreateParameters.length() > 0;
		
	long datetime = 0;
	if(meetingCreateParameters.startsWith("DATETIME="))
			{
			int pos = meetingCreateParameters.indexOf(' ');
			if(pos == -1)
				pos = meetingCreateParameters.length();
			datetime = Long.parseLong(meetingCreateParameters.substring("DATETIME=".length(), pos));
			meetingCreateParameters = meetingCreateParameters.substring(pos).trim();
			}
	
	String buttonUuid= "buttonToIntitiateMeetingHTML_" + uuid;
	String head = " &nbsp; &nbsp; &nbsp; &nbsp; " + TL.transLang(rri, "optional") + " &nbsp; <br>";
	String body = "<table>"
			+ "<tr><td>"+TL.transLang(rri, "day")+"<br><input id='date_"+buttonUuid+"' type='date' "+ (datetime == 0 ? "" : "value='"+ Primiti.dateFormat_YYYY_MM_DD.format(datetime)) +"' style='width:11em'></td>"
	+ 		"<td>" + TL.transLang(rri, "hour")+ "<br><input id='time_"+buttonUuid+"' type='time' " + (datetime == 0 ? "" : "value='"+Primiti.dateFormat_hh_mm.format(datetime))+"' style='width:8em'></td></tr>"
	+ "</table>"
	+ "<br><input type='text' id='titleInput_"+buttonUuid+"' placeholder='"+TL.transLang(rri, "title")+"' style='width:19em;margin-top:5px;margin-bottom:10px'>"
	+ "<br><textarea id='textarea_"+buttonUuid+"' placeholder='"+TL.transLang(rri, "description")+"' style='margin-top:0.1em;width:20em;height:5em'>"+meetingCreateParameters.replaceAll("<br>","\n")+"</textarea>"
	+ "<br><a onClick='nogoLinkEditor.addYourselfAsHost(\"#textarea_hosts_"+buttonUuid+"\")'>" + TL.transLang(rri, "add yourself as host") + "</a>"
	+ "<br><textarea id='textarea_hosts_"+buttonUuid+"' placeholder='"+TL.transLang(rri, "emails of hosts")+"' style='margin-top:0.1em;width:20em;height:5em'>"+meetingCreateParameters.replaceAll("<br>","\n")+"</textarea>"
	+ "<br><a onClick='toggleShowHideSelector(\"#advanced_options_"+uuid+"\", undefined, undefined, undefined, 500)' style='color:"+webrtcButtonBackgroundColor()+"'>"+ TL.transLang(rri, "advanced") + "</a> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "
	//+ "<img src='"+ IndexHtmlForClient.cdn_BOTH_LOCAL_AND_CLOUD +"images/nogo/icon_for_PWA_16x16.png'> "
	+ "<b onClick='localSubmit("+Commands.REFRESH_INDEX_HTML+", \"\", \"\", \"webrtc_nogo_EXTRA_PAGE_1\")' style='cursor:pointer;color:#c9211e'>n o g o</b>"
	+ "<br>"
	+ "<div id='advanced_options_"+uuid+ "' style='display:none'>"
	+ "<b class='BORDER_RADIUS_4' id='buttonBackground_"+uuid+"' onClick='chooseColor(\"#inputBackground_"+uuid+"\")' style='cursor:pointer;padding:4px'>out</b><input id='inputBackground_"+uuid+"' type='text' onKeyUp='nogoLinkEditor.changeAddColor(event, \""+uuid+"\")' placeHolder='"+TL.transLang(rri, "color") + " URL' style='margin-top:0.5em;width:5em'>"
	+ " <b class='BORDER_RADIUS_4' id='buttonBackgroundIn_"+uuid+"' onClick='chooseColor(\"#inputBackgroundIn_"+uuid+"\")' style='cursor:pointer;padding:4px'>in</b><input id='inputBackgroundIn_"+uuid+"' type='text' onKeyUp='nogoLinkEditor.changeAddColorIn(event, \""+uuid+"\")' placeHolder='"+TL.transLang(rri, "color") + " URL' style='margin-top:0.5em;width:5em'>"
	+ " &nbsp;<button onClick='nogoLinkEditor.changeAddImage(event, \""+uuid+"\")'>"+ TL.transLang(rri, "image") +"</button>"
	+ "<br><input id='inputNewSubject_"+uuid+"' type='text' placeHolder='"+TL.transLang(rri, "subject to vote")+"' onKeyUp='nogoLinkEditor.changeAddSubject(event, \""+uuid+"\")' style='margin-top:0.5em;width:19em' subjectNumber='1'>"
	+   "<div id='divOfLinkEdit_"+uuid+"' style='display:none'><br>"
		+ TL.transLang(rri, "people voting")
		+ "<br><input id='inputNewVoter_"+uuid+"' type='text' onKeyUp='nogoLinkEditor.changeAddVoter(event, \""+uuid+"\")' placeHolder='"+TL.transLang(rri, "name")+"' voterNumber='1'>"
		+ "<br><div id='forVoters_"+uuid+"' style='display:inline-table;text-align:left'></div>"
		+ "<br><div id='forSubjects_"+uuid+"' translationSubject='"+TL.transLang(rri, "subject")+"' translationOption='"+TL.transLang(rri, "option")+"' translationVoter='"+TL.transLang(rri, "voter")+"' style='display:inline-table;'></div>"
	+   "</div>"
	+ "</div>"
	+ "<div id='also_use_"+buttonUuid+"' style='display:none'><br><br>" + TL.transLang(rri, "the link you send can also be used by you") + "</div>";

	String ap = rri.reqGetParameterValues("ap");
	return "<div id='"+buttonUuid+"'><button class='VISIBILITY_AFTER_LOADED_TAPALIFE_JS' onClick='event.stopPropagation();nextDivReplacesDivWithThisElement(this);nogoLinkEditor.createMeetingLink(\""+uuid+"\",\""+multiPurposeName(rri)+"\""+ (ap != null ? ",\""+ Primiti.encodeURIComponent(ap) + "\"" : "") +")' style='height:60px;border-radius:30px;font-size:150%;background-color:"+webrtcButtonBackgroundColor()+";color:#fff;padding:0px 20px'><b>" + buttonTextCreateMeeting(rri)  + "</b></button>"
		+ "<br><br><br>" + Utilities.showHideCLickingOnHeader(head, "<div>" + body + "</div>", hasData, "BORDER_RADIUS_4 VISIBILITY_AFTER_LOADED_TAPALIFE_JS", null) + "</div>";
}
//------------------------------------------------------------------------
public String webrtcButtonBackgroundColor() 
{
	return "#537599";
}
//----------------------------------------------------------------------
public static void clientCommands(RequestResponseInfo rri, String command, String option1, String option2, String option3, String option4, String appName, String advancedParamJSON) 
{

	String afterCommand = "";
	int pos = command.indexOf(' ');
	if(pos != -1)
	{
		afterCommand = command.substring(pos + 1);
		command = command.substring(0, pos);
	}
	
	switch(command)
	{
	case "LANDING_PAGE_WEBRTC": 
		if(!option1.equals("option")) //select carefully where refresh is valid!
			rri.sendRefresh = false; 
		getWebRTCapp(rri, appName, true).landingPage(rri, option1, null);
	break;
	case "CREATE_MEETING_LINK": 
		getWebRTCapp(rri, appName, true).createMeetingLink(rri, option1, option2, option3, option4, advancedParamJSON, afterCommand);
	break;
	case "CREATE_MEETING_WITH_EMAIL": 
		getWebRTCapp(rri, appName, true).createMeetingWithEmail(rri, option1);
	break;
	
	default: rri.returnMessageOnSOS_UK_error("command not found", ": " + command, 3000);
	}
}
//-------------------------------------------------------------------
private void createMeetingWithEmail(RequestResponseInfo rri, String email) 
{
User userWithEmail = User.getUserFromUsername(rri, email);
if(userWithEmail != null && userWithEmail.alreadyRegistered())
    {
	//ProblemSolver.inviteUsernameToMeeting(rri, UUID.randomUUID().toString() , keyID(rri), null, "assistant");
	}
	//FirebaseChannel.sendFirebaseMessage(rri, userWithEmail.channelForUser(), "eval(´alert(123)´)");

String meetingUUID = UUID.randomUUID().toString();
String channel = encryptMeetingUUIDtoCryptoChannel(meetingUUID);

rri.returnEVAL("inviteToInstantTalk_LOAD_JS_IF_NEEDED(\""+meetingUUID+"\",\""+ rri.username() +"\", undefined, undefined, undefined"
		+ ",\"" + channel + "\")");

MessageSent.enviarEmail(rri, email, userWithEmail, rri.siteName() + TL.transLangNow(rri, "Invitation to meeting", userWithEmail == null ? 0 : userWithEmail.preferredLanguage), "Invitation for Irmanos stories");

rri.returnMessageOnSOS(TL.transLang(rri, "Invitation was sent to") + " <b>" + email + "</b>", 2000);	
}
//-------------------------------------------------------------------
public String domainImage(RequestResponseInfo rri)
{
return IndexHtmlForClient.cdn+"images/"+multiPurposeName(rri)  +"/symbol_logo.svg";
}
//-------------------------------------------------------------------
public String domainURL(RequestResponseInfo rri)
{
		return rri.requestURLserver();
}
//---------------------------------------------------------------------------------------------
private void createMeetingLink(RequestResponseInfo rri, String selectorToInsertAndHide, String subject, String date, String time, String advancedParamJSON, String emailsOfHosts) 
{
	
	String title = "";
	
	if(subject == null)
		subject = "";
	else
	{
	int pos = subject.indexOf(' ');
	if(pos != -1)
	try
	  {
		int numChars = Integer.parseInt(subject.substring(0, pos));
		title = subject.substring(pos + 1, pos + 1 + numChars);
		subject = subject.substring(pos + 1 + numChars);
	  }
	catch(Exception e) 
	  {
	  }
	}
	
	if(date == null)
		date = "";
	if(time == null)
		time = "";
	
	String meetParam = generateMeetingUUID(0, null, emailsOfHosts);
	rri.reqSetParameterValues("meet", meetParam);
	String uuid = UUID.randomUUID().toString();
	
	String s = mainLogoAndUnderLogoSentence(rri)
	         + "<br>";

	s += "<br><b style='color:"+webrtcButtonBackgroundColor()+"; font-size:200%'>" + TL.transLang(rri, "Success!") + "</b>";
	
	s += talkisiEnterMeeting(rri, meetParam, title, subject, date, time, true, advancedParamJSON, uuid);
	
	rri.sendRefresh = false;

	rri.arrayResponseDIV.add("</div><br>&nbsp;"); //divEmcopassingAll_

	rri.returnTopBarForNextDIV(null, htmlForWebrtcTopBar(rri));
	//webrtchub_landing_page MUST BE COMMON TO ALL DESCENDANTS HOME PAGE
	rri.nextDivHasThisClasses("contentsAndNoHeight");
	rri.nextDivHasThisStyle("width:100%;display:inline-grid");
	
	rri.returnThisDIV("webrtchub_landing_page_" + meetParam.replaceAll("-", ""), "Augmented Reality",  "Places with objects"
			, "<br><div id='divLoginInAll_"+rri.reqGetParameterValues("meet")+"' class='BORDER_RADIUS_7' style='display:inline-table;text-align:inherit;padding:0.5em;background-color:rgba(255,255,255,0.90);border-color:#fff'>" + s);
	
}
//------------------------------------------------------------------------
public String mainLogoAndUnderLogoSentence(RequestResponseInfo rri) 
{
	return "<div><a onClick='localSubmit("+Commands.REFRESH_INDEX_HTML+", \"\", \"\", \"webrtc_"+multiPurposeName(rri)+"_saberMais\")'><img src='"+domainImage(rri)+"' style='width:13em'></a><br><b>"+underLogoSentence(rri)+"</b></div>";
}
//------------------------------------------------------------------
public static String generateMeetingUUID(long datetime, String uuid, String emailsOfHosts) 
{
	if(datetime <= 0)
		datetime = new Date().getTime();
	if(uuid == null || uuid.length() == 0)
		uuid = UUID.randomUUID().toString();
	
	long dateDays = datetime / Primiti.day;
	
	uuid = dateDays + "_" + uuid;
	
	if(emailsOfHosts != null && emailsOfHosts.length() > 0)
	{
	uuid += "HOSTS"+ Primiti.encodeURIComponent(emailsOfHosts);
	uuid = computeWithCRC32(uuid);
	}

	return uuid;
	
}
//---------------------------------------------------------------------------------------------
String[] inputWithLink(RequestResponseInfo rri, String link, boolean justCreated)
{
	TL.preTranslateTheseOriginals(rri, Arrays.asList(SENTENCES_OF_MY_WEBRTC_HUB), TL.E_UK, rri.preferredLanguage);
	
	String linkEncoded = UtilitiesUsingHTML.replaceCharsForInsideQuotes(link);
	if(TapalifeServlet.runLocal)
		linkEncoded = adaptDomainForLocalhost(rri, linkEncoded);
	
	if(linkEncoded.indexOf("/s/") == -1 && linkEncoded.indexOf("/surl/") == -1)
		linkEncoded = FullToDomainShortURL.getDomainShortURL(rri, linkEncoded, true, 16, null, true);
	
	String head = UtilitiesUsingHTML.copyToClipboard(linkEncoded, "26px") + " &nbsp; <b style='font-size:120%'><i onClick='event.stopPropagation();copyToClipboard(\""+ linkEncoded +"\")' style='color:"+webrtcButtonBackgroundColor()+"'>" + TL.transLang(rri, "copy the link") + "</i><br><nobr>" + TL.transLang(rri, "send to guests") + "</nobr></b>";

	String body = "<br><input class='inputWithOpenBrowserLink' fullLink='"+linkEncoded+"' type='text' onClick='openBrowser(\""+linkEncoded+"\")' value='"+ linkEncoded +"' style='width:14em;color:"+webrtcButtonBackgroundColor()+"'>"
	+ "<br><br><table><tr>"
	+ "<td  class='imageCell'>" + BaseApp.QRcode(rri, linkEncoded, 30) + "</td>"
	+ "<td> &nbsp; </td><td class='imageCell'><button class='SHOW_IF_SHARE_IS_AVAILABLE' onClick='"+UtilitiesUsingHTML.shareToApplicationsAction(rri, "metting link", linkEncoded)+"' style='display:none'><img src='"+ IndexHtmlForClient.cdn+"images/baseline-share-24px.svg' style='height:2em'></button></b></td>"
	+ "<td> &nbsp; </td><td class='imageCell'>"  + "</td>"
	+ "</tr></table>"
	+ "<br><b style='font-size:90%'><br><a target='_blank' href='"+ domainURL(rri) +"' style='color:"+webrtcButtonBackgroundColor()+"'>" + TL.transLang(rri, "create next meeting") + "</a><b>";

	String [] returnTwoStrings = new String[2];
	returnTwoStrings[0] = Utilities.showHideCLickingOnHeader(head, "<div>" + body + "</div>", false, "max16w98 BORDER_RADIUS_4 VISIBILITY_AFTER_LOADED_TAPALIFE_JS", null);
	returnTwoStrings[1] = linkEncoded;
	return  returnTwoStrings;
			
}
//------------------------------------------------------------
private String adaptDomainForLocalhost(RequestResponseInfo rri, String linkEncoded) 
{
	if(linkEncoded.indexOf("https://") == 0)
		linkEncoded = "http" + linkEncoded.substring(5);
	if(linkEncoded.indexOf("localhost:8080/") != -1)
		return linkEncoded;
	
	int pos = linkEncoded.indexOf('/', 8);
	if(pos == -1)
		pos = linkEncoded.length();
	int posH = linkEncoded.indexOf('?', 8);
	if(posH != -1 && posH < pos)
		pos = posH;
	
	int pos2 =  linkEncoded.lastIndexOf('.', pos);
	if(pos2 == -1)
		pos2 = pos - 1;
	
	
	return linkEncoded.substring(0, pos2) + "." + rri.requestURLminimumHost +  linkEncoded.substring(pos);
}
//---------------------------------------------------------------------------------------------
public static String encryptMeetingUUIDtoCryptoChannel(String meetingUUID)
{
	String dateDays;
	
	int pos = meetingUUID.indexOf('_');
	if(pos == -1 )
	{
		dateDays = "" + new Date().getTime() / Primiti.day;
		meetingUUID = dateDays + "_" + meetingUUID;
	}
	else
		dateDays = meetingUUID.substring(0, meetingUUID.indexOf('_'));

	return "meetings/MEETING_"+dateDays+"/" + FirebaseUtilities.encryptChannelPath(meetingUUID);

}
//---------------------------------------------------------------------------------------------
public static String processLink(RequestResponseInfo rri, String uuid) 
{
if(uuid == null) //can be only to create a walk of an app
	return "";
String dateDays;
	
int pos = uuid.indexOf('_');
if(pos == -1 )
{
	dateDays = "" + new Date().getTime() / Primiti.day;
	uuid = dateDays + "_" + uuid;
}
else
	dateDays = uuid.substring(0, uuid.indexOf('_'));

String channel = encryptMeetingUUIDtoCryptoChannel(uuid);

FirebaseChannel.sendFirebaseMessageEncryptePath(rri, channel, " "); //cleans (needed?)

return "registerChannelForUUIDpeers[\""+uuid+"\"]=\"" + channel + "\"";

/*
FirebaseChannel.sendFirebaseMessage(rri, channel, RequestResponseInfo.evaljscriptCommand(js, false));
*/
}
//-----------------------------------	
public void landingPage(RequestResponseInfo rri, String meetingCreateParameters, String bottomBar)
{
	
	String onClick = "onClick='localSubmit("+Commands.REFRESH_INDEX_HTML+", \"\", \"\", \"webrtc_"+multiPurposeName(rri)+"_saberMais\")'";

	String s = "<div><img class='max-style' "+onClick+" src='"+ domainImage(rri) +"' style='cursor:pointer; max-width:15em'>";

	s += "<br><b style='font-size:110%'>" + underLogoSentence(rri) + "</b></div>";

	String clickEnsinaTV = "onClick='localSubmit("+Commands.REFRESH_INDEX_HTML+", \"\", \"\", \"ensinaTV_landingPage\")'";

	rri.returnBottomBarForNextDIV(null, bottomBar != null ? bottomBar : htmlForWebrtcBottomBarCreateMeeting(rri));

	String uuid = UUID.randomUUID().toString();

	s += "<br>" + talkisiProcessParameters(rri, meetingCreateParameters, uuid);
	
	rri.returnTopBarForNextDIV(null, htmlForWebrtcTopBar(rri));

	rri.arrayResponseDIV.add("</div><br>&nbsp;"); //divEmcopassingAll_

	rri.nextDivHasThisCustomVariablesStyle("--btBgColor", webrtcButtonBackgroundColor());
	//webrtchub_landing_page MUST BE COMMON TO ALL DESCENDANTS HOME PAGE
	rri.returnThisDIV( "webrtchub_landing_page", "Local", shortNameForPWA(rri)
			, "<br><div id='divLoginInAll_"+rri.reqGetParameterValues("meet")+"' class='BORDER_RADIUS_7' style='display:inline-table;padding:0.5em;background-color:rgba(255,255,255,0.90);border-color:#fff'>" + s);
	
}
//-----------------------------------------------------------------------
public String htmlForWebrtcTopBar(RequestResponseInfo rri) 
{
	return " ";
}
//-----------------------------------	
public String multiPurposeName(RequestResponseInfo rri)
{  //this name should also be the directory of its things!!!
	return "webrtc";
}
//----------------------------------------------------------
public String multiPurposeNameREADABLE(RequestResponseInfo rri)
{
	return multiPurposeName(rri);
}
//-----------------------------------	
public static boolean indexHtmlCall(RequestResponseInfo rri, String host, String parameters, Map<String, String> parametersMap, WebRTChub webRTC) 
	{
	
	int pos = host.indexOf('_', 7);
	
	if(webRTC == null)
		webRTC = getWebRTCapp(rri, host.substring(7, pos), true);
	
	switch(host.substring(pos + 1))
	{
	case "landingPage" : 
		//rri.sendRefresh = false; 
		webRTC.landingPage(rri, parameters, null); 
		if(rri.buildingPageForIndexHTML)
		{
		if(rri.indexHTML_ogImage == null)
			rri.indexHTML_ogImage = webRTC.imageForIndexHTML(rri);
		if(rri.indexHTML_description == null)
			rri.indexHTML_description = TL.transLang(rri, "Video call");
		}
		break;
	case "saberMais": webRTC.saberMais(rri); break;
	case "ajuda": webRTC.ajuda(rri); break;
	case "teste": webRTC.teste(rri); break;
	case "antesDeContribuir": webRTC.antesDeContribuir(rri); break;
	case "contribuir": webRTC.contribuir(rri); break;
	case "error": webRTC.error(rri); break;
	case "EXTRA_PAGE_1": webRTC.extraPage1(rri, parameters); break;
	case "EXTRA_PAGE_2": webRTC.extraPage2(rri, parameters); break;
	case "EXTRA_ACTION_1": webRTC.extraAction1(rri, parametersMap); break;
	default: rri.returnMessageOnSOS_UK_error("operation not found for this domain", 3000); return false;
	}
	
	return true;
}
//-------------------------------------------------------------------------
public String imageForIndexHTML(RequestResponseInfo rri) 
{
	return IndexHtmlForClient.cdn + "images/nogo/icon_for_PWA_512x512.png"; 
}
//------------------------------------------------------------------------------
public void extraAction1(RequestResponseInfo rri, Map<String, String> parametersMap) 
{
//nothing	
}
//------------------------------------------------------------------------------
public void extraPage1(RequestResponseInfo rri, String parameters) 
{
rri.returnMessageOnSOS_UK_error("page not found", 3000);	
}
//------------------------------------------------------------------------------
public void extraPage2(RequestResponseInfo rri, String parameters) 
{
rri.returnMessageOnSOS_UK_error("page not found", 3000);	
}
//-------------------------------------------------------
public void informationToSolveProblems(RequestResponseInfo rri)
{
	
	rri.arrayResponseDIV.add(informationBeforeNoConnection(rri));
	
	rri.arrayResponseDIV.add("<br><b class='table_title' style='color:"+webrtcButtonBackgroundColor()+"'>" + TL.transLang(rri, "No connection?") + "</b><br>&nbsp;");
	rri.arrayResponseDIV.add("<br><b class='table_title' style='color:"+webrtcButtonBackgroundColor()+"'><i>1.</i> " + TL.transLang(rri, "Use a compatible browser") + ".</b>");
	rri.arrayResponseDIV.add("<br><br><table border='1'>");
	rri.arrayResponseDIV.add(
			 "<tr>"
			+ "<th>" + TL.transLang(rri, "device")+ "</th>"
			+ "<th>" + TL.transLang(rri, "operating system")+ "</th>"
			+ "<th>" + TL.transLang(rri, "browsers with")+ " WebRTC</th>"
			+ "</tr>");
	rri.arrayResponseDIV.add(
			"<tr style='background-color:#ddf'>"
			+ "<td>iphone<br>ipad</td>"
			+ "<td>iOS<br>iPadOS</td>"
			+ "<td><br><b>Safari</b><br>&nbsp;</td>"
			+ "</tr>");
	rri.arrayResponseDIV.add(
			"<tr style='background-color:#dfd'>"
			+ "<td>Smartphone</td>"
			+ "<td>Android</td>"
			+ "<td><b>Chrome<br>Firefox<br>Edge</b></td>"
			+ "</tr>");
	rri.arrayResponseDIV.add(
			"<tr style='background-color:#acf'>"
			+ "<td>PC</td>"
			+ "<td>Windows</td>"
			+ "<td><b>Chrome<br>Firefox<br>Edge</b></td>"
			+ "</tr>");
	rri.arrayResponseDIV.add(
			"<tr style='background-color:#ddd'>"
			+ "<td>Mac</td>"
			+ "<td>MacOS</td>"
			+ "<td><b>Chrome<br>Firefox<br>Edge<br>Safari<b></td>"
			+ "</tr>");
	rri.arrayResponseDIV.add("</table><br>");
	rri.arrayResponseDIV.add("<table><tr><td class='table_title' style='text-align:left;color:"+webrtcButtonBackgroundColor()+"'>");
	rri.arrayResponseDIV.add("<br><b><i>2.</i> " + TL.transLang(rri, "Try refreshing page") + ".</b><br>&nbsp;");
	rri.arrayResponseDIV.add("<br><b><i>3.</i> " + TL.transLang(rri, "Change browser if possible") + ".</b><br>&nbsp;");
	rri.arrayResponseDIV.add("<br><b><i>4.</i> " + TL.transLang(rri, "Disable VPN if active") + ".</b><br>&nbsp;");
	rri.arrayResponseDIV.add("<br><b><i>5.</i> " + TL.transLang(rri, "Disable Firewall if active") + ".</b><br>&nbsp;");
	rri.arrayResponseDIV.add("</td></tr></table>");

	rri.arrayResponseDIV.add(informationAfterNoConnection(rri));

	
}
//--------------------------------------------------------------------------
public String informationAfterNoConnection(RequestResponseInfo rri) 
{
	return "<br><br><b style='font-size:150%'>"+ TL.transLang(rri, "for sugestions or support")  +"<br><br><a onclick='contactsHTML()'>"+ TL.transLang(rri, "contacte-nos", TL.P_PT) +"</b><br></br>";
}
//---------------------------------------------------------------------
public String informationBeforeNoConnection(RequestResponseInfo rri) 
{
	return "";
}
//-------------------------------------------------------
private void error(RequestResponseInfo rri) 
{
String s = "" ;

informationToSolveProblems(rri);

rri.returnTopBarForNextDIV(null, imageWithThisWidthForTopBar(rri, "20em"));

rri.returnThisDIV(multiPurposeName(rri) + "_error_solver", "Communications",  "problem solver", s);
}
//-------------------------------------------------------------------
public String imageWithThisWidthForTopBar(RequestResponseInfo rri, String width) 
{
	return imageWithThisWidthWithLinkToLandingPage(rri, width);
}
//-------------------------------------------------------------------
public String imageWithThisWidthWithLinkToLandingPage(RequestResponseInfo rri,  String string) 
{
	return "<img onClick='localSubmit("+Commands.REFRESH_INDEX_HTML+", \"\", \"\", \"webrtc_"+multiPurposeName(rri)+"_EXTRA_PAGE_1\")' src='"+domainImage(rri)+"' style='width:95%;max-width:"+string+";cursor:pointer'>";
}
//-------------------------------------------------------
public void ajuda(RequestResponseInfo rri) 
{
	
}
//--------------------------------------------------------------------
public void contribuir(RequestResponseInfo rri) {
	// TODO Auto-generated method stub
	
}
//--------------------------------------------------------------------
public void antesDeContribuir(RequestResponseInfo rri) 
{
	
}
//--------------------------------------------------------------------
public void teste(RequestResponseInfo rri) 
{
	
}
//--------------------------------------------------------------------
public void saberMais(RequestResponseInfo rri) 
{
	
}
//-----------------------------------------------------
public static WebRTChub getWebRTCapp(RequestResponseInfo rri, String nogoAppStr, boolean withDefault) 
{
	WebRTChub ba = null;
	
	
	switch(nogoAppStr)
	{
	case "flex25": ba = new Flex25();break;

	case "visitrue": ba = new VisiTrue(); break;
	case "portugalo": ba = new Portugalo(); break;
	case "images": 
	case "logos": 
	case "umniverse": ba = new UmniverseNogo(); break;
	case "talk2030": 
	case "goals": 
	case "goal0": ba = new Goals(); break;
	case "goal1": ba = new Goal1(); break;
	case "goal2": ba = new Goal2(); break;
	case "goal3": ba = new Goal3(); break;
	case "goal4": ba = new Goal4(); break;
	case "goal5": ba = new Goal5(); break;
	case "goal6": ba = new Goal6(); break;
	case "goal7": ba = new Goal7(); break;
	case "goal8": ba = new Goal8(); break;
	case "goal9": ba = new Goal9(); break;
	case "goal10": ba = new Goal10(); break;
	case "goal11": ba = new Goal11(); break;
	case "goal12": ba = new Goal12(); break;
	case "goal13": ba = new Goal13(); break;
	case "goal14": ba = new Goal14(); break;
	case "goal15": ba = new Goal15(); break;
	case "goal16": ba = new Goal16(); break;
	case "goal17": ba = new Goal17(); break;

	case "nogo": ba = new NoGo(); break;

	case "adventure": ba = new NoGoAdventure(); break;
	case "ar": ba = new NoGoAR(); break;
	case "arena": ba = new NoGoArena(); break;
	case "assistance": ba = new NoGoAssistance(); break;
	case "audience": ba = new NoGoAudience(); break;
	case "beach": ba = new NoGoBeach(); break;
	case "beer": ba = new NoGoBeer(); break;
	case "bike": ba = new NoGoBike(); break;
	case "birthday": ba = new NoGoBirthday(); break;
	case "boat": ba = new NoGoBoat(); break;
	case "brainstorm": ba = new NoGoBrainstorm(); break;
	case "breakfast": ba = new NoGoBreakfast(); break;
	case "brunch": ba = new NoGoBrunch(); break;
	case "bus": ba = new NoGoBus(); break;
	case "cafe": ba = new NoGoCafe(); break;
	case "call": ba = new NoGoCall(); break;
	case "car": ba = new NoGoCar(); break;
	case "class": ba = new NoGoClass(); break;
	case "company": ba = new NoGoCompany(); break;
	case "concert": ba = new NoGoConcert(); break;
	case "conference": ba = new NoGoConference(); break;
	case "consultation": ba = new NoGoConsultation(); break;
	case "contract": ba = new NoGoContract(); break;
	case "dance": ba = new NoGoDance(); break;
	case "date": ba = new NoGoDate(); break;
	case "day": ba = new NoGoDay(); break;
	case "dinner": ba = new NoGoDinner(); break;
	case "dive": ba = new NoGoDive(); break;
	case "doctor": ba = new NoGoDoctor(); break;
	case "drink": ba = new NoGoDrink(); break;
	case "event": ba = new NoGoEvent(); break;
	case "exhibition": ba = new NoGoExhibition(); break;
	case "expo": ba = new NoGoExpo(); break;
	case "fair": ba = new NoGoFair(); break;
	case "family": ba = new NoGoFamily(); break;
	case "flowers": ba = new NoGoFlowers(); break;
	case "forest": ba = new NoGoForest(); break;
	case "game": ba = new NoGoGame(); break;
	case "gym": ba = new NoGoGym(); break;
	case "hangout": ba = new NoGoHangout(); break;
	case "help": ba = new NoGoHelp(); break;
	case "hospital21": 
	case "hospital": ba = new NoGoHospital(); break;
	case "house": ba = new NoGoHouse(); break;
	case "hug": ba = new NoGoHug(); break;
	case "interview": ba = new NoGoInterview(); break;
	case "island": ba = new NoGoIsland(); break;
	case "kiss": ba = new NoGoKiss(); break;
	case "library": ba = new NoGoLibrary(); break;
	case "lion": ba = new NoGoLion(); break;
	case "love": ba = new NoGoLove(); break;
	case "lunch": ba = new NoGoLunch(); break;
	case "mall": ba = new NoGoMall(); break;
	case "market": ba = new NoGoMarket(); break;
	case "meal": ba = new NoGoMeal(); break;
	case "meditation": ba = new NoGoMeditation(); break;
	case "meeting": ba = new NoGoMeeting(); break;
	case "moon": ba = new NoGoMoon(); break;
	case "mountain": ba = new NoGoMountain(); break;
	case "nap": ba = new NoGoNap(); break;
	case "office": ba = new NoGoOffice(); break;
	case "park": ba = new NoGoPark(); break;
	case "picnic": ba = new NoGoPicnic(); break;
	case "pizza": ba = new NoGoPizza(); break;
	case "plane": ba = new NoGoPlane(); break;
	case "play": ba = new NoGoPlay(); break;
	case "poker": ba = new NoGoPoker(); break;
	case "prayer": ba = new NoGoPrayer(); break;
	case "ride": ba = new NoGoRide(); break;
	case "river": ba = new NoGoRiver(); break;
	case "rocket": ba = new NoGoRocket(); break;
	case "safari": ba = new NoGoSafari(); break;
	case "sea": ba = new NoGoSea(); break;
	case "service": ba = new NoGoService(); break;
	case "session": ba = new NoGoSession(); break;
	case "shopping": ba = new NoGoShopping(); break;
	case "song": ba = new NoGoSong(); break;
	case "sport": ba = new NoGoSport(); break;
	case "stand": ba = new NoGoStand(); break;
	case "stop": ba = new NoGoStop(); break;
	case "student": ba = new NoGoStudent(); break;
	case "study": ba = new NoGoStudy(); break;
	case "summit": ba = new NoGoSummit(); break;
	case "sunrise": ba = new NoGoSunrise(); break;
	case "sunset": ba = new NoGoSunset(); break;
	case "talk": ba = new NoGoTalk(); break;
	case "tea": ba = new NoGoTea(); break;
	case "teacher": ba = new NoGoTeacher(); break;
	case "time": ba = new NoGoTime(); break;
	case "train": ba = new NoGoTrain(); break;
	case "training": ba = new NoGoTraining(); break;
	case "tram": ba = new NoGoTram(); break;
	case "trip": ba = new NoGoTrip(); break;
	case "video": ba = new NoGoVideo(); break;
	case "visit": ba = new NoGoVisit(); break;
	case "walk": ba = new NoGoWalk(); break;
	case "wedding": ba = new NoGoWedding(); break;
	case "work": ba = new NoGoWork(); break;
	case "zoo": ba = new NoGoZoo(); break;

	case "talkisi": ba = new Talkisi(); break;
	case "pdfwalk": ba = new PDFwalk(); break;
	case "nogoparty": ba = new NoGoParty(); break;
	case "aular": ba = new Aular(); break;
	case "classes3d" : ba = new Classes3D(); break;
	case "aratschool" :
	case "aratschool3d" : ba = new ARatSchool3D(); break;
	case "classgroom" : ba = new ClassGroom(); break;
	case "octaia": ba = new Octaia(); break;
	case "heptaia": ba = new Heptaia(); break;
	case "hexaia": ba = new Hexaia(); break;
	case "pentaia": ba = new Pentaia(); break;
	case "tetraia": ba = new Tetraia(); break;
	case "triaia": ba = new Triaia(); break;
	case "eupasseio": ba = new EuPasseioCom(); break;
	case "omnatar": ba = new OmnatarHub(); break;
	case "worldesktop": ba = new WorlDesktop(); break;
	case "3desktop": ba = new ThreeDesktop(); break;
	case "tlh": ba = new TransLightHouses(); break;
	case "towalk": ba = new ToWalkMe(); break;
	case "zoomings": ba = new Zoomings(); break;
	case "utubeconf" : ba = new UtubeConf(); break;
	case "cantodaatalaia": ba = new CantoDaAtalaia(); break;
	case "omeuportugalcorrupto": ba = new OmeuPortugalCorrupto(); break;
	default: if(nogoAppStr.startsWith("nogo"))
		       {
				rri.temporaryString =  nogoAppStr;
				ba = new NoGoDescendant(); break;
		       }

		if(withDefault)
			ba = new WebRTChub();
		else
			return null;
	 } //switch
	
	ba.isTemporaryObject = true;
	return ba;
}
//------------------------------------------------------------------------
public String webrtcButtonColor() 
{
	return "#fff";
}
//-------------------------------------------------------------
public String buttonTextCreateMeeting(RequestResponseInfo rri) 
{
	return TL.transLang(rri, "create meeting");
}
//-------------------------------------------------------------
public String buttonTextEnterMeeting(RequestResponseInfo rri) 
{
	return TL.transLang(rri, "enter meeting");
}
//-----------------------------------------------------
public String htmlForWebrtcBottomBarCreateMeeting(RequestResponseInfo rri) 
{
	return "";
}
//-----------------------------------------------------------------
public String htmlForWebrtcBottomBar(RequestResponseInfo rri) 
{
	return "<div style='width:100%;background-color:#ffa'><a " + onClickChangeDevices(rri)+">" + TL.transLang(rri, "available devices") + "</a></div>";
}
//-----------------------------------------------------------------
public static void manifestCall(RequestResponseInfo rri, String host, String domainNameInHost, StructureForManifestData structureForManifestData) 
{
	WebRTChub webRTC = getWebRTCapp(rri, domainNameInHost, true);
	webRTC.manifestCallREALLY(rri, host, domainNameInHost, structureForManifestData);
}
//-----------------------------------------------------------------
public void manifestCallREALLY(RequestResponseInfo rri, String host, String domainNameInHost,
		StructureForManifestData structureForManifestData) 
{
	
	structureForManifestData.name = nameForPWA(rri);
	structureForManifestData.shortName = shortNameForPWA(rri);
	structureForManifestData.description = descriptionForPWA(rri);
	structureForManifestData.svgIcon = svgIconForPWA(rri);
	
	String png = pngForPWA(rri);
	if(png != null)
	{
		structureForManifestData.png16x16 = png+"16x16.png";
		structureForManifestData.png32x32 = png+"32x32.png";
		structureForManifestData.png36x36 = png+"36x36.png";
		structureForManifestData.png48x48 = png+"48x48.png";
		structureForManifestData.png60x60 = png+"60x60.png";
		structureForManifestData.png72x72 = png+"72x72.png";
		structureForManifestData.png96x96 = png+"96x96.png";
		structureForManifestData.png120x120 = png+"120x120.png";
		structureForManifestData.png144x144 = png+"144x144.png";
		structureForManifestData.png152x152 = png+"152x152.png";
		structureForManifestData.png180x180 = png+"180x180.png";
		structureForManifestData.png192x192 = png+"192x192.png";
		structureForManifestData.png512x512 = png+"512x512.png";
	}
	
}
//-----------------------------------------------------------
public String png16x16ForPWA(RequestResponseInfo rri) 
{
	String s = pngForPWA(rri);
	if(s != null)
	  return s + "16x16.png";
	return null;
}
//-----------------------------------------------------------
public String png192x192ForPWA(RequestResponseInfo rri) 
{
	String s = pngForPWA(rri);
	if(s != null)
	  return s+"192x192.png";
	return null;
}
//-----------------------------------------------------------
public String png32x32ForPWA(RequestResponseInfo rri) 
{
	String s = pngForPWA(rri);
	if(s != null)
	  return s+"32x32.png";
	return null;
}
//--------------------------------------------------------------------
public String svgIconForPWA(RequestResponseInfo rri) 
{
	return domainImage(rri);
}
//--------------------------------------------------------------------
public String descriptionForPWA(RequestResponseInfo rri) 
{
	return TL.transLangNow(rri, "Intelligent Video Conference", TL.E_UK);
}
//--------------------------------------------------------------------
public String nameForPWA(RequestResponseInfo rri) 
{
	if(rri.indexHTML_ogTitle != null && rri.indexHTML_ogTitle.length() > 0) 
		return rri.indexHTML_ogTitle;
	String s = multiPurposeName(rri);
	return s.length() < 2 ? s :  Character.toUpperCase(s.charAt(0)) + s.substring(1);
}
//--------------------------------------------------------------------
public String shortNameForPWA(RequestResponseInfo rri) 
{
	return nameForPWA(rri);
}
//----------------------------------------
public String imageOfObjectOnlyURL(RequestResponseInfo rri, String size) 
{
	if(isTypeNotObject)
	{
	String path = pngForPWA(rri);
	if(path != null && path.length() > 0)
	  {
		  if(MyImageManager.pngSizes.contains(size))
				return path + size + "x"+size+".png";
		  else if(MyImageManager.pngSizesPX.contains(size))
				return path + size.substring(0, size.length() - 2) + "x" + size.substring(0, size.length() - 2) +".png";
	  }
	}
	
	return  svgIconForPWA(rri) ;
}
//----------------------------------------
@Override
public boolean userNotLoggedInCanAccess(RequestResponseInfo rri)
{
return true;
}
//----------------------------------------
public static String getFavIcons(RequestResponseInfo rri, String appName) 
{
	WebRTChub webRTChub = getWebRTCapp(rri, appName, true);
	if(webRTChub == null)
		return null;
	
	String s = "";
	String png = webRTChub.png16x16ForPWA(rri);
	if(png != null)
		{
		s += "<link rel='icon' type='image/png' href='"+png+"' sizes='16x16'>\n";
		if(rri.reqGetHeader("User-Agent").indexOf("Safari") != -1)
			 rri.respWriterPrint("<link rel='apple-touch-icon' type='image/png' href='"+webRTChub.png192x192ForPWA(rri)+"' >\n");
		}
	png = webRTChub.png32x32ForPWA(rri);
	if(png != null)
		s += "<link rel='icon' type='image/png' href='"+png+"' sizes='32x32'>\n";
			
	if(rri.requestLimitedParam == null)
		rri.requestLimitedParam = new HashMap();
	rri.requestLimitedParam.put("nameForHeadTitle", webRTChub.nameForHeadTitle(rri));
	
	return s;
		
	
}
//-------------------------------------------------------------
public static void returnAIAbottomBar(RequestResponseInfo rri, int fromNumber) 
{
	
String s = "<table style='width:100%'><tr>";
for(int i = 9; i >= 2; i--)	
  s += "<td onClick='localSubmit("+Commands.REFRESH_INDEX_HTML+", \"\", \"\", \"webrtc_"+NAMES_OF_AIA[i]+"_" + (i == fromNumber ? "landingPage" : "ajuda") + "\")' style='cursor:pointer;font-size:150%;color:"+COLORS_OF_AIA[i]+"'><b>&nbsp;"+ (i == 9 ? "N" : (i == 2 ? "Z" : i)) +"<nobr>&nbsp;" + (i == fromNumber ? (i == 9 ? "STOP" : TL.transLang(rri, (i == 2 ? "sessions" : "facets"))) +" &nbsp;</b></nobr>" : "" ) +  "</b></td>";
s += "</tr></table>";

rri.returnBottomBarForNextDIV(null, s);

}
//---------------------------------------------------------------
public String nameForHeadTitle(RequestResponseInfo rri) 
{
	return shortNameForPWA(rri);
}
//-------------------------------------------------------------------
public String[] photos()
{
	return photosOfLandingPage();
}
//-----------------------------------------------------------------
public String[] photosOfLandingPage()
{
	return null;
}
//-------------------------------------------------------------------
public String commonKeyWords()
{
	return null;
}
//-----------------------------------------------------------------
public String htmlForSearchingDomainsAndWalks(RequestResponseInfo rri, String uuid) 
{
	if(uuid == null)
		uuid = UUID.randomUUID().toString();
	
	String data = rri.clientDataString(varIDmainSearch, "");
	rri.returnClientDataAndSetNow(varIDmainSearch, data);

	if(data != null && data.length() > 0)
		rri.returnEVALlast("filterDivsByText(\".divs_find_nogo_main_"+uuid+"\",\".text_find_nogo_main_"+uuid+"\", \""+data+"\")");

	String searchNow = "filterDivsByText(\".divs_find_nogo_main_"+uuid+"\",\".text_find_nogo_main_"+uuid+"\", value)";
	
	return "<b style='color:#c9211e'><a onClick='addDataFromClient(\""+ varIDmainSearch +"\",\"\");$(\"#input_search_"+uuid+"\").val(\"\");let value=\"\";"+searchNow+"' style='color:"+ webrtcButtonBackgroundColor() +"'>" + TL.transLang(rri, "all") + "</a> &nbsp; &nbsp; "
		+ " <input id='input_search_"+uuid+"' type='text' oninput='' onkeyup='addDataFromClient(\""+ varIDmainSearch +"\",this.value);  if(event.keyCode == 13)clickNextButton(this); else {let value=this.value;"+searchNow+"}' value='"+ UtilitiesUsingHTML.replaceCharsForInsideQuotes(data)+"' style='width:8em' placeholder='"+TL.transLang(rri, "search")+"'> &nbsp;"
		+ "<a onClick='localSubmit("+Commands.REFRESH_INDEX_HTML+", \"\", \"\", \"webrtc_towalk_EXTRA_PAGE_2\",$(\"#input_search_"+uuid+"\").val())' style='color:"+webrtcButtonBackgroundColor()+"'> &nbsp; <b>+</b> &nbsp; </a></b>";
}
//-------------------------------------------------------------------------------------------------
@Override		
public Object actedByTypeClicked(RequestResponseInfo rri, String objectID, String parameterString, Object parameterLong, BaseApp otherBaseAppCalling) 
		{  //return Object is to allow easy return of information
		
	
		if(parameterString.startsWith("NEW_MEETING_LINK "))
			newMeetingLinkFromClient(rri, parameterString.substring("NEW_MEETING_LINK ".length()));
		
		
		return true;
		}
//-------------------------------------------------------------------------------------------------
private void newMeetingLinkFromClient(RequestResponseInfo rri, String meetingLink) 
{
	meetingLink = Primiti.decodeURIcomponent(meetingLink);
	
	int pos = meetingLink.indexOf("://");
	meetingLink = meetingLink.substring(pos == -1 ? 0 : pos + 3);
	if(meetingLink.indexOf("www.") == 0)
		meetingLink.substring(4);
	pos = meetingLink.indexOf('.');
	String domain = meetingLink.substring(0, pos);

	String appIDorParameter = null;

	if(rri.myGetParameterValues == null)
		rri.myGetParameterValues = new HashMap();
	
	pos = meetingLink.indexOf("?meet=");
	if(pos != -1)
	{
		int pos2 = meetingLink.indexOf("&");
		rri.myGetParameterValues.put("meet", meetingLink.substring(pos + 6, pos2 == -1 ? meetingLink.length() : pos2));
		if(pos2 != -1)
		  {
			meetingLink = meetingLink.substring(pos2);
			pos = meetingLink.indexOf("&ap=");
			if(pos != -1)
			{
				rri.myGetParameterValues.put("ap", meetingLink.substring(pos + 4, meetingLink.length()));
				if(pos2 != -1)
					{
					//more parameters?
					}
			}
		  }
		
	}
		
	WebRTChub.indexHtmlCall(rri, "webrtc_"+domain+"_landingPage", appIDorParameter, null, null);
	
}
//------------------------------------------------------------------------------------
public static String menuToStartVideoConference(RequestResponseInfo rri, String string) 
{
	String s = "<input type='email' onkeyup='if(event.keyCode == 13)clickNextButton(this)' placeholder='email' style='width:12em'><button onClick='let email=textFromPreviousInput(this);if(validateEmail(email))localSubmit(WEBRTC_MEETINGS_COMMANDS, undefined, undefined, \"CREATE_MEETING_WITH_EMAIL\", email)'> "+  TL.transLang(rri, "invite") + "</button>";
	return s;
}
}//class

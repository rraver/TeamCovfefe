
var config = {
   apiKey: "AIzaSyBnVbeHWg5GXx0Q3L5VoNmOIo0fb2dkB0Q",
   authDomain: "friendlychat-a9489.firebaseapp.com",
   databaseURL: "https://friendlychat-a9489.firebaseio.com",
   projectId: "friendlychat-a9489",
   storageBucket: "friendlychat-a9489.appspot.com",
   messagingSenderId: "843261480374"
 };
 firebase.initializeApp(config);

var messagesRef = firebase.database().ref();

var userName = "";
var email = "";
var uid   = "";

var activeChatRoom = "general_channel";
var inActiveChatRooms = {general: [], dogs: [], cats:[]};

/** Helper function to return Random Number between min and max **/
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function populateUserName() {
  firebase.auth().onAuthStateChanged(function(user) {
    userName = sessionStorage.getItem("userName");
    email = sessionStorage.getItem("email");
    uid = sessionStorage.getItem("uid");
    if (null==userName || null==email || null==uid) {
        userName = user.displayName;
        email = user.email;
        uid = user.uid;
        sessionStorage.setItem("userName", userName);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("uid", uid);
    }
  });
}

function publishMessage() {
    var message = $("#txtMainChat").val().trim();
    if (message.length==0) return;
    if (userName.length==0) return;
    if (activeChatRoom.length==0) return;
    var timeStamp = moment().valueOf();
    messagesRef.push({userName:userName, message:message, email: email, uid: uid, timeStamp: timeStamp, chatRoom: activeChatRoom});
    $("#txtMainChat").val("");
}

function publishLocationMessage(pos) {
  var timeStamp = moment().valueOf();
  messagesRef.push({userName:userName, message: "LAT: " + pos.lat + " LAN " + pos.lng, email: email, uid: uid, timeStamp: timeStamp, chatRoom: "maps_channel", lat: pos.lat, lng: pos.lng});
}

function addNewChannel() {
  var channelName = prompt("Please enter new channel name");
  var timeStamp = moment().valueOf();
  messagesRef.push({userName:userName, message:channelName, email: email, uid: uid, timeStamp: timeStamp, chatRoom: "newChannel"});
}

messagesRef.limitToLast(100).on("child_added", function (newMessage) {
  var message = newMessage.val();
  addMessageToInAciveMessages(message);
  if (message.chatRoom==activeChatRoom) {
    addMessageToMessagesPane(message);
  }
});

var mapRef = null;
function switchActiveChat() {
    activeChatRoom = $(this).attr("id");
    $("#ChatHeading").text($(this).data("heading"));
    $("#messBox").empty();
    if (activeChatRoom == "maps_channel") {
        if (null==mapRef) {
          mapRef = $("#map");
        }
        if ($("#map").parent().attr("id")=="mapholder") {
          $("#messBox").append($(mapRef));
        } else {
          $("#mapholder").append(mapRef);
        }
    } else {
        var inActiveChatRoomMessages = [];
        if (activeChatRoom in inActiveChatRooms) {
           inActiveChatRoomMessages = inActiveChatRooms[activeChatRoom];
           for(var i=0; i<inActiveChatRoomMessages.length; i++) {
              addMessageToMessagesPane(inActiveChatRoomMessages[i]);
           }
        }
  }
}

function addMessageToInAciveMessages(message) {
    //console.log(message);
    var inActiveChatRoomMessages = [];
    var chatRoom =getChatRoom(message);
    //console.log(message.chatRoom + "  " + chatRoom);
    if (null==chatRoom) return;

    if (chatRoom in inActiveChatRooms) {
        inActiveChatRoomMessages = inActiveChatRooms[chatRoom];
        inActiveChatRoomMessages.push(message);
    } else {
      inActiveChatRoomMessages.push(message);
    }

    inActiveChatRooms[chatRoom] = inActiveChatRoomMessages;
    updateInActiveChatRoomDisplay(chatRoom, inActiveChatRoomMessages.length);
}

function getChatRoom(message) {
  var chatRoom = null;
  if (message.chatRoom.endsWith("newChannel")) {
    console.log(message.message);
    createChannel(message.message);
  } else if (message.chatRoom.endsWith("maps_channel")) {
      var pos = {
        lat: message.lat,
        lng: message.lng
      };
      showFriendLocation(pos, message.userName, message.uid);
  } else  if (message.chatRoom.endsWith("_channel")) { // display friends messages under channel only.
    chatRoom = message.chatRoom;
  }else if (message.uid != uid && message.chatRoom == uid) { // display friends DM under friends chat room.
      chatRoom = message.uid;
  } else if (message.uid == message.chatRoom && message.uid != uid) { // display my personal message to only me
      chatRoom = null;
  } else if (message.uid == message.chatRoom && message.uid == uid) { // display my personal message under my chat room.
      chatRoom = uid;
  } else {
      chatRoom = message.chatRoom;
      console.error("Check why we are in else condition " + chatRoom + " \n " + message);
  }
  return chatRoom;
}

function updateInActiveChatRoomDisplay(inActiveChatRoom, messageCount) {
    $("#"+inActiveChatRoom+"_badge").text(messageCount);
}

function addMessageToMessagesPane(message) {
  var media = $("<div>");
  media.addClass("media");

  var divMedia = $("<div>");
  divMedia.addClass("media-left media-top");

  var img = $("<img>");
  img.attr("id", "avatar");
  img.attr("src", "assets/images/avatarImage.png");
  img.addClass("media-object");
  img.attr("style", "width:60px");
  img.attr("vertical-align","middle");
  img.attr("title", message.email);
  img.attr("alt", message.email);
  divMedia.append(img);

  var mediaBody = $("<div>");
  mediaBody.addClass("media-body");
  var h4 = $("<h4>");
  h4.addClass("media-heading");
  var span = $("<span>");
  span.attr("id","userId");
  span.text(message.userName);
  var small = $("<small> <i><span id = \"postTime\">"+moment(message.timeStamp).format("DD MMM YYYY hh:mm a")+"</span></i></small>");
  h4.append(span);
  h4.append(small);
  var messageSpan = $("<span>");
  messageSpan.text(message.message);
  mediaBody.append(h4);
  mediaBody.append(messageSpan);
  media.append(divMedia);
  media.append(mediaBody);

  $("#messBox").append(media);
  $("#messBox")[0].scrollTop = $("#messBox")[0].scrollHeight;
}

function createChannel(channelName) {
  var div = $("<div>");
  div.attr("id", channelName+"_channel");
  div.data("heading", "#"+channelName);
  div.data("messagecount","0");
  div.addClass("box ChatChannel");
  // var li = $("<li>");
  // li.addClass("leftMarg");
  // li.html("#" + channelName + "<span id="+channelName+"_channel_badge' class='badge badge-pill badge-primary'></span>");
  var span = $("<span id="+channelName+"_channel_badge' class='badge badge-pill badge-primary'></span>")
  div.append("#"+channelName);
  div.append(span);
  var br = $("<br><br>");
  div.append(br);
  $("#channels").append(div);
}

function handleIncomingMessageSuccess() {
  alert("handleIncomingMessageSuccess");
}

function handleIncomingMessageError() {
  alert("handleIncomingMessageError");
}

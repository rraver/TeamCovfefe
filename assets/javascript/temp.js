
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

/** Helper function to return Random Number between min and max **/
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function populateUserName() {
  firebase.auth().onAuthStateChanged(function(user) {
    userName = sessionStorage.getItem("userName");
    email = sessionStorage.getItem("email");
    if (null==userName || null==email) {
        userName = user.displayName;
        email = user.email;
        sessionStorage.setItem("userName", userName);
        sessionStorage.setItem("email", email);
    }
  });
}

function publishMessage() {
    var message = $("#txtMainChat").val().trim();
    if (message.length==0) return;
    var timeStamp = moment().valueOf();
    messagesRef.push({userName:userName, message:message, email: email, timeStamp: timeStamp});
    $("#txtMainChat").val("");
}

$("#btnMainChat").on("click", function (event) {
    event.preventDefault();
    publishMessage();
})

messagesRef.limitToLast(10).on("child_added", function (newMessage) {
  var message = newMessage.val();
  addMessageToMessagesPane(message);
});

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


function handleIncomingMessageSuccess() {
  alert("handleIncomingMessageSuccess");
}

function handleIncomingMessageError() {
  alert("handleIncomingMessageError");
}

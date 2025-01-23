var greeting = "I made it all the way to Round ";
var title    = "%23NSAgame -- 'Terrorist Threat or Harmless Phrase?'"
var siteURL  = "http://www.NSAgame.net";

function facebook(text) {
	popUp("https://www.facebook.com/dialog/feed?app_id=140586622674265&link=" + siteURL + "&name=" + "I made it " + text + "rounds in my new favorite game, " + title + "&redirect_uri=http%3A%2F%2Fs7.addthis.com%2Fstatic%2Fpostshare%2Fc00.html", 900,600);
}

function twitter(text) {
	popUp("https://twitter.com/intent/tweet?text=" + "I made it " + text + " rounds in my new favorite game, " + title + "&url=" + siteURL, 704, 260);
}

// create pop up windows
function popUp(url,_width,_height) {
	newwindow=window.open(url,'Sharing is Caring!','height=' + _height + ',width=' + _width);
	if (window.focus) {newwindow.focus()}
	return false;
}

function twitter2() {
	popUp("https://twitter.com/intent/tweet?text=" + "Check out my new favorite game, " + title + "&url=" + siteURL, 704, 260);
}

function facebook2() {
	popUp("https://www.facebook.com/dialog/feed?app_id=140586622674265&link=" + siteURL + "&name=" + "My new favorite game, " + title + "&redirect_uri=http%3A%2F%2Fs7.addthis.com%2Fstatic%2Fpostshare%2Fc00.html", 900,600);
}

function twitter3() {
	popUp("https://twitter.com/intent/tweet?text=" + "I won! Can you avoid being labeled a new terrorist in the new game, " + title + "&url=" + siteURL, 704, 260);
}

function facebook3() {
	popUp("https://www.facebook.com/dialog/feed?app_id=140586622674265&link=" + siteURL + "&name=" + "I made it all 10 rounds in my new favorite game, " + title + "&redirect_uri=http%3A%2F%2Fs7.addthis.com%2Fstatic%2Fpostshare%2Fc00.html", 900,600);
}
var badwords = new Array(); // store terrorist wordz
var goodwords = new Array(); // store innocuous words
var csv_file = new Array(); // for loadin' in dat file

var answer = ""; // to store correct answer!
var round = 1; // what round is it?
var chances = 4; // how many chances does the player get?
var chance = 0; // how many chances have been used?
var damage = 100 / chances; // % of evil takeover from wrong word
var health = 0; // health var, 0 being good, 100 being bad!
var total_rounds = 10;

var good_word = "";
var bad_word = "";
var bad_search = new Array(); // store bad words for wrong answer google search
var wordindex = 0; // what word are we using?

var globalTest = "";
var searchString = "";

// when document loads, generate database
$(document).ready(function () {

	$.ajax({
		type: "GET",
		url: "bad.csv",
		dataType: "text",
		success: function (data) {
			processBad(data);
		}
	});

	// (NEW) using Node/Express endpoint
	$.getJSON('/api/goodwords', function (response) {
		// 'response' is now an array of objects: [ {word: 'cat', cnt: 1}, {word: 'banana', cnt:2} ... ]

		// If you only want an array of words, you can map it:
		goodwords = response.map(item => item.word);

		placeWords();
	});

	// diagnostic testing stuff here...

});

// load CSV file and parse for words and syllables
// starting with BAD/real WORDS list
function processBad(allText) {
	csv_file = allText.split('\n');

	// csv file is now in an array, split into seperate word array and syllable array
	for (var i = 0; i < csv_file.length; i++) {
		badwords[i] = csv_file[i].toLowerCase(); // insert into terrorist word array
	}
	shuffle(badwords); // shuffle bad word array
	placeWords();
};

// now load in GOOD WORDS list
function processGood(allText) {
	csv_file = allText.split('\n');

	// csv file is now in an array, split into seperate word array and syllable array
	for (var i = 0; i < csv_file.length; i++) {
		goodwords[i] = csv_file[i]; // insert into terrorist word array
	}

	placeWords();
};

// place a good word and bad word in the spots
function placeWords() {
	// make sure both arrays are loaded in
	if (goodwords.length > 0 && badwords.length > 0) {
		// cool
	} else {
		// exit the function, yo!
		return 0;
	}

	// first figure out what words to use

	// determine 'good'/safe word by what round you are on
	// low end for round one is ZERO, for round two is TEN, so on...
	var lowerBound = Math.floor(((round - 1) / total_rounds) * goodwords.length);
	var upperBound = Math.min(Math.ceil((round / total_rounds) * goodwords.length), goodwords.length - 1);


	// let's at least make sure that we don't get the same word
	// twice in a row...
	var temp_word = good_word;
	// loop until we get a new word
	let retries = 10; // Limit retries to 10 attempts
	do {
		var randomWord = randomFromInterval(lowerBound, upperBound - 1);
		good_word = goodwords[randomWord];
		retries--;
	} while (temp_word === good_word && retries > 0);

	//console.log(good_word + " : " + randomWord);

	// for now, use index and a shuffled array for both to prevent repeats
	bad_word = badwords[wordindex];

	wordindex++; // next word for next time.
	// loop it in case someone is gettin' real addicted to this game
	if (wordindex > badwords.length) wordindex = 0;

	// flip a coin, 0 or 1
	var coinflip = Math.round(Math.random());

	if (coinflip == 0) {
		$("#word_left").html(good_word);
		$("#word_right").html(bad_word);
		answer = "word_left"; // set answer variable to compare later
	} else {
		$("#word_left").html(bad_word);
		$("#word_right").html(good_word);
		answer = "word_right"; // set answer variable to compare later
	}

}

// player has clicked a word, are they right or wrong?
$(".word").click(function () {

	// see if it's the right word
	var check = $(this).attr("id");

	if (check == answer) {
		// User DID guess the correct word
		document.getElementById('ding').play(); // play good sound
		// advance round and show it
		round++;
		showCount();

		// did they win
		if (round < total_rounds + 1) {
			// no, place new words
			placeWords();
		} else {
			// User won!
			document.getElementById('ding2').play(); // play good sound
			$(".hide4").fadeIn(300);
		}


	} else {
		// User did NOT guess the correct word
		// play annoying sound
		document.getElementById('womp').play();

		// advance evilness
		health += damage;
		$("#left").width(health + "%");

		// record bad word
		bad_search[chance] = bad_word;
		chance++;

		// save the fake NSA word they guessed to SQL database
		// for some reason this requires a .toString()
		$.ajax("/api/log", {
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({
				word: good_word
			})
		});


		if (health > 99) {
			// player loses! open up frame with bad search words
			$(".hide").fadeIn(300);

			// google it for them
			googleItForThem();

		}
		placeWords();
	}

});

function hidePop() {
	// trying again! reset stuff
	round = 1;
	chance = 0;
	health = 0;
	placeWords();
	showCount();
	$("#left").width(0 + "%");

	// fade out curtain
	$(".hide").fadeOut(300);
}

function showInstructions() {
	// oh so the user wants to see instructions, eh?
	$(".hide2").fadeIn(200);
}

function hideInstructions() {
	// oh so the user wants to hide instructions, eh?
	$(".hide2").fadeOut(200);
}

function showAbout() {
	// oh so the user wants to see the about page, eh?
	$(".hide3").fadeIn(200);
}

function hideAbout() {
	// oh so the user wants to hide the about page?
	$(".hide3").fadeOut(200);
}

function hideVictory() {
	// oh so the user wants to hide the victory page?
	$(".hide4").fadeOut(200);
	hidePop();
}

function showCount() {
	// display what round we're on
	$("#round").empty().html("ROUND " + round);
}

// detect user keypresses
$(document).keyup(function (e) {

	if (e.keyCode == 27) {
		// esc ... close all open popups
		hidePop();
		hideInstructions();
		hideAbout();
		hideVictory();
	}
});

// used to shuffle word array and prevent re-picks
function shuffle(array) {
	var currentIndex = array.length,
		temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

var fakeMouse = $("#fake_mouse");
var inputField = $("#g_search");
// animate google search
function googleItForThem() {

	$("body").css("cursor", "wait");
	fakeMouse.show();
	fakeMouse.animate({
		top: inputField.offset().top + 15,
		left: inputField.offset().left + 15
	}, 800, 'swing', function () {
		inputField.focus();
		fakeMouse.animate({
			top: "+=18px",
			left: "+=10px"
		}, 'fast');
		inputField.attr('value', "");
		type(bad_search.join(" "), 0);
	});
}

function type(string, index) {
	searchString = string;
	var val = string.substr(0, index + 1);
	inputField.val(val);
	if (index < string.length) {
		setTimeout(function () {
			type(string, index + 1);
		}, Math.random() * 100);
	} else {
		// execute search
		window.open("http://www.google.com/search?q=" + string);
		// put shit back
		fakeMouse.hide();
	}
}

// user goes forward with google search
function gSearch() {
	var fullString = "http://www.google.com/search?q=" + searchString;
	//alert(fullString);
	window.open(fullString, "_blank");
}

function addWord(string) {
	// user wants to submit a new word to the DB
	function addWord(newWord) {
		$.ajax("/api/new", {
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({ word: newWord })
		}).done(res => {
			console.log("New word added:", res);
		});
	}
	// reset game after word submission
	hideVictory();
}

// better random function
function randomFromInterval(from, to) {
	return Math.floor(Math.random() * (to - from + 1) + from);
}
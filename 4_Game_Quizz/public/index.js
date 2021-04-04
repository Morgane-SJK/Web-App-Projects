		
//PLAYER PART

function registerUser(){
    let input = document.getElementById('username_field')
    let user_message = document.getElementById('user_message')
    if(input.value.length >= 3){
        username = input.value
        user_message.innerHTML = `You are now logged in as : <b>${username}</b>`
		
		//We reset the game
		document.getElementById("scorepart").innerHTML="";
		
		const fetchOptions = {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		};
		fetch('/displaygame', fetchOptions)
			.then(function(response){
				if (response.status!=200){
					console.log("Error: " + response.status);
				}
				else{
					response.json().then(function(games){
						let questions="";
						//We shuffle the games JSON in order to have a random order of questions
						games=shuffle(games);

						//We display 10 questions
						for (let i=0; i<10;i++)
						{
							if (i<games.length){
								questions+="<img src='"+games[i]['Image_URL']+"' width='50%'/><br>"
								  +"<label>What is the name of this game ? </label>"
								  +"<br><input type='text' id='answer"+i+"' placeholder='Your answer...'>"
								  +"<br><label id='id"+i+"' class='hidden'>"+games[i]['ID']+"</label><br>";	
							}
							else{
								questions+="<p>Sorry, we don't have enough games to propose to you. You won't be graded on 10.</p>";
								break;
							}
						}	
						document.getElementById("gamepart").innerHTML="<h3>You can start the quizz ! It is made of 10 questions.</h3>"
																	 +questions
																	 +"<br><button id='submit_answers' onclick='AnswerQuizz()'>Submit my answers</button>";
					});
				}
			});
		}
			
    else{
        username = input.value
        user_message.innerHTML = `You are no longer registered. Register to be able to play the quizz`
		document.getElementById('gamepart').innerHTML="";
    }
}

//Shuffle a JSON document (games) in order to propose questions in a random order
function shuffle(sourceArray) {
    for (var i = 0; i < sourceArray.length - 1; i++) {
        var j = i + Math.floor(Math.random() * (sourceArray.length - i));

        var temp = sourceArray[j];
        sourceArray[j] = sourceArray[i];
        sourceArray[i] = temp;
    }
    return sourceArray;
}

//When the user submits his answers
function AnswerQuizz(){
	var score=0;
	
	const fetchOptions = {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		};
	fetch('/displaygame', fetchOptions)
		.then(function(response){
			if (response.status!=200){
				console.log("Error: " + response.status);
			}
			else{
				response.json().then(function(games){
					
					//We check each questions of the form to update the score
					for (let i=0; i<10;i++)	
					{	
						//Get the id of the game of question i
						let id_game= document.getElementById('id'+i);
						if (id_game==null){
							//console.log("We looked at every questions");
							break;
						}
						else{
							//Get the answers of the player
							let answer= document.getElementById('answer'+i).value;
							
							//Check if the answer is good by looking at the games in the collection
							for (let j=0; j<games.length;j++){
								if (games[j]['ID']==id_game.textContent){
									
									//Create a regex for the name of the game : case insensitive
									const gamenameregex = new RegExp(games[j]['Name'],'i'); //case insensitive
									if (answer.match(gamenameregex)){
										//console.log("Good answer so we update the score");
										score+=1;
										break;
									}
								}
							}
						}
					}
					//We create a player in the player_collection to put the score
					newplayer={};
					newplayer['Username']=username;
					newplayer['Score']=score;
					var date = new Date();
					var play_date = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
					newplayer['Date']=play_date;
					//console.log(newplayer);
					const fetchOptionsPostPlayer = {
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(newplayer)
					};
					fetch('/pushplayer', fetchOptionsPostPlayer).then(onResponse).then(onTextReady);
					

					let podium="";
					//We display the top 10 players
					fetch('/displayplayers', fetchOptions)
						.then(function(response){
							if (response.status!=200){
								console.log("Error: " + response.status);
							}
							else{
								response.json().then(function(players){
									//We sort the players in descending order thanks to their score
									players.sort(function(a,b){
										return b.Score - a.Score;
									});
									//We look at maximum 10 players
									for (let i=0; i<10; i++){
										if(i>=players.length){
											break;
										}
										else{
											podium+="<li>"+players[i]['Username']+"</li>"+"<span>Score="+players[i]['Score']+"</span>"
																						 +"<br><span>Date="+players[i]['Date']+"</span>";
										}
									}
									//We display the score of the player and the podium
									document.getElementById('scorepart').innerHTML="<p>Your score is : "+score+"/10 ! Below is the TOP 10 players.</p>"
																				   +"<ol>"+podium+"</ol>";
								});
							}
					
						});
					
				});
			}
		});
	
}


//ADMIN PART

function displayQuestions(){
	const fetchOptions = {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	};
	fetch('/displaygame', fetchOptions)
		.then(function(response){
			if (response.status!=200){
				console.log("Error: " + response.status);
			}
			else{
				response.json().then(function(games){
					let div_games="";
					
					for (let i=0; i<games.length;i++){
						div_games+="<li>"+games[i]['Name']+"</li>"+"<img src='"+games[i]['Image_URL']+"' width='50%'/><br>"
								 +"<button type='submit' onClick='deleteQuestion("+games[i]['ID']+")'>Delete this question</button>";
					}
					document.getElementById("questions").innerHTML="<ol>"+div_games+"</ol>";
				});
			}
		});
}

function createQuestion(){
	let div = document.createElement("div");
	div.innerHTML= "<br><label for='newgame_name'>Name of the new game : </label> <input type='text' id=newgame_name placeholder='Enter name'>"
				  +"<br><br><label for='newgame_url'>Image of the new game : </label> <input type='text' id=newgame_url placeholder='Enter valid URL'>"
				  +"<br><br><button type='submit' onClick='submitQuestion()'>Submit this game</button>"
				  +"<br><label id='success_submit'> Not send yet </label>";
	document.getElementById("createQuestions").appendChild(div);
	document.getElementById("create_question").disabled="disabled";
}

function onResponse(response) {
    return response.text();
}

function onTextReady(text) {
    console.log("text: ",text);
}

function deleteQuestion(game_id){
	send_game_id={};
	send_game_id['Id']=game_id;
	const fetchOptions = {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(send_game_id)
	};
	fetch('/deletegame', fetchOptions).then(onResponse).then(onTextReady);
	
	//reload the page after 0.5s 
	setTimeout(() => {
	window.location.href=window.location.href;
	}, 500)
}

function submitQuestion(){
	let check_valid_url=false;
	let name_game = document.getElementById('newgame_name');
	let image_game = document.getElementById('newgame_url');
	let display = document.getElementById('success_submit');
	
	const valid_url = new RegExp("((http|https)://)(www.)?"+"[a-zA-Z0-9@:%._\\+-~#?&//=]+"+".(jpg|jpeg|png)$");
	
	//Check if the URL is valid and the name is complete
	if ((image_game.value).match(valid_url) && name_game.value.length>2){
		document.getElementById("create_question").disabled=false;
		display.innerHTML="The new game has been successfully sent to the questions database.";
		newgame={};
		let game_id= Date.now();
		newgame['ID']=game_id;
		newgame['Name']=name_game.value;
		newgame['Image_URL']=image_game.value;
		console.log("new game=", newgame);
		const fetchOptions = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(newgame)
		};
		fetch('/pushgame', fetchOptions).then(onResponse).then(onTextReady);
		//reload the page
		window.location.href=window.location.href;
	}
	else{
		display.innerHTML="You must enter a valid URL and a complete name.";
	}
}

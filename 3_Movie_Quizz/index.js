const base = "https://api.themoviedb.org/3/search/movie?";
const base2 = "https://api.themoviedb.org/3/movie/";
const api_key="api_key=ec7e5bf5bc093991d7bbe42470e3525d";
const image_url="https://image.tmdb.org/t/p/w300/"
let list_of_movies=[];
let list_of_director_actor=[];
let index=1;
let form_id_input='answer';
let form_id_button='button';
let form_id_label='wrong';



//FIRST MOVIE TO BE DISPLAYED - onload - i chose the movie Inception
function StartQuizz(){
	const query="query=inception";
	const url = base + api_key + "&" + query;
	
	fetch(url).then(function(response){
		if (response.status!=200){
			console.log("Error: " + response.status);
		}
		else{
			response.json().then(function(data){
				const movie = data.results[0];
				list_of_movies.push(movie.id);
				const title = movie.title;
				const release_date = movie.release_date
				const poster_url = image_url+movie.poster_path
				document.getElementById("startquizz").innerHTML="<h2>"+title+"</h2><p>Release date : "+release_date+"</p><img src= '"+poster_url+"' width='150'>";
			});
		}
	});
}


//When we have to answer "who directed or played in this movie?"
function AnswerActorDirector(){
	
	const answer=document.getElementById(form_id_input).value;
	const movieid=list_of_movies[list_of_movies.length-1]; //we look at the last movie (the one which corresponds to the question)
	const url = base2 + movieid + "/credits?" + api_key
	let directorok="false";
	let actorok = "false";
	
	fetch(url).then(function(response){
		if (response.status!=200){
			console.log("Error: " + response.status);
		}
		else{
			response.json().then(function(data){
				
				//look for the directors
				for (let i=0; i<data.crew.length; i++)
				{
					if (data.crew[i].job === 'Director'){
						const directorname=data.crew[i].name;
						const directornameregex = new RegExp(directorname,'i'); //case insensitive

						if (answer.match(directornameregex)){
							directorok="true";
							list_of_director_actor.push(directorname);
							const directorimage=image_url+data.crew[i].profile_path;
							var messagetodisplay="<p>It's a good answer !! :) <br>"+directorname+" directed this movie ! <br><br>"+"<img src= '"+directorimage+"' width='150'>";
							var messagetodisplay2="Give another movie directed by "+directorname+" !";
							break;
						}
					}
				}

				if (directorok=="false"){
				//look for the actors
					for (let i=0; i<data.cast.length; i++)
					{
						const actorname=data.cast[i].name;
						const actornameregex = new RegExp(actorname, 'i'); //case insensitive
						
						if (answer.match(actornameregex)){
							actorok="true";
							list_of_director_actor.push(actorname);
							const actorimage=image_url+data.cast[i].profile_path;
							var messagetodisplay="<p>It's a good answer !! :) <br>"+actorname+" was actor in this movie ! <br><br>"+"<img src= '"+actorimage+"' width='150'>";
							var messagetodisplay2="Give another movie in which "+actorname+" played !";
							break;
						}
					}
				}
					
				if (actorok=="false" && directorok=="false") {
					document.getElementById(form_id_label).innerHTML="   Wrong answer";	
				}
				else {
					document.getElementById(form_id_button).disabled="disabled";
					document.getElementById(form_id_label).innerHTML=""; //remove the "Wrong answer"
					
					//Add the answer
					let div = document.createElement("div");
					div.innerHTML=messagetodisplay;
					document.getElementById("main").appendChild(div);

					//Add a new form
					let div2=document.createElement("div");
					div2.id="test";
					index+=1;
					form_id_input='answer'+index;
					form_id_button='button'+index;
					form_id_label='wrong'+index;
					div2.innerHTML=	"<form action='#' onsubmit='AnswerMovie(); return false'><label for="+form_id_input+">"+messagetodisplay2+"</label><br><input type='text' id="+form_id_input+" placeholder='Your answer..'> <input type='submit' value='Submit' id="+form_id_button+"><label class='incorrect' id="+form_id_label+"> </label></form>";
					document.getElementById("main").appendChild(div2);
				}	

			});
		}
	});
	
}


//When we have to answer "who directed or played in this movie ?"
function AnswerMovie(){
	//First, we look if the movie given exists and get its informations
	const answer=document.getElementById(form_id_input).value;
	const query="query="+answer;
	const url1 = base + api_key + "&" + query;
		
	//Then we look if the last actor (or director) given well played (or directed) in this movie
	let url2="";
	const last_director_actor = list_of_director_actor[list_of_director_actor.length-1];
	let directorok="false";
	let actorok="false";
	
	fetch(url1).then(function(response){
		if (response.status!=200){
			console.log("Error: " + response.status);
		}
		else{
			response.json().then(function(data){
				const movie = data.results[0];
				const movieid=movie.id;
				
				//Check if there was already a question about this movie
				if (list_of_movies.includes(movieid)){
					document.getElementById(form_id_label).innerHTML="<br>Sorry, you can't enter a movie for which you already had questions ! Try another one ;)";
				}
				else{
					list_of_movies.push(movieid);
					const moviename=movie.title;
					const moviedate=movie.release_date;
					const movieurl=image_url+movie.poster_path;
					url2= base2 + movieid + "/credits?" + api_key
					
					fetch(url2).then(function(response) {
						if (response.status!=200){
							console.log("Error: " + response.status);
						}
						else{
							response.json().then(function(data){
								
								//look for the directors
								for (let i=0; i<data.crew.length; i++)
								{
									if (data.crew[i].job === 'Director'){
										if (data.crew[i].name === last_director_actor){
											directorok="true";
											var messagetodisplay="<p>It's a good answer !! :) <br>"+last_director_actor+" also directed this movie !<h2>"+moviename+"</h2><p>Release date : "+moviedate+"</p><img src= '"+movieurl+"' width='150'>";
											var messagetodisplay2="Give an actor who played in this movie !";
											break;
										}
									}
								}
								
								if (directorok=="false"){
									//look for the actors
									for (let i=0; i<data.cast.length; i++)
									{
										if (data.cast[i].name === last_director_actor){
											actorok="true";
											var messagetodisplay="<p>It's a good answer !! :) <br>"+last_director_actor+" was also actor in this movie !<h2>"+moviename+"</h2><p>Release date : "+moviedate+"</p><img src= '"+movieurl+"' width='150'>";
											var messagetodisplay2="Give the director or another actor who played in this movie !"
											break;
										}
									}
								}
								
								if (actorok=="false" && directorok=="false") {
									document.getElementById(form_id_label).innerHTML="   Wrong answer";	
								}
								else {
									document.getElementById(form_id_button).disabled="disabled";
									document.getElementById(form_id_label).innerHTML="";
									
									//Add the answer
									let div = document.createElement("div");
									div.innerHTML=messagetodisplay;
									document.getElementById("main").appendChild(div);
									
									//Add a new form
									let div2=document.createElement("div");
									index+=1;
									form_id_input='answer'+index;
									form_id_button='button'+index;
									form_id_label='wrong'+index;
									div2.innerHTML=	"<form action='#' onsubmit='AnswerActorDirector(); return false'><label for="+form_id_input+">"+messagetodisplay2+"</label><br><input type='text' id="+form_id_input+" placeholder='Your answer..'> <input type='submit' value='Submit' id="+form_id_button+"><label class='incorrect' id="+form_id_label+"> </label></form>";
									document.getElementById("main").appendChild(div2);
								}
								
							});	
						}
					});
				
				}	
				
			});
		}
	});
	
}



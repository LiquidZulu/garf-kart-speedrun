// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// redirect garf-kart-speedrun.glitch.me to leaderboard.
app.get('/', function(request, res) {
  res.redirect('https://www.speedrun.com/gk')
});



const discord = require('discord.js');
const client = new discord.Client();
const ENV = process.env;
client.login(ENV.TOKEN);
const config = {
  prefix: '!sr'
}

var gk;
var fr;

client.on('ready', () => {
  console.log('I am ready!');
  client.user.setActivity('`!sr help` for a list of commands')
  
  var guild = client.guilds.get('483679588627644417');
  
  const leaderboard = require('./leaderboard.js');

  gk = new leaderboard({
    guild: guild
  });

  fr = new leaderboard({
    guild: guild,
    game:  `lde3rpj6`
  });
  
  setInterval(() => {
    gk.update({
      guild: guild
    }, console.log)
    fr.update({
      guild: guild
    }, console.log)
  }, 1000*60*10)
});

client.on('message', async msg => {
  var mcon = msg.content.trim();
  var cmsg = mcon.split(' ');
  cmsg = cmsg.map(v => v.trim());  
  
  try{
    switch(`${cmsg[0].toLowerCase()} ${cmsg[1].toLowerCase()}`){
        
      case `${config.prefix} init`:
        if(msg.author.id === '293462954240638977'){
          
          msg.channel.send('initiating\n\n')
          gk.update({
            guild: msg.channel.guild,
          },() => {})
          fr.update({
            guild: msg.channel.guild,
          },() => {})
        }
      break;
        
      case `${config.prefix} help`:
        try {
          msg.channel.send(require('./helptext.js'));
        }
        catch (e) {
          console.error(e);
          msg.channel.send('Error: '+e);
        }
      break;
        
      case `${config.prefix} role`:
        try {
          const allowedRoles = ['Runners', 'Multiplayer'];
          const roles = msg.guild.roles;
          var ifRole = (roles.find(i => i.name.toLowerCase() === cmsg[2].toLowerCase()) !== undefined && allowedRoles.find(i => {if( i.toLowerCase() === cmsg[2].toLowerCase()) return true}) !== undefined);
          
          if(cmsg[2].toLowerCase() === 'runners'){
            if(
              ( ifRole && gk.verify(`${msg.author.tag}`) ) ||
              ( ifRole && fr.verify(`${msg.author.tag}`) )
            ){
              msg.guild.members.find('id', msg.author.id).addRole(roles.find(i => i.name.toLowerCase() === cmsg[2].toLowerCase()).id)
            }
          }else{
            if(ifRole){
              if(ld.verify(`${msg.author.tag}`) === false && cmsg[2].toLowerCase() === 'runners') msg.channel.send('You are not a runner')
              msg.guild.members.find('id', msg.author.id).addRole(roles.find(i => i.name.toLowerCase() === cmsg[2].toLowerCase()).id)
            }
          }
        }
        catch (e) {
          console.error(e);
          msg.channel.send('Error: '+e);
        }
      break;
        
      case `${config.prefix} roles`:
        try{
          const allowedRoles = ['Runners', 'Multiplayer'];
          var roles = 'The roles I can grant you are:\n';
          for(var i in allowedRoles){
            roles += `\`${allowedRoles[i]}\`\n`
          }
          msg.channel.send(roles)
        }catch(e){
          console.error(e);
          msg.channel.send('Error: '+e);
        }
      break;
          
      case `${config.prefix} remove`:
      case `${config.prefix} removerole`:
      case `${config.prefix} unrole`:
        try{
          const allowedRoles = ['Runners', 'Multiplayer'];
          const roles = msg.member.roles;
          console.log(roles + '  ' + roles.find('name', cmsg[2].trim()))
          console.log(allowedRoles.find(i => { console.log(`i=${i}\ncmsg[2]=${cmsg[2]}`); if( i === cmsg[2]) return true}) !== undefined)
          if(roles.find('name', cmsg[2].trim()) !== undefined && allowedRoles.find(i => {if( i.toLowerCase() === cmsg[2].toLowerCase()) return true}) !== undefined){ 
            msg.member.removeRole(roles.find('name', cmsg[2]))
             .then(msg => msg.channel.send('Removed role'))
          }
        }catch(e){
          console.error(e);
          msg.channel.send('Error: '+e);
        }
      break;     
        
        
      case `${config.prefix} runners`:
        msg.channel.send(`A list of runners can be found here: https://garf-kart-speedrun.glitch.me/runners`);
      break;
    }
  }catch(e){
  }
})

function runnerlist(){

  try{
    var gkrun = [];
    for(var runner of gk.runners.Discords){
      if(runner !== null)gkrun.push(runner)
    }
    var frrun = [];
    for(var runner of gk.runners.Discords){
      if(runner !== null)frrun.push(runner)
    }

    let rows = (() => {
      let r = '';
      let runners = [];

      for(let runner of gkrun.sort()){
        runners.push(
          {
            name: runner,
            gk:   true,
            fr:   false
          }
        )
      }

      for(let runner of frrun.sort()){
        let therunner = {
          name: runner,
          gk:   false,
          fr:   true
        }
        let found = false;

        for(let i=0; i<runners.length; i++){
          if(runners[i].name = therunner.name){
            runners[i].fr = true;
            i = runners.length
          }
        }
        if(!found){
          runners.push(therunner)
        }
      }

      for(let runner of runners){
        r = `${r}\n<tr><th>${runner.name}</th><th>${runner.gk}</th><th>${runner.fr}</th></tr>`
      }

      return r
    })()

    return `
<!DOCTYPE html>
<html>

    <head>
    </head>

    <body>

      <table>
        <tr>
          <th>Runner Name</th>
          <th>Garfield Kart</th>
          <th>Garfield Kart: Furious Racing</th>
        </tr>${rows}
      </table>

    </body>

</html>`
  }catch(e){
    console.error(e);
    return ('Error: '+e);
  }
}



/* --- WEB SERVER THAT REQUESTS ITSELF by tphecca --- */

const got = require('got');

app.get('/run', (req, res) => res.send('ok glitch let me run my project lol'));
app.get('/runners', (req, res) => res.send(runnerlist()));

app.listen(process.env.PORT, () => console.log('Example app listening on port whatever!'));

setInterval(async function() {
  try {
    var ween = await got(`http://${process.env.PROJECT_DOMAIN}.glitch.me/run`);
    console.log(ween.body);
  } catch (e) {
    console.log("couldn't get myself");
  }
}, 3 * 60 * 1000)
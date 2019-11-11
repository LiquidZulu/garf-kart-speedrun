async function readPage(link, _callback){
	const got = require('got');
	var result = await got(link);
	_callback(result);
}



module.exports = class {
  
  constructor(args){
    this.rawRunners = [];
    this.init(args)
  }
  
  init(args){
    
    this.guild = args.guild
    
    if(!args.game){
      args.game = 'm1m284d2' // Gar Kar ID
    }
    
    var runsURL = `https://www.speedrun.com/api/v1/games/${args.game}/categories?top=65536`;
    
    readPage(runsURL, async (res) => {
      try{
        
        var cats = JSON.parse(res.body);
        var runners = [];
        //var i=0
        // for(var cat = runs.data[i]; i<runs.data.length; i++){
        for(var cat of cats.data){
          
          readPage(cat.links[4].uri, (res) => {
            var theJSON = JSON.parse(res.body)
            var runs = theJSON.data
            if(runs.length !== 0){
              this.parseRunnerJSON(runs)
              if(theJSON.pagination.links[0] !== undefined){
                readPage(theJSON.pagination.links[0].uri, res => {
                  this.doAllTheRuns(JSON.parse(res.body))
                })
              }
            }
          })
        }
      }catch(e){console.error(e)}
    });
  }
  
  async getDiscords(_cb){
    
    var discords = [];
    var runnerIDs = this.rawRunners
    
    //var i=0;(var ID = runnerIDs[i].id; i<runnerIDs.length; i++)
    for(var ID of runnerIDs){
      var usrJSON = readPage(`https://www.speedrun.com/api/v1/users/${ID.id}`, (res) => {
        try{
          
          var usrJSON = JSON.parse(res.body).data;
          readPage(usrJSON.weblink, (res) => {
            try{
              
              var discName = this.getDiscord(res.body);
              discords.push(discName)
              
            }catch(e){console.error(e)}
          });
          _cb(discords);
          
        }catch(e){console.error(e)}
      });
      
      //ID = runnerIDs[i].id;
    }
    
    _cb(discords)
  }
  
  getDiscord(html){
    if(/Discord: /g.test(html)){
      
      var startPos = /Discord: /g.exec(html).index + /Discord: /g.exec(html)[0].length
      var char = html.substring(startPos, startPos+1)
      var string = ``;
      
      while(!/["']/.test(char)){
        string += char
        startPos++
        char = html.substring(startPos, startPos+1)
      }

      return string
    }else return null;
  }
  
  verify(d){
    if(this.runners.Discords.find(x => {if( x === d ) return true}) !== undefined) return true
    else return false
  }
  
  initRunners(){
    for(var runner of this.runners.Discords){
      if(runner !== undefined && runner !== null){
        
        // console.log(this.guild.members)
        var theRunner = this.guild.members.find(i => {
          if(`${i.user.username}#${i.user.discriminator}` == `${runner}`){
            return i.user
          }
        })
        
        if(theRunner !== null){
          try{
            theRunner.addRole(this.guild.roles.find(i => i.name === 'Runners').id)
          }catch(e){
            console.error(e)
          }
        }
      }
    }
  }
  
  async update(args, _cb){
    this.init(args)
     this.getDiscords(ds => {
        this.runners = { Discords : ds }
       _cb(this.runners)
      }
     )
  }
  
  parseRunnerJSON(runs){
    for(var run of runs){
      if(run.status.status === "verified"){
        for(var player of run.players){
          if(this.rawRunners.find(x => {if( x.id === player.id ) return true;}) === undefined){
            this.rawRunners.push(player);
          }
        }
      }
    }
  }
  
  doAllTheRuns(theJSON){
    setTimeout( () => {
      console.log('doing the runs')
      if(theJSON.data.length > 0){
        this.parseRunnerJSON(theJSON.data)
        if(theJSON.pagination.links[1] !== undefined){
          readPage(theJSON.pagination.links[1].uri, res => {
            this.doAllTheRuns(JSON.parse(res.body))
          })
        }
      }
    }, 5000)
  }
}
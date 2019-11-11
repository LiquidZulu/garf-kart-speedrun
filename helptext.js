const Discord = require('discord.js');

const embed = new Discord.RichEmbed()
 .setTitle("Check the leaderboards.")
 .setAuthor("Gar Kar Run role adder | By LiquidZulu")
 .setColor(0x57287d)
 .setDescription("**---You can get support or send feedback by doing @Bot Help---**")
 .setFooter(`Made by LiquidZulu  |  Souce Code: https://glitch.com/edit/#!/garf-kart-speedrun`)
 .setThumbnail("https://b.thumbs.redditmedia.com/qB90pJUPuQExAp6bYbLAZrvGH1hO7U7bG0IrugEW13E.png")
 .setTimestamp()
 .setURL(`https://${process.env.PROJECT_DOMAIN}.glitch.me/`)
 .addField("!sr role <rolename>",
  "Promotes you to the role specified if you are authorised."
  )
 .addField("!sr roles",
  "Lists the available roles"
  )
 .addField("!sr remove <rolename>",
  "Removes the role specified.\nAliases: removerole, unrole"
  )
 .addField("!sr runners",
  `Displays a list of verified runners, to get verified submit a run to [speedrun.com](http://${process.env.PROJECT_DOMAIN}.glitch.me/) and link your Discord to your speedrun account.`
  )

module.exports = {embed}
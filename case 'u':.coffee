case 'u':
    {
       let user= m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') 
       let username = pushname.user
       console.log(json)
       const res = json[0]
  let message =`your username is ${pushname}, ${res.name.user}`
  XeonBotInc.sendMessage(m.chat,
    { text: message,
     contextInfo:{
             "externalAdReply": {"showAdAttribution": true,
             "containsAutoReply": true,
             "title": ` ${global.botname}`,
             "body": `${ownername}`,
             "previewType": "PHOTO",
            "thumbnailUrl": ``,
            "thumbnail": XeonWlcm,
             "sourceUrl": `${websitex}`}
                }
    })
    }
    break
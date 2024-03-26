//base by DGXeon (Xeon Bot Inc.)
//YouTube: @DGXeon
//Instagram: unicorn_xeon13
//Telegram: t.me/xeonbotinc
//GitHub: @DGXeon
//WhatsApp: +919339619072
//want more free bot scripts? subscribe to my youtube channel: https://youtube.com/@DGXeon

require('./settings')
const makeWASocket = require("@whiskeysockets/baileys").default
const { uncache, nocache } = require('./lib/loader')
const { color } = require('./lib/color')
const NodeCache = require("node-cache")
const readline = require("readline")
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const { Low, JSONFile } = require('./lib/lowdb')
const yargs = require('yargs/yargs')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const _ = require('lodash')
const moment = require('moment-timezone')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const { default: XeonBotIncConnect, getAggregateVotesInPollMessage, delay, PHONENUMBER_MCC, makeCacheableSignalKeyStore, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto, Browsers} = require("@whiskeysockets/baileys")

const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
})
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.db = new Low(new JSONFile(`src/database.json`))

global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000))
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read()
  global.db.READ = false
  global.db.data = {
    users: {},
    database: {},
    chats: {},
    game: {},
    settings: {},
    message: {},
    antipromote:{},
    ...(global.db.data || {})
  }
  global.db.chain = _.chain(global.db.data)
}
loadDatabase()

if (global.db) setInterval(async () => {
   if (global.db.data) await global.db.write()
}, 30 * 1000)

require('./XeonCheems11.js')
nocache('../XeonCheems11.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))
require('./main.js')
nocache('../main.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))

//------------------------------------------------------
let phoneNumber = "919339619072"
let owner = JSON.parse(fs.readFileSync('./src/data/role/owner.json'))

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

async function startXeonBotInc() {
let { version, isLatest } = await fetchLatestBaileysVersion()
const {  state, saveCreds } =await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache() // for retry message, "waiting message"
    const XeonBotInc = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: pairingCode, // popping up QR in terminal log
      browser: Browsers.windows('Debashis'), // for this issues https://github.com/WhiskeySockets/Baileys/issues/328
     auth: {
         creds: state.creds,
         keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
      },
      markOnlineOnConnect: true, // set false for offline
      generateHighQualityLinkPreview: true, // make high preview link
      getMessage: async (key) => {
         let jid = jidNormalizedUser(key.remoteJid)
         let msg = await store.loadMessage(jid, key.id)

         return msg?.message || ""
      },
      msgRetryCounterCache, // Resolve waiting messages
      defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276
   })
   
   store.bind(XeonBotInc.ev)

    // login use pairing code
   // source code https://github.com/WhiskeySockets/Baileys/blob/master/Example/example.ts#L61
   if (!pairingCode && !XeonBotInc.authState.creds.registered) {
      if (useMobile) throw new Error('Cannot use pairing code with mobile api')

      let phoneNumber
      if (!!phoneNumber) {
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +919339619072")))
            process.exit(0)
         }
      } else {
         phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFor example: +919339619072 : `)))
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         // Ask again when entering the wrong number
         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +919339619072")))

            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFor example: +919339619072 : `)))
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
            rl.close()
         }
      }

      setTimeout(async () => {
         let code = await XeonBotInc.requestPairingCode(phoneNumber)
         code = code?.match(/.{1,4}/g)?.join("-") || code
         console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
      }, 3000)
   }

XeonBotInc.ev.on('connection.update', async (update) => {
	const {
		connection,
		lastDisconnect
	} = update
try{
		if (connection === 'close') {
			let reason = new Boom(lastDisconnect?.error)?.output.statusCode
			if (reason === DisconnectReason.badSession) {
				console.log(`Bad Session File, Please Delete Session and Scan Again`);
				startXeonBotInc()
			} else if (reason === DisconnectReason.connectionClosed) {
				console.log("Connection closed, reconnecting....");
				startXeonBotInc();
			} else if (reason === DisconnectReason.connectionLost) {
				console.log("Connection Lost from Server, reconnecting...");
				startXeonBotInc();
			} else if (reason === DisconnectReason.connectionReplaced) {
				console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
				startXeonBotInc()
			} else if (reason === DisconnectReason.loggedOut) {
				console.log(`Device Logged Out, Please Delete Session and Scan Again.`);
				startXeonBotInc();
			} else if (reason === DisconnectReason.restartRequired) {
				console.log("Restart Required, Restarting...");
				startXeonBotInc();
			} else if (reason === DisconnectReason.timedOut) {
				console.log("Connection TimedOut, Reconnecting...");
				startXeonBotInc();
			} else XeonBotInc.end(`Unknown DisconnectReason: ${reason}|${connection}`)
		}
		if (update.connection == "connecting" || update.receivedPendingNotifications == "false") {
			console.log(color(`\n🌿Connecting...`, 'yellow'))
		}
		if (update.connection == "open" || update.receivedPendingNotifications == "true") {
			console.log(color(` `,'magenta'))
            console.log(color(`🌿Connected to => ` + JSON.stringify(XeonBotInc.user, null, 2), 'yellow'))
			await delay(1999)
            console.log(chalk.yellow(`\n\n               ${chalk.bold.blue(`[ ${botname} ]`)}\n\n`))
            console.log(color(`< ================================================== >`, 'cyan'))
	        console.log(color(`\n${themeemoji} Follow me on Facebook : Debashis Dey`,'magenta'))
            console.log(color(`${themeemoji}  GITHUB: Ddebashis121212`,'magenta'))
            console.log(color(`${themeemoji} INSTAGRAM: @debashis_12321`,'magenta'))
            console.log(color(`${themeemoji} WA NUMBER: ${owner}`,'magenta'))
            console.log(color(`${themeemoji} CREDIT: ${wm}\n`,'magenta'))
            await delay(1000 * 2) 
		}
	
} catch (err) {
	  console.log('Error in Connection.update '+err)
	  startXeonBotInc();
	}
})
XeonBotInc.ev.on('creds.update', saveCreds)
XeonBotInc.ev.on("messages.upsert",  () => { })
//------------------------------------------------------

//farewell/welcome
    XeonBotInc.ev.on('group-participants.update', async (anu) => {
    	if (global.welcome){
console.log(anu)
try {
let metadata = await XeonBotInc.groupMetadata(anu.id)
let participants = anu.participants
for (let num of participants) {
try {
ppuser = await XeonBotInc.profilePictureUrl(num, 'image')
} catch (err) {
ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}
try {
ppgroup = await XeonBotInc.profilePictureUrl(anu.id, 'image')
} catch (err) {
ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'
}
//welcome\\
memb = metadata.participants.length
XeonWlcm = await getBuffer(ppuser)
XeonLft = await getBuffer(ppuser)
                if (anu.action == 'add') {
                const xeonbuffer = await getBuffer(ppuser)
                let xeonName = num
                const xtime = moment.tz('Asia/Kolkata').format('HH:mm:ss')
	            const xdate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')
	            const xmembers = metadata.participants.length
                xeonbody =  `┌──────────❖ 𝕮𝖍𝖊𝖊𝖒𝖘 𝕭𝖔𝖙 ❖──────────┐
│「 𝗛𝗶 👋 」
└┬❖ 「  @${xeonName.split("@")[0]}  」
   │✑  𝖂𝖊𝖑𝖈𝖔𝖒𝖊 𝕿𝖔 
   │✑         ${metadata.subject}
   │
   │✑  𝕸𝖊𝖒𝖇𝖊𝖗 : 
   │✑         ${xmembers}th
    |
   │✑  𝕵𝖔𝖎𝖓𝖊𝖉 𝖔𝖓 : 
   │✑         ${xtime} ${xdate} 
   │
    |✑ 𝕮𝖔𝖓𝖌𝖗𝖆𝖙𝖚𝖑𝖆𝖙𝖎𝖔𝖓𝖘
    |     @${xeonName.split("@")[0]} 𝘽𝙧𝙤/𝙎𝙞𝙨, 
    |                  𝙔𝙤𝙪 𝙖𝙧𝙚 𝙣𝙤𝙬 𝙖 𝙢𝙚𝙢𝙗𝙚𝙧 𝙤𝙛 𝙤𝙪𝙧
    | ${metadata.subject} 𝙁𝙖𝙢𝙞𝙡𝙮❤️🤝
    |
    |✑ 𝕲𝖗𝖔𝖚𝖕 𝕯𝖊𝖘𝖈𝖗𝖎𝖕𝖙𝖎𝖔𝖓:- 
     ${metadata.desc} 
   └─┬──────────────────────┈ ⳹
         │
         │✑ ꧁𓊈𒆜•♣ 𝕯𝕯 𝕮𝖍𝖊𝖊𝖒𝖘 𝕭𝕺𝕿 ♣•𒆜𓊉꧂
         │                       
         │✑ 𝕮𝖗𝖊𝖆𝖙𝖊𝖉 𝕭𝖞 : ${ownername}
         │
         │✑ 𝖁𝖊𝖗𝖘𝖎𝖔𝖓: 11.0
         │
         │✑ 𝕻𝖗𝖊𝖋𝖎𝖝: ${global.xprefix}
         └──────────────────────┈ ⳹`
XeonBotInc.sendMessage(anu.id,
 { text: xeonbody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername} \n Join Our WhatsApp Group`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": XeonWlcm,
"sourceUrl": `${wagc}`}}})
                } else if (anu.action == 'remove') {
                	const xeonbuffer = await getBuffer(ppuser)
                    const xeontime = moment.tz('Asia/Kolkata').format('HH:mm:ss')
	                const xeondate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')
                	let xeonName = num
                    const xeonmembers = metadata.participants.length
                    xeonbody = `
┌────────────❖ 𝕮𝖍𝖊𝖊𝖒𝖘 𝕭𝖔𝖙 ❖───────────┐
│「 𝗚𝗼𝗼𝗱𝗯𝘆𝗲 👋 」
└┬❖ 「 @${xeonName.split("@")[0]}  」
   │✑  𝕷𝖊𝖋𝖙 𝕱𝖗𝖔𝖒: 
   │✑        ${metadata.subject}
    |
   │✑  𝕸𝖊𝖒𝖇𝖊𝖗 : 
   │✑        ${xeonmembers}th
    |
   │✑  𝕷𝖊𝖋𝖙 𝕺𝖓 : 
   │✑        ${xeontime} ${xeondate}
   │
   │✑  He/She is no more in this group 😔
   └┬─────────────────────┈ ⳹
      │
      │✑ ꧁𓊈𒆜•♣ 𝕯𝕯 𝕮𝖍𝖊𝖊𝖒𝖘 𝕭𝕺𝕿 ♣•𒆜𓊉꧂
      │
      │✑ 𝕮𝖗𝖊𝖆𝖙𝖊𝖉 𝕭𝖞 : ${ownername}
      │
      │✑ 𝖁𝖊𝖗𝖘𝖎𝖔𝖓: 11.0
      │
      │✑ 𝕻𝖗𝖊𝖋𝖎𝖝: ${global.xprefix}
      └─────────────────────┈ ⳹`
XeonBotInc.sendMessage(anu.id,
 { text: xeonbody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body":  `${ownername}  \n Join Our WhatsApp Group`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": XeonLft,
"sourceUrl": `${wagc}`}}})
}
}
} catch (err) {
console.log(err)
}
}
})
// Anti Call
    XeonBotInc.ev.on('call', async (XeonPapa) => {
    	if (global.anticall){
    console.log(XeonPapa)
    for (let XeonFucks of XeonPapa) {
    if (XeonFucks.isGroup == false) {
    if (XeonFucks.status == "offer") {
    let XeonBlokMsg = await XeonBotInc.sendTextWithMentions(XeonFucks.from, `*${XeonBotInc.user.name}* can't receive ${XeonFucks.isVideo ? `video` : `voice` } call. Sorry @${XeonFucks.from.split('@')[0]} you will be blocked. If called accidentally please contact the owner to be unblocked !`)
    XeonBotInc.sendContact(XeonFucks.from, owner, XeonBlokMsg)
    await sleep(8000)
    await XeonBotInc.updateBlockStatus(XeonFucks.from, "block")
    }
    }
    }
    }
    })
    //autostatus view
        XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
        	if (global.antiswview){
            mek = chatUpdate.messages[0]
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
            	await XeonBotInc.readMessages([mek.key]) }
            }
    })
    
    //admin event
    
    XeonBotInc.ev.on('group-participants.update', async (anu) => {
    	if (global.adminevent){
console.log(anu)
try {
let participants = anu.participants
for (let num of participants) {
try {
ppuser = await XeonBotInc.profilePictureUrl(num, 'image')
} catch (err) {
ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}
try {
ppgroup = await XeonBotInc.profilePictureUrl(anu.id, 'image')
} catch (err) {
ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'
}

m.chat ? {remoteJid: "status@broadcast"} : {}
 if (anu.action == 'promote') {
     if (db.data.chats[m.chat].antipromote != true)
     {    if(anu.author == '919339619072@s.whatsapp.net' || anu.author == '14437095780@s.whatsapp.net' || anu.author == '919062628928@s.whatsapp.net' ||anu.author == '918768298758@s.whatsapp.net')
            {
                let xeontime = moment.tz('Asia/Kolkata').format('HH:mm:ss')
                let xeondate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')
             let xeonName = num
             xeonbody = ` 𝗖𝗼𝗻𝗴𝗿𝗮𝘁𝘀🎉 @${xeonName.split("@")[0]}, you have been *promoted* to *admin* \n\n> Time:  ${xeontime.split("@")[0]} \n> Date:  ${xeondate.split("@")[0]}`
             XeonBotInc.sendMessage(anu.id,
                    { text: xeonbody,
                     contextInfo:{
                     mentionedJid:[xeonName, xeondate, xeontime],
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
        else {
              let xeontime = moment.tz('Asia/Kolkata').format('HH:mm:ss')
              let xeondate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')
              let xeonName = num
               let promoter = anu.author
              xeonbody = ` 𝗖𝗼𝗻𝗴𝗿𝗮𝘁𝘀🎉 @${xeonName.split("@")[0]}, you have been *promoted* to *admin* \n*Promoted by* @${promoter.split("@")[0]}\n\n> Time:  ${xeontime.split("@")[0]} \n> Date:  ${xeondate.split("@")[0]}`
              XeonBotInc.sendMessage(anu.id,
                    { text: xeonbody,
                     contextInfo:{
                            mentionedJid:[xeonName, xeondate, xeontime, promoter],
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
      
    }
 
    else if(db.data.chats[anu.id].antipromote = true) 
    { 
        let promoterx = anu.author
        
        if(promoterx!=owner)
        { 
            
               let promoter = anu.author
               let promotee = num
               await XeonBotInc.groupParticipantsUpdate(anu.id, [num], 'demote')
               await XeonBotInc.groupParticipantsUpdate(anu.id, [promoter], 'demote')
               let message = `~ ${promoter.split("@")[0]} Tried to promote ${promotee.split("@")[0]} \n\n Bro, 😂😂😂\n we are the GOD  here, Please don't try to be clever 😂\n\n\n`
               XeonBotInc.relayMessage(anu.id, {
               
               scheduledCallCreationMessage: {
               mentionedJid:[promoter, promotee],
               callType: "VIDEO",
               scheduledTimestampMs: 6969,
               title: message,
	       }}

	      xeonbody = `@${xeonName.split("@")[0]} AND @${promotee.split("@")[0]} LOL`
              XeonBotInc.sendMessage(anu.id,
                    { text: xeonbody,
                     contextInfo:{
                            mentionedJid:[xeonName, xeondate, xeontime, promoter],
                             "externalAdReply": {"showAdAttribution": true,
                             "containsAutoReply": true,
                             "title": ` ${global.botname}`,
                             "body": `${ownername}`,
                             "previewType": "PHOTO",
                            "thumbnailUrl": ``,
                            "thumbnail": XeonWlcm,
                             "sourceUrl": `${websitex}`}
                                }
		    }, {})          
        }  
    }
} 
else if (anu.action == 'demote') {
   
    if (db.data.chats[m.chat].antipromote != true)
    { 
         if(anu.author != '919339619072@s.whatsapp.net')
         {
             let xeontime = moment.tz('Asia/Kolkata').format('HH:mm:ss')
             let xeondate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')
             let xeonName = num
             let demoter = anu.author
             xeonbody = ` *Oops!!* @${xeonName.split("@")[0]}, you have been *Demoted* from *Admin* \n*Demoted by* @${demoter.split("@")[0]}\n\n> Time:  ${xeontime.split("@")[0]} \n> Date:  ${xeondate.split("@")[0]}`
            XeonBotInc.sendMessage(anu.id,
                { text: xeonbody,
                     contextInfo:
                    {
                         mentionedJid:[num, xeondate, xeontime, demoter],
                         "externalAdReply": {"showAdAttribution": true,
                         "containsAutoReply": true,
                        "title": ` ${global.botname}`,
                         "body": `${ownername}`,
                         "previewType": "PHOTO",
                         "thumbnailUrl": ``,
                         "thumbnail": XeonWlcm,
                        "sourceUrl": `${websitex}`}}})
                    }
         else if(anu.author == '919339619072@s.whatsapp.net')
         {
             let xeontime = moment.tz('Asia/Kolkata').format('HH:mm:ss')
             let xeondate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')
             let xeonName = num
             xeonbody = ` *Oops!!* @${xeonName.split("@")[0]}, you have been *Demoted* from *Admin*\n\n> Time:  ${xeontime.split("@")[0]} \n> Date:  ${xeondate.split("@")[0]}`
    XeonBotInc.sendMessage(anu.id,
     { text: xeonbody,
     contextInfo:{
    mentionedJid:[num, xeondate, xeontime],
     "externalAdReply": {"showAdAttribution": true,
     "containsAutoReply": true,
     "title": ` ${global.botname}`,
    "body": `${ownername}`,
     "previewType": "PHOTO",
    "thumbnailUrl": ``,
    "thumbnail": XeonWlcm,
    "sourceUrl": `${websitex}`}}})
 }  
}
    else 
    {    
        let promoter = anu.author
        let promotee = num
        xeonbody = `@${promoter} & @${promotee} lol 😂😂 `
        XeonBotInc.sendMessage(anu.id,
            { text: xeonbody,
                contextInfo:{
                mentionedJid:[promoter, promotee],
                "externalAdReply": {"showAdAttribution": true,
                "containsAutoReply": true,
                "title": ` ${global.botname}`,
                "body": `${ownername}`,
                "previewType": "PHOTO",
                "thumbnailUrl": ``,
                "thumbnail": XeonWlcm,
                "sourceUrl": `${websitex}`}}})
    }
}
}
} catch (err) {
console.log(err)
}
}
})

// detect group update
		XeonBotInc.ev.on("groups.update", async (json) => {
			if (global.groupevent) {
			try {
ppgroup = await XeonBotInc.profilePictureUrl(anu.id, 'image')
} catch (err) {
ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'
}
			console.log(json)
			const res = json[0]
			if (res.announce == true) {
				await sleep(1000)
				XeonBotInc.sendMessage(res.id, {
					text: `「 Group Settings Change 」\n\nGroup has been closed by admin, Now only admins can send messages !`,
				})
			} else if (res.announce == false) {
				await sleep(1000)
				XeonBotInc.sendMessage(res.id, {
					text: `「 Group Settings Change 」\n\nThe group has been opened by admin, Now participants can send messages !`,
				})
			} else if (res.restrict == true) {
				await sleep(1000)
				XeonBotInc.sendMessage(res.id, {
					text: `「 Group Settings Change 」\n\nGroup info has been restricted, Now only admin can edit group info !`,
				})
			} else if (res.restrict == false) {
				await sleep(1000)
				XeonBotInc.sendMessage(res.id, {
					text: `「 Group Settings Change 」\n\nGroup info has been opened, Now participants can edit group info !`,
				})
			} else if(!res.desc == ''){
				await sleep(1000)
				XeonBotInc.sendMessage(res.id, { 
					text: `「 Group Settings Change 」\n\n*Group description has been changed to*\n\n${res.desc}`,
				})
      } else {
				await sleep(1000)
				XeonBotInc.sendMessage(res.id, {
					text: `「 Group Settings Change 」\n\n*Group name has been changed to*\n\n*${res.subject}*`,
				})
			} 
			}
		})
            
    XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
        //console.log(JSON.stringify(chatUpdate, undefined, 2))
        try {
            mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            if (mek.key && mek.key.remoteJid === 'status@broadcast') return
            if (!XeonBotInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
            if (mek.key.id.startsWith('Xeon') && mek.key.id.length === 16) return
            if (mek.key.id.startsWith('BAE5')) return
            m = smsg(XeonBotInc, mek, store)
            require("./XeonCheems11")(XeonBotInc, m, chatUpdate, store)
        } catch (err) {
            console.log(err)
        }
    })

   
    XeonBotInc.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    XeonBotInc.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = XeonBotInc.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = {
                id,
                name: contact.notify
            }
        }
    })

    XeonBotInc.getName = (jid, withoutContact = false) => {
        id = XeonBotInc.decodeJid(jid)
        withoutContact = XeonBotInc.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = XeonBotInc.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === XeonBotInc.decodeJid(XeonBotInc.user.id) ?
            XeonBotInc.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

XeonBotInc.sendContact = async (jid, kon, quoted = '', opts = {}) => {
	let list = []
	for (let i of kon) {
	    list.push({
	    	displayName: await XeonBotInc.getName(i),
	    	vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await XeonBotInc.getName(i)}\nFN:${await XeonBotInc.getName(i)}\nitem1.TEL;waid=${i.split('@')[0]}:${i.split('@')[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD`
	    })
	}
	XeonBotInc.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted })
    }

    XeonBotInc.public = true

    XeonBotInc.serializeM = (m) => smsg(XeonBotInc, m, store)

    XeonBotInc.sendText = (jid, text, quoted = '', options) => XeonBotInc.sendMessage(jid, {
        text: text,
        ...options
    }, {
        quoted,
        ...options
    })
    XeonBotInc.sendImage = async (jid, path, caption = '', quoted = '', options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await XeonBotInc.sendMessage(jid, {
            image: buffer,
            caption: caption,
            ...options
        }, {
            quoted
        })
    }
    XeonBotInc.sendTextWithMentions = async (jid, text, quoted, options = {}) => XeonBotInc.sendMessage(jid, {
        text: text,
        mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
        ...options
    }, {
        quoted
    })
    XeonBotInc.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)
}
await XeonBotInc.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
.then( response => {
fs.unlinkSync(buffer)
return response
})
}

XeonBotInc.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifVid(buff, options)
} else {
buffer = await videoToWebp(buff)
}
await XeonBotInc.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}
    XeonBotInc.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }
    
    XeonBotInc.copyNForward = async (jid, message, forceForward = false, options = {}) => {
let vtype
if (options.readViewOnce) {
message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
vtype = Object.keys(message.message.viewOnceMessage.message)[0]
delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
delete message.message.viewOnceMessage.message[vtype].viewOnce
message.message = {
...message.message.viewOnceMessage.message
}
}
let mtype = Object.keys(message.message)[0]
let content = await generateForwardMessageContent(message, forceForward)
let ctype = Object.keys(content)[0]
let context = {}
if (mtype != "conversation") context = message.message[mtype].contextInfo
content[ctype].contextInfo = {
...context,
...content[ctype].contextInfo
}
const waMessage = await generateWAMessageFromContent(jid, content, options ? {
...content[ctype],
...options,
...(options.contextInfo ? {
contextInfo: {
...content[ctype].contextInfo,
...options.contextInfo
}
} : {})
} : {})
await XeonBotInc.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
return waMessage
}
    
    XeonBotInc.sendPoll = (jid, name = '', values = [], selectableCount = 1) => { return XeonBotInc.sendMessage(jid, { poll: { name, values, selectableCount }}) }

XeonBotInc.parseMention = (text = '') => {
return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}
            
    XeonBotInc.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        return buffer
    }
    return XeonBotInc
}

startXeonBotInc()

process.on('uncaughtException', function (err) {
let e = String(err)
if (e.includes("conflict")) return
if (e.includes("Socket connection timeout")) return
if (e.includes("not-authorized")) return
if (e.includes("already-exists")) return
if (e.includes("rate-overlimit")) return
if (e.includes("Connection Closed")) return
if (e.includes("Timed Out")) return
if (e.includes("Value not found")) return
console.log('Caught exception: ', err)
})

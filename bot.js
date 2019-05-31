//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

// This is the main file for the botkit bot.

// Import Botkit's core features
const { Botkit } = require('botkit');
const { BotkitCMSHelper } = require('botkit-plugin-cms');

// Import a platform-specific adapter for webex.

const { WebexAdapter } = require('botbuilder-adapter-webex');

const { MongoDbStorage } = require('botbuilder-storage-mongodb');


const WatsonMiddleware = require('botkit-middleware-watson').WatsonMiddleware;


// Load process.env values from .env file
require('dotenv').config();

let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        url : process.env.MONGO_URI,
    });
}


const adapter = new WebexAdapter({
    access_token: process.env.access_token,
    public_address: process.env.public_address
})    


const watsonMiddleware = new WatsonMiddleware({
    iam_apikey: 'c9o79ccfAUKoEbl_BDK9iIFjbbl-hzP-kZxbCUtrBDex',
    url: 'https://gateway-wdc.watsonplatform.net/assistant/api',
    workspace_id: '7de99e15-ed60-4ed0-885f-8c9115c30791',
    version: '2018-07-10',
    minimum_confidence: 0.50, // (Optional) Default is 0.75
  });

const controller = new Botkit({
    debug: true,
    webhook_uri: '/api/messages',

    adapter: adapter,

    storage
});

// controller.middleware.receive.use(watsonMiddleware);

controller.hears('.*','message,direct_message', async(bot, message) => {
    console.log('anything')
//     let reply = await bot.reply(message,'This message will be deleted in a few seconds.');
//     setTimeout(async () => {
//         let res = await bot.deleteMessage(reply);
//     }, 5000);

// });

await watsonMiddleware.interpret(bot, message);
if (message.watsonError) {
  console.log(message.watsonError);
  await bot.reply(message, message.watsonError.description || message.watsonError.error);
} else if (message.watsonData && 'output' in message.watsonData) {
  await bot.reply(message, JSON.stringify(message.watsonData.output));//message.watsonData.output.text.join('\n'));
} else {
  console.log('Error: received message in unknown format. (Is your connection with Watson Assistant up and running?)');
  await bot.reply(message, 'I\'m sorry, but for technical reasons I can\'t respond to your message');
}
});

// if (process.env.cms_uri) {
//     controller.usePlugin(new BotkitCMSHelper({
//         cms_uri: process.env.cms_uri,
//         token: process.env.cms_token,
//     }));
// }

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {

    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + '/features');

    /* catch-all that uses the CMS to trigger dialogs */
    // if (controller.plugins.cms) {
    //     controller.on('message,direct_message', async (bot, message) => {
    //         let results = false;
    //         results = await controller.plugins.cms.testTrigger(bot, message);

    //         if (results !== false) {
    //             // do not continue middleware!
    //             return false;
    //         }
    //     });
    // }

});


//Imports
const {App} = require("@slack/bolt");
const fs = require("fs")
var {messageModal1, newModal,helloModal} = require("./ui");
const fire_message = require("./fire_message")


//console.log(messageModal1, newModal, helloModal);

//App Config
var app = new App(
    {
        token: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        appToken: process.env.SLACK_APP_TOKEN,
        port: process.env.PORT || 3000
    }
);

const logFile = "./scheduler.log"

//Object to store the list of all different types of recipents
var recipents = {
    users: [],
    channels: [],
    groups: []
};

var message = {
    date: "",
    time: "",
    tzone: "",
    msg: ""
}


//Loaded when the app is first called

//Global Shortcut trigger
app.shortcut("g_schedule", async ({shortcut, ack, client}) => {
    await ack();
    try {
        const result = await client.views.open({
            trigger_id: shortcut.trigger_id,
            view: messageModal1
        });
    }
    catch(error){
        console.log(error)
    }
})

//calling app on hello message, for convenient debugging
app.message("hello", async ({message, say}) => {
    helloModal.text = `Hey there <@${message.user}>!`
    await say(helloModal);
});


app.action("button_click", async ({body, ack, client}) => {
    await ack();
    try {
        const result = await client.views.open({
            trigger_id: body.trigger_id,
            view: messageModal1
        });
    }
    catch(error){
        console.log(error)
    }
});


//Processing Recipent list
app.action("multi_conversations_select-action", async ({body, ack, client, user, message}) => {
    await ack()
    recipents.users = [];
    recipents.channels = [];
    for(i of body.actions[0].selected_conversations){
        if(i[0] == 'U'){
            recipents.users.push(i);
        }
        else if(i[0] == 'C'){
            recipents.channels.push(i);
        }
        else if(i[0] == 'G'){
            recipents.channels.push(i);
        }
    }
    //Create arrays of unique Users groups and channels
    recipents.users = [...new Set(recipents.users)]
    recipents.channels = [...new Set(recipents.channels)]
    recipents.groups = [...new Set(recipents.groups)]
    
});

//Update Modal when click next
app.view('selected', async ({body, ack, view, user, client}) => {
    
    message.msg = Object.values(view.state.values[view.blocks[1].block_id])[0].value
    newModal.blocks[2].text.text = `\`\`\`${message.msg}\`\`\``
    await ack({
        response_action: 'update',
        view: newModal,
      })
});

//Process on Submit
app.view("reminder_set", async ({body, ack, view, user, client}) => {
    await ack();
    message.date = view.state.values[view.blocks[3].block_id]['datepicker-action'].selected_date;
    message.time = view.state.values[view.blocks[4].block_id]['timepicker-action'].selected_time;
    message.tzone = view.state.values[view.blocks[5].block_id]['static_select-action'].selected_option.value;

    fire_message(message, recipents, client, body.user.id)
});

(async () => {
    await app.start();
    console.log("App running");
})();


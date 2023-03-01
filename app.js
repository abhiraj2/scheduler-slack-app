//Imports
const {App} = require("@slack/bolt");

const dayjs = require("dayjs");
const fs = require("fs")

var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')

var {messageModal1, newModal,helloModal} = require("./ui");
console.log(messageModal1, newModal, helloModal);

dayjs.extend(utc)
dayjs.extend(timezone)


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

//Main function to send messages
async function fire_message(message, recipents, client, user){
    var failed = 0;
    var u_inf = {
        first_name: "",
        last_name:  ""
    }
    console.log(message.date, message.time)
    //For user type
    for(var i of recipents.users){
        try{
            // It just works with Epoch time which is in UTC
            var d = dayjs.tz(message.date + " " + message.time, "Etc/UTC")
            d = d.unix()

            var inf = await client.users.info({user: i});
            inf = inf.user['real_name'].split(/(\s+)/);

            u_inf.last_name = inf[inf.length-1]
            inf = inf.slice(0,inf.length-1);
            u_inf.first_name = inf.join("")

            var m = parse_message(message.msg, u_inf);
            if(message.tzone == 't1'){
                var deltaT = await client.users.info({user: user});
                deltaT = deltaT.user["tz_offset"];
                d -= deltaT
            }
            else if(message.tzone == 't2'){
                var deltaT = await client.users.info({user: i});
                deltaT = deltaT.user["tz_offset"];
                d -= deltaT
                
            }

            if(d >= dayjs().unix()){
                //console.log("Present")
                let result = await client.chat.scheduleMessage({
                    channel: i,
                    text: m,
                    post_at: d
                });    
            }
            else{
                //console.log("Past")
                let result = await client.chat.postMessage({
                    channel: i,
                    text: m
                });
            }
            let data = JSON.stringify({recipent: i, message: m, time: dayjs.unix(d).format()})
            fs.appendFile(logFile, data + "\n", (err) => {
                if(err) throw err;
            });
            
        }
        catch(e){
            failed++;
            console.log(e);
        }
        
    }

    // For Channels with Message timezone as Recipent Time, we DM each user at the correct time
    if(message.tzone == 't2'){
        var chan_users = [];
        for(var i of recipents.channels){
            let chan_info = await client.conversations.members({channel: i});
            var members = chan_info.members
            for(var j of members){
                chan_users.push(j)
            }       
        }
        chan_users = [...new Set(chan_users)]
        for(var i of chan_users){
            try{
                var d = dayjs.tz(message.date + " " + message.time, "Etc/UTC")
                d = d.unix()
                var deltaT = await client.users.info({user: i});
                deltaT = deltaT.user["tz_offset"];
                d -= deltaT
                if(d >= dayjs().unix()){
                    let result = await client.chat.scheduleMessage({
                        channel: i,
                        text: message.msg,
                        post_at: d
                    });
                }
                else{
                    let result = await client.chat.postMessage({
                        channel: i,
                        text: message.msg,
                    });
                }
                let data = JSON.stringify({recipent: i, message: message.msg, time: dayjs.unix(d).format()})
                fs.appendFile(logFile, data + "\n", (err) => {
                    if(err) throw err;
                });
            }
            catch(e){
                failed++;
                console.log(e);
            }
        }
    }
    else if(message.tzone == 't3' || message.tzone == 't1'){
        for(var i of recipents.channels){
            try{
                var d = dayjs.tz(message.date + " " + message.time, "Etc/UTC")
                d = d.unix()
                if(message.tzone == 't1'){
                    var deltaT = await client.users.info({user: user});
                    deltaT = deltaT.user["tz_offset"];
                    d -= deltaT
                }

                if(d >= dayjs().unix()){
                    let result = await client.chat.scheduleMessage({
                        channel: i,
                        text: message.msg,
                        post_at: d
                    });
                }
                else{
                    let result = await client.chat.postMessage({
                        channel: i,
                        text: message.msg,
                    });
                }
                let data = JSON.stringify({recipent: i, message: message.msg, time: dayjs.unix(d).format()})
                fs.appendFile(logFile, data + "\n", (err) => {
                    if(err) throw err;
                });

            }
            catch(e){
                failed++;
                console.log(e);
            }
        }
    }

    console.log("No. of Failed Messages ", failed);
    fs.appendFile(logFile, "No. of Failed Messages " + failed + "\n", (err) => {
       if(err) throw err;
    });
}

//Parse Function for ${firstName} ${lastName} ${fullName}
function parse_message(msg, user){
    var m = msg;
    if(msg.includes('$')){
        for(let i=0; i< msg.length; i++){
            if(msg[i] == '$' && (i+1<msg.length && msg[i+1]=='{')){
                for(var j=i+1; j<msg.length; j++){
                    if(msg[j] == '}'){
                        break;
                    }
                }
                let to_change = msg.slice(i, j+1)
                switch(to_change){
                    case "${firstName}":
                        m = m.replace(to_change, user.first_name);
                        break;
                    case "${lastName}":
                        m = m.replace(to_change, user.last_name);
                        break;
                    case "${fullName}":
                        m = m.replace(to_change, user.first_name + " " + user.last_name);
                        break;
                    default:
                        console.log(to_change);
                        break;
                }
            }
        }
    }   
    return m;
}
const {App} = require("@slack/bolt");

//console.log(process.env.SLACK_SIGNING_SECRET, process.env.SLACK_BOT_TOKEN)

var app = new App(
    {
        token: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        socketMode: true,
        appToken: process.env.SLACK_APP_TOKEN,
        port: process.env.PORT || 3000
    }
);


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

app.message("hello", async ({message, say}) => {
    await say({
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": `Hey there!!`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Schedule a Message"
                    },
                    "action_id": "button_click"
                }
            }
        ],
        text: `Hey there <@${message.user}>!`
    });
});


app.action("button_click", async ({body, ack, client}) => {
    await ack();
    try {
        const result = await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                "type": "modal",
                "callback_id": "selected",
                "submit": {
                    "type": "plain_text",
                    "text": "Next",
                    "emoji": true
                },
                "close": {
                    "type": "plain_text",
                    "text": "Cancel",
                    "emoji": true
                },
                "title": {
                    "type": "plain_text",
                    "text": "Message and Recipents",
                    "emoji": true
                },
                "blocks": [
                    {
                        "type": "divider"
                    },
                    {
                        "type": "input",
                        "label": {
                            "type": "plain_text",
                            "text": "Message",
                            "emoji": true
                        },
                        "element": {
                            "type": "plain_text_input",
                            "multiline": true
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "Recipents"
                        },
                        "accessory": {
                            "type": "multi_conversations_select",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Select conversations",
                                "emoji": true
                            },
                            "action_id": "multi_conversations_select-action"
                        }
                    }
                ]
            }
        });
        //console.log(result)
    }
    catch(error){
        console.log(error)
    }
});


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
    recipents.users = [...new Set(recipents.users)]
    recipents.channels = [...new Set(recipents.channels)]
    recipents.groups = [...new Set(recipents.groups)]
    
    //console.log(body)
});

app.view('selected', async ({body, ack, view, user, client}) => {
    await ack()
    //console.log(view.blocks[1].block_id)
    message.msg = Object.values(view.state.values[view.blocks[1].block_id])[0].value
    //console.log(message, clients)

    await client.views.open(
        {
            trigger_id: body.trigger_id,
            view: {
                "callback_id": "reminder_set",
                "title": {
                    "type": "plain_text",
                    "text": "Date and Time",
                    "emoji": true
                },
                "submit": {
                    "type": "plain_text",
                    "text": "Submit",
                    "emoji": true
                },
                "type": "modal",
                "close": {
                    "type": "plain_text",
                    "text": "Cancel",
                    "emoji": true
                },
                "blocks": [
                    {
                        "type": "divider"
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "*Message*"
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `\`\`\`${message.msg}\`\`\``
                        }
                    },
                    {
                        "type": "input",
                        "element": {
                            "type": "datepicker",
                            "initial_date": "1990-04-28",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Select a date",
                                "emoji": true
                            },
                            "action_id": "datepicker-action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Date",
                            "emoji": true
                        }
                    },
                    {
                        "type": "input",
                        "element": {
                            "type": "timepicker",
                            "initial_time": "13:37",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Select time",
                                "emoji": true
                            },
                            "action_id": "timepicker-action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Time",
                            "emoji": true
                        }
                    },
                    {
                        "type": "input",
                        "element": {
                            "type": "static_select",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Select an item",
                                "emoji": true
                            },
                            "options": [
                                {
                                    "text": {
                                        "type": "plain_text",
                                        "text": "Sender Timezone",
                                        "emoji": true
                                    },
                                    "value": "t1"
                                },
                                {
                                    "text": {
                                        "type": "plain_text",
                                        "text": "Recipent Timezone",
                                        "emoji": true
                                    },
                                    "value": "t2"
                                },
                                {
                                    "text": {
                                        "type": "plain_text",
                                        "text": "GMT",
                                        "emoji": true
                                    },
                                    "value": "t3"
                                }
                            ],
                            "action_id": "static_select-action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Timezone",
                            "emoji": true
                        }
                    }
                ]
            }
        }
    );

});


app.view("reminder_set", async ({body, ack, view, user, client}) => {
    await ack();
    message.date = view.state.values[view.blocks[3].block_id]['datepicker-action'].selected_date;
    message.time = view.state.values[view.blocks[4].block_id]['timepicker-action'].selected_time;
    message.tzone = view.state.values[view.blocks[5].block_id]['static_select-action'].selected_option.value;

    message.msg = parse_message(message.msg); // will be called inside fire_message
    console.log(message.msg)
    fire_message(message, recipents, client)
});

(async () => {
    await app.start();
    console.log("App running");
})();


async function fire_message(message, recipents, client){
    var failed = 0;
    for(var i of recipents.users){
        //console.log(i);
        let result = await client.chat.postMessage({
            channel: i,
            text: message.msg
        });
        if(!result){
            failed++;
        }
    }

    if(message.tzone == 't2'){
        var chan_users = [];
        for(var i of recipents.channels){
            let chan_info = await client.conversations.info(i);
            // for(var j of user_lis){
            //     chan_users.push(j['id'])
            // }       
        }
        console.log(chan_users)
    }

    // let result = await client.chat.postMessage({
    //     channel: "U048XU5F0L9",
    //     text: message.msg
    // });
}

function parse_message(msg){
    if(msg.includes('$')){
        for(let i=0; i< msg.length; i++){
            //console.log(i)
            if(msg[i] == '$' && (i+1<msg.length && msg[i+1]=='{')){
                for(var j=i+1; j<msg.length; j++){
                    if(msg[j] == '}'){
                        //console.log(i,j)
                        break;
                    }
                }
                let to_change = msg.slice(i, j+1)
                //console.log(to_change)
                switch(to_change){
                    case "${firstName}":
                        //console.log(to_change)
                        msg = msg.replace(to_change, "Abhiraj");
                        //console.log(msg)
                        break;
                    case "${lastName}":
                        //console.log(to_change)
                        msg = msg.replace(to_change, "A");
                        break;
                    case "${fullName}":
                        //console.log(to_change)
                        msg = msg.replace(to_change, "Abhiraj A");
                        break;
                    default:
                        console.log(to_change);
                        break;
                }
                //console.log(i, j+1)
            }
        }
    }   
    return msg
}
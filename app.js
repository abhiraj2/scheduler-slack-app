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


var clients = {
    users: [],
    channels: []
};

var message = ""

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
    clients.users = [];
    clients.channels = [];
    for(i of body.actions[0].selected_conversations){
        if(i[0] == 'U'){
            clients.users.push(i);
        }
        else if(i[0] == 'C'){
            clients.channels.push(i);
        }
    }
    clients.users = [...new Set(clients.users)]
    clients.channels = [...new Set(clients.channels)]
    
    //console.log(body)
});

app.view('selected', async ({body, ack, view, user, client}) => {
    await ack()
    //console.log(view.blocks[1].block_id)
    message = Object.values(view.state.values[view.blocks[1].block_id])[0].value
    //console.log(message, clients)

    await client.views.open(
        {
            trigger_id: body.trigger_id,
            view: {
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
                            "text": "```Message```"
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


(async () => {
    await app.start();
    console.log("App running");
})();
let message = {
    date: "",
    time: "",
    tzone: "",
    msg: ""
}

const messageModal1 = {
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

const helloModal = {
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
    text: `Hey there!`
}

const newModal = {
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
                "text": `hi`
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
};

module.exports = {messageModal1: messageModal1, helloModal: helloModal, newModal: newModal}

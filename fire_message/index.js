const dayjs = require("dayjs");
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')
const parse_message = require("./message_parser")
dayjs.extend(utc)
dayjs.extend(timezone)

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


module.exports = fire_message
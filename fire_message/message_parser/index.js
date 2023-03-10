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


module.exports = parse_message
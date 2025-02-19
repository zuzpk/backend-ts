const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, '.env')
const bases = [ `user`, `password`, `name`, `host`, `port` ]

if ( fs.existsSync( envPath ) ){

    const raw = fs.readFileSync( envPath, `utf8` )
    const params = []
    const base = {}
    const lines = []
    raw.split(`\n`)
        .forEach(line => {
            if ( line.startsWith (`DB_`) ){
                const [ k, v ] = line.replace(`DB_`, ``).split(`=`)
                if ( bases.includes( k.toLowerCase() )){
                    base[k.toLowerCase()] = v.replace(/^"|"$/g, ``)
                }
                else{
                    params.push( `${k.toLowerCase()}=${v}` )
                }
                // if ( bases.includes( k.toLowerCase() ) ){

                // }
                // params.push({ k, v })
            }
            if ( line.trim() != `` && !line.startsWith( `DATABASE_URL` ) ){
                lines.push(line)
            }
        })

    const url = `DATABASE_URL="mysql://${base.user}:${encodeURIComponent(base.password)}@${base.host}:${base.port}/${base.name}?${params.join(`&`)}"`

    fs.writeFileSync( envPath, `${lines.join(`\n`)}\n\n${url}`, {
        encoding: `utf8`
    })

    console.log(`.env generated`)

}
else{
    console.error(`.env does not exist`)
}
// DDATABASE_URL="mysql://zuzadmin:Centos%24%24%23%23123^^@192.168.100.4:20253/emload?\
// connection_limit=${DB_CONNECTION_LIMIT}&\
// wait_for_connections=${DB_WAIT_FOR_CONNECTION}&\
// max_idle=${DB_MAX_IDLE}&\
// idle_timeout=${DB_IDLE_TIMEOUT}&\
// queue_limit=${DB_QUEUE_LIMIT}&\
// connect_timeout=${DB_CONNECT_TIMEOUT}&\
// enable_keep_alive=${DB_ENABLE_KEEP_ALIVE}&\
// keep_alive_initial_delay=${DB_KEEP_ALIVE_INITIAL_DELAY}&\
// multiple_statements=${DB_MULTIPLE_STATEMENTS}"
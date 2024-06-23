const { Client } = require('pg')
import { drizzle } from "drizzle-orm/node-postgres" 

import { config } from "../config/config" 

export const client = new Client({ 
    host: config.dbHost, 
    user: config.dbUser, 
    port: config.dbPort,
    password: config.dbPass, 
    database: config.dbName, 
})
    
client.connect((err: any) => { 
    if (err) { 
        return console.error('Connection error', err.stack)
    }
    console.log('Database connection established')
})

export const db = drizzle(client)
if (db === undefined) { 
    console.error("unable to create orm from database connection")
    process.exit(1)
}

export default {
    client, 
    db
} 

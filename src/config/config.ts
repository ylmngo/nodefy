import dotenv from "dotenv"

let found = dotenv.config() 

if (found.error) { 
    console.log(".env file not found")
    process.abort() 
}

export const config = { 
    port: parseInt(process.env.PORT !== undefined ? process.env.PORT! : "3000", 10),
    dbPort: parseInt(process.env.DATABASE_PORT !== undefined ? process.env.DABATASE_PORT! : "5432",10), 
    dbHost: process.env.DATABASE_HOST !== undefined ? process.env.DATABASE_HOST! : "localhost", 
    dbUser: process.env.DATABASE_USER !== undefined ? process.env.DATABASE_USER! : "postgres", 
    dbPass: process.env.DATABASE_PASSWORD !== undefined ? process.env.DATABASE_PASSWORD! : "", 
    dbName: process.env.DATABASE_NAME !== undefined ? process.env.DATABASE_NAME! : "postgres", 
    jwtSecret: process.env.JWT_SECRET !== undefined ? process.env.JWT_SECRET! : "", 
}
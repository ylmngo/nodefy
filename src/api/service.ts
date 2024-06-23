import fs from "fs"
import path from "path"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { eq } from "drizzle-orm"
import { emit } from "process"
import fileUpload from "express-fileupload"
const { user } = require('pg/lib/defaults') 

import { client, db } from "../db/client" 
import { config } from "../config/config"
import { files, users } from "../db/schemas" 

const UPLOAD_DIR = __dirname + "../../../uploads/"

// change files to params 
async function upload(file: fileUpload.UploadedFile, userId: number) { 
    let buffer: Buffer = file.data

    await db.insert(files).values({
        filename: file.name, 
        user_id: userId, 
        metadata: "Something about the file", 
    }).catch((reason: any) => { 
        return Promise.reject(new Error("Error while writing to database"))
    }) 

    const uploadPath = path.normalize(UPLOAD_DIR+file.name)

    fs.writeFile(uploadPath, buffer, (err) => { 
        if (err) { 
            return Promise.reject(new Error('Error while writing file to disk'))
        }
    })

}

async function register(credentials: any) { 
    let username = credentials.username 
    let email = credentials.email 
    let password = credentials.password 
    let password_hash = bcrypt.hashSync(password, 10)
    
    await client.query("INSERT INTO users (name, email, password_hash) VALUES($1, $2, $3)", [
        username, 
        email, 
        password_hash
    ]).catch((err: any) => { 
        return Promise.reject(err)
    })
}

async function verifyUser(email: string, password: string) { 
    if (email === "" || password === "") { 
        return -1
    }

    const res = await client.query("select id, password_hash from users where email=$1", [email]).then((res: any) => {
        if (res.rowCount === 0) { 
            return -1 
        }

        const decoder = new TextDecoder()
        const hash = decoder.decode(res.rows[0].password_hash)
        if (bcrypt.compareSync(password, hash)) { 
            return parseInt(res.rows[0].id, 10) 
        }
        return -1 
    })

    return res 
}

function generateToken(email: string, userId: number) { 
    const token = jwt.sign({email: email}, config.jwtSecret, { 
        expiresIn: "1h", 
        algorithm: "HS256", 
        issuer: "nodefy", 
        subject: userId.toString(), 
    })
    return token 
}

export default { 
    generateToken, 
    verifyUser, 
    register, 
    upload, 
    UPLOAD_DIR
}
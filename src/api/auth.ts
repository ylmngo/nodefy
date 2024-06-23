import fs from "fs"
import path from "path"
import express, {NextFunction, Request, Response} from "express"
import { eq, lt, gte, ne, and, ConsoleLogWriter } from "drizzle-orm"
import jwt, { JwtPayload } from "jsonwebtoken"
const detectContentType = require("detect-content-type")

import { config } from "../config/config"
import { db } from "../db/client" 
import { files, users } from "../db/schemas" 
import service from "./service"

export const authRouter = express.Router()

function authenticate(req: Request, res: Response, next: NextFunction) { 
    let authHeader = req.headers.authorization
    if (authHeader === undefined || authHeader === "") { 
        return res.status(404).send("Invalid authentication token")
    }

    const token = authHeader.substring("BEARER ".length)
    if (token === "") { 
        return res.status(404).send("Invalid authentication token")
    }

    let decoded: JwtPayload 
    try { 
        decoded = jwt.verify(token, config.jwtSecret, {
            algorithms: ["HS256"],
            issuer: "nodefy", 
        }) as JwtPayload
    } catch (err) { 
        return res.status(400).send("unable to verify token")
    }

    let userId: string = decoded.sub!
    let email: string = decoded.email

    req.user = userId === undefined ? 13 : parseInt(userId)
    req.email = email
    
    next() 
}

authRouter.use(authenticate)

// GET: Files of the user currently logged in
authRouter.get("/files", async (req: Request, res: Response) => { 
    if (req.user === undefined) req.user = 13
    const queryRes = await db.select().from(files).where(eq(files.user_id, req.user))
    
    if (queryRes.length == 0) {
        return res.status(404).send("No files exist for this user")
    }
    
    return res.status(200).json({
        "rows": queryRes, 
    })
})

// GET: Single file of the user by it's filename 
authRouter.get("/file/:filename", async (req: Request, res: Response) => { 
    const filename = req.params.filename 
    if (filename === "") { 
        return res.status(404).send("Invalid filename")
    }

    const rows = await db.select({file_id: files.file_id}).from(files).where(  and(
        eq(files.user_id, 13),
        eq(files.filename, filename)
    ))  
    if (rows.length === 0) { 
        return res.status(404).send('File does not exist')
    }

    const readPath = path.normalize(service.UPLOAD_DIR+filename)
    fs.readFile(readPath, (err, data) => { 
        if (err) { 
            return res.status(500).send("Internal Server Error: Could not read file from disk")
        }
        let contentType = detectContentType(data)
        return res.contentType(contentType).status(200).send(data)
    })    
})

// POST: get file from request's form values, store it's information in the database and write it to disk
authRouter.post("/upload", async (req: Request, res: Response) => { 
    if (req.files === null || req.files === undefined) { 
        return res.status(404).send("No files were uploaded")
    }
    let uploadFile = req.files.file 
    let userId = 13 

    if (uploadFile instanceof Array) {
        if (uploadFile.length > 1)
            return res.status(400).send("Multiple files are not allowed")
        uploadFile = uploadFile[0]
    }
    
    await service.upload(uploadFile, userId).catch((err: any) => { 
        return res.status(500).send(`Internal Server Error: ${err.message}`)
    })
})

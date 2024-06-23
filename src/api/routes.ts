import express, {NextFunction, Request, Response} from "express"
import fileUpload from "express-fileupload"

import { authRouter } from "./auth"
import service from "./service"

export const router = express.Router() 

function processTime(req: Request, res: Response, next: NextFunction) { 
    let start = Date.now() 
    next() 
    let stop = Date.now() 
    console.log(`${req.url}: ${stop - start}ms`)
}

router.use(fileUpload())
router.use(express.json())
router.use(processTime)
router.use("/user", authRouter)

// HealthCheck Handler 
router.get("/health", (req: Request, res: Response) => { 
    return res.status(200).json({
        "status": "Active", 
        "Environment": "Development", 
    })
})

// POST: register a user with it's credentials 
router.post("/register", async (req, res) => { 
    let credentials = req.body 
    if (!credentials) { 
        return res.status(401).send("Invalid User Credentials")
    }

    await service.register(credentials).catch((err: any) => { 
        console.error(err) 
        return res.status(500).send("Internal Server Error: Unable to register user")
    })

    return res.status(200).send("User registered")
})

// POST: Verifies user credentials and returns a JWT Token 
router.post("/token", async (req, res) => { 
    let {email, password} = req.body

    const userId = await service.verifyUser(email, password)
    if (userId === -1) { 
        return res.status(401).send("Invalid user credentials")
    }

    const token = service.generateToken(email, userId)
    return res.status(200).json({
        "token": token
    })
})


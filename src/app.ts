const express = require('express')

import { config } from "./config/config"
import { router } from "./api/routes" 

async function startServer() { 
    const app = express() 
    app.use(router)
    app.listen(config.port, () => { 
        console.log(`Server started at port ${config.port}`)
    }).on("error", (err: any) => { 
        console.log(err)
    })
}

startServer()
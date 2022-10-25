import express from "express"
import cookieParser from "cookie-parser"
import logger from "morgan"
import bodyParser from "body-parser"
import AsyncLock from "async-lock"
import { chromium } from "playwright"

import indexRouter from "./routes/index"
import { gotoRouter } from "./routes/goto"
import backRouter from "./routes/goback"
import forwardRouter from "./routes/goforward"
import clickRouter from "./routes/click"
import actionRouter from "./routes/action"
import scrollRouter from "./routes/scroll"
import screenshotRouter from "./routes/screenshot"
import mhtmlRouter from "./routes/mhtml"
import harRouter from "./routes/har"
import closeContextRouter from "./routes/close_context"

const app = express()

;(async () => {
	// TODO: investigate options needing passed
	const browser = await chromium.launch({
		headless: false
	})

	app.set("browser", browser)
	app.set("lock", new AsyncLock())
})()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(logger("dev"))
app.use(bodyParser.raw({ inflate: true, limit: "200kb", type: "application/javascript" }))
app.use(cookieParser())

app.use("/", indexRouter)
app.use("/goto", gotoRouter)
app.use("/back", backRouter)
app.use("/forward", forwardRouter)
app.use("/click", clickRouter)
app.use("/action", actionRouter)
app.use("/scroll", scrollRouter)
app.use("/screenshot", screenshotRouter)
app.use("/mhtml", mhtmlRouter)
app.use("/har", harRouter)
app.use("/close_context", closeContextRouter)


export { app }

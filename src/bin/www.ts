#!/usr/bin/env node

/**
 * Module dependencies.
 */

import { app } from "../app"
const debug = require("debug")("scrapy-puppeteer-service:server")
import { createServer } from "http"

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3000")
app.set("port", port)

/**
 * Create HTTP server.
 */

const server = createServer(app)

/**
 * Init default request timeout from environment.
 * Default is Scrapy's default DOWNLOAD_TIMEOUT (3 minutes) + 10 seconds
 */

const timeout = parseInt(process.env.TIMEOUT ?? "180000")
server.setTimeout(timeout > 0 ? timeout : 190000)

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port)
server.on("error", onError)
server.on("listening", onListening)

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
	const port = parseInt(val, 10)

	if (isNaN(port)) {
		// named pipe
		return val
	}

	if (port >= 0) {
		// port number
		return port
	}

	return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
	console.log("Error:", error)
	if (error.syscall !== "listen") {
		throw error
	}

	const bind = typeof port === "string"
		? "Pipe " + port
		: "Port " + port

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case "EACCES":
			console.error(bind + " requires elevated privileges")
			process.exit(1)
			break
		case "EADDRINUSE":
			console.error(bind + " is already in use")
			process.exit(1)
			break
		default:
			throw error
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
	const addr = server.address()
	const bind = typeof addr === "string"
		? "pipe " + addr
		: "port " + addr?.port
	debug("Listening on " + bind)
}

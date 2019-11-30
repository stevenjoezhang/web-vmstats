/*
 * Web vmstats
 * Created by Shuqiao Zhang in 2019.
 * https://zhangshuqiao.org
 */

/*
 * This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 */

//https://github.com/websockets/ws/blob/master/examples/express-session-parse/index.js
const express = require("express");
const app = express();
const path = require("path");
const { spawn } = require("child_process");

var config = require(process.argv[2] || "./config.json");

if (!(config.port >= 0 && config.port < 65536 && config.port % 1 === 0)) {
	console.error("[ERROR] `port` argument must be an integer >= 0 and < 65536. Default value will be used.");
	config.port = 9000;
}

app.use(express.static(path.join(__dirname, "public")));

const http = require("http");
const server = http.createServer(app);
server.listen(config.port, () => {
	console.log("Server listening at port %d", config.port);
});

var WebSocket = require("ws"),
	wss = new WebSocket.Server({
		verifyClient: socketVerify,
		clientTracking: true,
		maxPayload: 1300,
		server
	});

function socketVerify(info) {
	if (config.debug) {
		console.log("[New User]", info.req.headers["sec-websocket-protocol"], info.origin, info.req.url, info.secure);
	}
	return true;
}

wss.on("error", error => {
	if (config.debug) {
		console.error("[ERROR] " + err);
	}
});

var child = spawn("/usr/bin/vmstat", ["-n", "1"]);

child.stdout.on("data", chunk => {
	if (!wss) return;
	var result = chunk.toString().replace("\n", "");
	wss.clients.forEach(client => {
		client.send(result);
	});
});

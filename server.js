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

// https://github.com/websockets/ws/blob/master/examples/express-session-parse/index.js
const MiServer = require("mimi-server");
const path = require("path");

const config = require(process.argv[2] || "./config.json");

const { server } = new MiServer({
	port: process.env.PORT || config.port,
	static: path.join(__dirname, "public")
});
const { spawn } = require("child_process");

const WebSocket = require("ws");
const wss = new WebSocket.Server({
	clientTracking: true,
	maxPayload: 1300,
	server
});

server.on('upgrade', (request, socket, head) => {
	if (config.debug) {
		console.log("[New User]", request.headers["sec-websocket-protocol"], request.headers.origin, request.url);
	}
});

wss.on("error", err => {
	if (config.debug) {
		console.error("[ERROR] " + err);
	}
});

const child = spawn("/usr/bin/vmstat", ["-n", "1"]);

child.stdout.on("data", chunk => {
	if (!wss) return;
	const result = chunk.toString().replace("\n", "");
	wss.clients.forEach(client => {
		client.send(result);
	});
});

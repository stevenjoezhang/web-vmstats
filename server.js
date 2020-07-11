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
const os = require("os");
const chalk = require("chalk");
const { spawn } = require("child_process");

app.use(express.static(path.join(__dirname, "public")));

const http = require("http");
const server = http.createServer(app);

const config = require(process.argv[2] || "./config.json");
if (!(config.port >= 0 && config.port < 65536 && config.port % 1 === 0)) {
	console.error("[ERROR] `port` argument must be an integer >= 0 and < 65536. Default value will be used.");
	config.port = 9000;
}
const port = process.env.PORT || config.port;
server.listen(port, () => {
	console.log(chalk.yellow("Server available on:"));
	const ifaces = os.networkInterfaces();
	Object.keys(ifaces).forEach(dev => {
		ifaces[dev].forEach(details => {
			if (details.family === 'IPv4') {
				console.log((`  http://${details.address}:${chalk.green(port.toString())}`));
			}
		});
	});
	console.log("Hit CTRL-C to stop the server");
});

const WebSocket = require("ws"),
	wss = new WebSocket.Server({
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

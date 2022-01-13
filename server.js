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
import MiServer from "mimi-server";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(process.argv[2] || "./config.json", "utf-8"));

const { server } = new MiServer({
	port: process.env.PORT || config.port,
	static: path.join(__dirname, "public")
});
import { spawn } from "child_process";
import WebSocket from "ws";
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

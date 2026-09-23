#!/usr/bin/env node
/**
 * Host-side HTTP/HTTPS proxy for the emulator.
 *
 * Why: QEMU's user-mode networking on this machine cannot forward DNS (UDP 53) - the guest gets
 * `UnknownHostException` for every host - while plain TCP out of the guest works fine. Pointing the
 * emulator's system proxy at this server moves name resolution to the host, which resolves normally.
 *
 *   node tools/dns-proxy.js                                  # terminal 1
 *   adb shell settings put global http_proxy 10.0.2.2:8888   # 10.0.2.2 = the host, from the guest
 *   adb shell settings delete global http_proxy              # to undo
 */
const http = require('node:http');
const net = require('node:net');

const PORT = Number(process.env.PROXY_PORT ?? 8888);

const server = http.createServer((req, res) => {
  // plain http - forward it
  const url = new URL(req.url, `http://${req.headers.host}`);
  const upstream = http.request(
    { host: url.hostname, port: url.port || 80, path: url.pathname + url.search, method: req.method, headers: req.headers },
    (upRes) => {
      res.writeHead(upRes.statusCode ?? 502, upRes.headers);
      upRes.pipe(res);
    },
  );
  upstream.on('error', (e) => {
    console.error('http error', url.hostname, e.message);
    res.writeHead(502).end();
  });
  req.pipe(upstream);
});

// https - the client sends CONNECT host:443 and we tunnel bytes both ways
server.on('connect', (req, clientSocket, head) => {
  const [host, port = '443'] = req.url.split(':');
  const upstream = net.connect(Number(port), host, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    if (head?.length) upstream.write(head);
    upstream.pipe(clientSocket);
    clientSocket.pipe(upstream);
  });
  upstream.on('error', (e) => {
    console.error('connect error', host, e.message);
    clientSocket.end();
  });
  clientSocket.on('error', () => upstream.destroy());
});

server.listen(PORT, '0.0.0.0', () => console.log(`proxy listening on ${PORT} - point the emulator at 10.0.2.2:${PORT}`));

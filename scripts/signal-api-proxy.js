// TCP proxy: forwards localhost:18810 -> 10.10.50.33:18810
// Required because OrbStack Docker containers cannot reach LAN IPs directly
const net = require('net');
const REMOTE_HOST = process.env.SIGNAL_API_HOST || '10.10.50.33';
const REMOTE_PORT = parseInt(process.env.SIGNAL_API_PORT || '18810');
const LOCAL_PORT = parseInt(process.env.LOCAL_PORT || '18810');

const server = net.createServer(client => {
  const upstream = net.connect(REMOTE_PORT, REMOTE_HOST, () => {
    client.pipe(upstream).pipe(client);
  });
  upstream.on('error', () => client.destroy());
  client.on('error', () => upstream.destroy());
});

server.listen(LOCAL_PORT, '0.0.0.0', () => {
  console.log(`signal-api-proxy: localhost:${LOCAL_PORT} -> ${REMOTE_HOST}:${REMOTE_PORT}`);
});

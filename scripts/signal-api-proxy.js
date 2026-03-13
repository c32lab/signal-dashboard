// TCP proxy: forwards localhost:8090 -> YOUR_SERVER_IP:8090
// Required because OrbStack Docker containers cannot reach LAN IPs directly
const net = require('net');
const REMOTE_HOST = process.env.SIGNAL_API_HOST || 'YOUR_SERVER_IP';
const REMOTE_PORT = parseInt(process.env.SIGNAL_API_PORT || '8090');
const LOCAL_PORT = parseInt(process.env.LOCAL_PORT || '8090');

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

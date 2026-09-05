const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(/import WebRTCRoomsView from '@\/components\/WebRTCRoomsView';/g, '');

code = code.replace(/<WebRTCRoomsView currentUser=\{currentUser\} playTacticalSound=\{playTacticalSound\} \/>/g, '<iframe src="/comms.html" className="w-full h-[700px] border-0 rounded-xl" allow="camera; microphone" />');

fs.writeFileSync('app/page.tsx', code);
console.log('patched iframe');

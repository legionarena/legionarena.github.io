const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(/import IntelPostsView from '@\/components\/IntelPostsView';/, "import WebRTCRoomsView from '@/components/WebRTCRoomsView';");

code = code.replace(/activeTab === 'intel-posts'/g, "activeTab === 'webrtc-rooms'");
code = code.replace(/setActiveTab\('intel-posts'\)/g, "setActiveTab('webrtc-rooms')");
code = code.replace(/Community Posts/g, "Comms Rooms");
code = code.replace(/COMMUNITY POSTS VIEW/g, "WEBRTC ROOMS VIEW");
code = code.replace(/<IntelPostsView[\s\S]*?\/>/, `<WebRTCRoomsView currentUser={currentUser} playTacticalSound={playTacticalSound} />`);

fs.writeFileSync('app/page.tsx', code);
console.log('patched app/page.tsx');

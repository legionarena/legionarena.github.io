const fs = require('fs');
let code = fs.readFileSync('public/comms.html', 'utf8');

const permsBox = `
      <div id="permissions-box" style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 20px; text-align: left;">
        <div style="font-size: 0.85rem; font-weight: bold; margin-bottom: 8px; color: #cbd5e1;">Required Device Permissions:</div>
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>📷 Camera</span>
            <span id="perm-cam" style="color: #94a3b8;">Checking...</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>🎙️ Microphone</span>
            <span id="perm-mic" style="color: #94a3b8;">Checking...</span>
          </div>
        </div>
      </div>
      <div id="error-msg"></div>
`;

code = code.replace('<div id="error-msg"></div>', permsBox);

const permsScript = `
    async function checkPermissions() {
      const elCam = document.getElementById('perm-cam');
      const elMic = document.getElementById('perm-mic');

      const checkPerm = async (name, el) => {
        try {
          const res = await navigator.permissions.query({ name: name });
          const update = () => {
            if (res.state === 'granted') {
              el.textContent = '✅ Granted';
              el.style.color = '#34d399';
            } else if (res.state === 'denied') {
              el.textContent = '❌ Missing (Denied)';
              el.style.color = '#f87171';
            } else {
              el.textContent = '⚠️ Needed (Prompt)';
              el.style.color = '#fbbf24';
            }
          };
          update();
          res.onchange = update;
        } catch (e) {
          el.textContent = '⚠️ Needed (Click to prompt)';
          el.style.color = '#fbbf24';
        }
      };

      checkPerm('camera', elCam);
      checkPerm('microphone', elMic);
    }
    checkPermissions();
`;

code = code.replace('// Init UI Listeners', permsScript + '\n    // Init UI Listeners');

const getLocalMediaOld = `    async function getLocalMedia() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoLocal.srcObject = localStream;
        return true;
      } catch (err) {
        console.error('Media error', err);
        showError('Could not access Camera/Microphone.');
        return false;
      }
    }`;

const getLocalMediaNew = `    async function getLocalMedia() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoLocal.srcObject = localStream;
        checkPermissions();
        return true;
      } catch (err) {
        console.error('Media error', err);
        let reason = "Could not access Camera/Microphone.";
        if (err.name === 'NotAllowedError') reason = "Permission denied! Please allow camera and microphone access in your browser settings.";
        else if (err.name === 'NotFoundError') reason = "No camera or microphone found on this device.";
        else if (err.name === 'NotReadableError') reason = "Camera or microphone is already in use by another application.";
        showError(reason);
        checkPermissions();
        return false;
      }
    }`;

code = code.replace(getLocalMediaOld, getLocalMediaNew);

fs.writeFileSync('public/comms.html', code);
console.log('patched comms.html for perms');

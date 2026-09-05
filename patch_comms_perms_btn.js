const fs = require('fs');
let code = fs.readFileSync('public/comms.html', 'utf8');

// Insert styles
code = code.replace('</style>', `
    #perms-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100; align-items: center; justify-content: center; padding: 20px; text-align: left; }
    .perms-modal-content { background: var(--panel); border: 1px solid var(--border); padding: 25px; border-radius: 12px; max-width: 400px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
    .perms-modal-content h2 { color: #f87171; font-size: 1.2rem; margin-bottom: 15px; }
    .perms-modal-content p { color: #cbd5e1; font-size: 0.9rem; margin-bottom: 10px; line-height: 1.5; }
    .perms-modal-content ul { color: #cbd5e1; font-size: 0.9rem; margin-bottom: 20px; padding-left: 20px; }
    .perms-modal-content li { margin-bottom: 5px; }
  </style>`);

// Replace permissions box
const oldBox = `      <div id="permissions-box" style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 20px; text-align: left;">
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
      </div>`;

const newBox = `      <div id="permissions-box" style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 20px; text-align: left;">
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
        <button id="btn-fix-perms" class="btn" style="margin-top: 12px; margin-bottom: 0; padding: 8px; font-size: 0.85rem; background: #3b82f6;">Request / Fix Permissions</button>
      </div>`;

code = code.replace(oldBox, newBox);

// Insert modal body after #room-view
const modalBody = `
  <div id="perms-modal">
    <div class="perms-modal-content">
      <h2>Permissions Denied</h2>
      <p>Your browser is blocking camera or microphone access. To fix this:</p>
      <ul>
        <li>Click the <strong>padlock icon (🔒)</strong> or <strong>tune icon (🚥)</strong> on the left side of your browser's address bar.</li>
        <li>Find <strong>Camera</strong> and <strong>Microphone</strong> and change them to <strong>Allow</strong>.</li>
        <li>Refresh the page.</li>
      </ul>
      <button class="btn" id="btn-close-perms-modal" style="margin-bottom: 0;">Got it</button>
    </div>
  </div>
`;
code = code.replace('  <script type="module">', modalBody + '\n  <script type="module">');

// Add logic
const jsLogic = `
    const btnFixPerms = document.getElementById('btn-fix-perms');
    const permsModal = document.getElementById('perms-modal');
    const btnClosePermsModal = document.getElementById('btn-close-perms-modal');

    btnClosePermsModal.addEventListener('click', () => {
      permsModal.style.display = 'none';
    });

    btnFixPerms.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => track.stop());
        checkPermissions();
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          permsModal.style.display = 'flex';
        } else {
          showError('Cannot access media devices: ' + err.message);
        }
        checkPermissions();
      }
    });
`;

code = code.replace('// Init UI Listeners', jsLogic + '\n    // Init UI Listeners');

fs.writeFileSync('public/comms.html', code);
console.log('patched btn');

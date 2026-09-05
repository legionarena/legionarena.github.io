const fs = require('fs');
let html = fs.readFileSync('public/rpg-game.html', 'utf8');

// 1. Extract the party hud
const partyHudStart = html.indexOf('<!-- AI SUPPORT COMPANIONS & PRIORITY TACTICS HUD -->');
const partyHudEnd = html.indexOf('<!-- Party & Hero Command & P2P Room Buttons -->');

if (partyHudStart > -1 && partyHudEnd > -1) {
  let partyHudStr = html.substring(partyHudStart, partyHudEnd);
  
  // Clean up the party hud panel classes so it sits seamlessly
  // partyHudStr = partyHudStr.replace('class="party-hud-panel hud-interactive"', 'class="party-hud-panel-merged"');
  
  html = html.substring(0, partyHudStart) + html.substring(partyHudEnd);
  
  // 2. Find where to inject it into the player card
  // Insert it before "<!-- Embedded Decaying Slain Foes & Drops Log -->" or after it
  // Let's put it after XP bar and before the slain foes box, or maybe after slain foes box.
  // We'll put it right before the slain foes box for better grouping of living party members.
  
  const injectTarget = '<!-- Embedded Decaying Slain Foes & Drops Log -->';
  const injectIdx = html.indexOf(injectTarget);
  
  if (injectIdx > -1) {
    html = html.substring(0, injectIdx) + partyHudStr + '\n          ' + html.substring(injectIdx);
  }
}

// Rename the merged card title if we can.
// The left panel max-width might need to be increased for the companions if it's too squished.
html = html.replace('max-width: 290px;', 'max-width: 320px;');

// Let's modify the party-hud-panel class to drop background/border if it's inside another card.
// We can just replace 'class="party-hud-panel hud-interactive"' with 'class="merged-party-panel"'
html = html.replace('class="party-hud-panel hud-interactive" id="hud-party-panel"', 'class="" id="hud-party-panel" style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;"');

fs.writeFileSync('public/rpg-game.html', html);
console.log('patched');

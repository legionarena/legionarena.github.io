const fs = require('fs');
let code = fs.readFileSync('lib/db.ts', 'utf8');

code = code.replace(/export interface IntelThread[\s\S]*?export interface RpgGearItem/, "export interface RpgGearItem");
code = code.replace(/posts: IntelPost\[\];/, "");
code = code.replace(/IntelThread, IntelPost, /, "");

fs.writeFileSync('lib/db.ts', code);
console.log('patched lib/db.ts');

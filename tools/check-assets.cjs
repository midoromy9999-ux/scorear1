const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public');let count=0;
function exists(relative,from='index.html'){
  if(/^(https?:|data:|#|mailto:|javascript:)/.test(relative))return;
  const clean=relative.split(/[?#]/)[0];if(!clean)return;
  const resolved=path.resolve(root,path.dirname(from),clean);
  assert.ok(resolved.startsWith(root+path.sep),'Asset escaped output: '+relative);
  assert.ok(fs.existsSync(resolved),'Missing asset: '+relative+' from '+from);count++;
}
for(const page of ['index.html','cards.html','characters.html','podium.html']){
 const html=fs.readFileSync(path.join(root,page),'utf8');
 for(const m of html.matchAll(/(?:src|href)=["']([^"']+)["']/g))exists(m[1],page);
}
for(const card of JSON.parse(fs.readFileSync(path.join(root,'cards.json'),'utf8')))exists(card.image);
for(const icon of JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).icons || [])exists(icon.src);
exists('../assets/academy.webp','css/scorear-styles.bundle.css');
for(let n=1;n<=20;n++)exists('assets/characters/animated/char_'+String(n).padStart(2,'0')+'-idle.webp');
assert.ok(!fs.existsSync(path.join(root,'css/assets')),'Duplicated CSS assets');
assert.ok(!fs.existsSync(path.join(root,'js/engines/assets')),'Duplicated engine assets');
console.log('ASSETS: '+count+' references checked; one assets tree.');

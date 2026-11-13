import fs from 'node:fs';
import vm from 'node:vm';
const slug=process.argv[2],base=`ASTRA/versions/${slug}`,ctx={window:{}};
vm.runInNewContext(fs.readFileSync(`${base}/config.js`,'utf8'),ctx);
const p=ctx.window.PITCH,time=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
let total=0;
const lines=p.cues.map((c,i)=>{
 const words=c[4].replace(/\[[^\]]*\]/g,'').split(/\s+/).filter(Boolean).length;total+=words;
 return `## ${time(c[0])}–${time(p.cues[i+1]?.[0]??180)} — ${c[3]}\n\n${c[4]}\n`;
});
fs.writeFileSync(`${base}/SCRIPT.md`,`# ${p.title} — three-minute speaker script\n\n${total} spoken words, excluding bracketed stage directions. The original film has its own soundtrack. Rehearse with the timed preview; in live mode, advance when the sentence lands. Every cue below is built into the notes overlay.\n\n${lines.join('\n')}\nThe final frame holds. Pause for the audience before taking questions. Clinical plans and timings in the demo are synthetic.\n`);
console.log(slug,total,'spoken words');

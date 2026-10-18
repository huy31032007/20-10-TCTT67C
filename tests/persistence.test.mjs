import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';

async function start(directory) {
  const child = spawn(process.execPath,['server/local.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,HOST:'127.0.0.1',PORT:'0',GARDEN_DATA_DIR:directory},stdio:['ignore','pipe','pipe']});
  const url = await new Promise((resolve,reject) => {
    const timer = setTimeout(()=>{child.kill();reject(new Error('Server did not start'));},5000);
    child.stdout.on('data',data=>{const match=data.toString().match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0]);}});
    child.once('error',error=>{clearTimeout(timer);reject(error);});
  });
  return {url, async stop(){child.kill();await once(child,'exit');}};
}
test('shared entries survive a full server restart; private storage is not served as an asset', async () => {
  const directory = await mkdtemp(join(tmpdir(),'class-garden-persistence-'));
  let server;
  try {
    server=await start(directory);
    const saved=await fetch(`${server.url}/api/garden`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Kiểm thử An'})});
    assert.equal(saved.status,201);
    assert.equal((await fetch(`${server.url}/data/garden.json`)).status,404);
    await server.stop();
    server=await start(directory);
    const after=await (await fetch(`${server.url}/api/garden`)).json();
    assert.equal(after.members[0].name,'Kiểm thử An');
    assert.equal(after.members.length,1);
  } finally {if(server)await server.stop();await rm(directory,{recursive:true,force:true});}
});

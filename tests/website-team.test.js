import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultTeam,parseTeam,safeImage} from '../src/data/websiteTeam.js';
test('existing team and edited CMS biography survive introduction of directory',()=>{
 const team=defaultTeam({'about-page-hilde-bio':'Saved biography'});
 assert.equal(team.find(p=>p.id==='hilde').bioNo,'Saved biography');
 assert.equal(team.filter(p=>p.group==='prayer').length,16);
 assert.equal(new Set(team.map(p=>p.id)).size,team.length);
});
test('saved empty directory intentionally hides all people; invalid data preserves existing people',()=>{assert.deepEqual(parseTeam('[]'),[]);assert.equal(parseTeam('broken').length,19);});
test('image URLs reject executable and untrusted protocols',()=>{for(const url of ['javascript:alert(1)','data:text/html,test','//evil.test/a','http://evil.test'])assert.equal(safeImage(url),'');assert.equal(safeImage('/assets/hilde.jpg'),'/assets/hilde.jpg');});

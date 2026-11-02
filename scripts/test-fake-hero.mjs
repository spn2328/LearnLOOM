import assert from 'node:assert/strict';
import {lessons,checkpoint,checkpointReasons} from '../features/fake-hero/content/episode01.ts';
const expected=[['Q01','A','B','A','B'],['Q02','B','B','B','B'],['Q03','A','C','B','B'],['Q04','B','A','C','C'],['Q05','B','A','A','B']];
assert.equal(lessons.length,5,'Expected five chemistry concepts');
for(let i=0;i<5;i++){
 const l=lessons[i], [id,q,r,a,rc]=expected[i];
 assert.equal(l.main.id,id); assert.equal(l.main.answer,q);assert.equal(l.reason.answer,r);
 assert.equal(l.activity.answer,a);assert.equal(l.recheck.answer,rc);
 for(const item of [l.activity,l.main,l.reason,l.practice,l.recheck]){
   assert.ok(item.prompt.length>5,item.id+' needs a prompt');
   assert.ok(item.choices.length>=2&&item.choices.length<=4,item.id+' options');
   assert.ok(item.choices['ABCD'.indexOf(item.answer)],item.id+' valid answer');
 }
 assert.ok(l.story.length>0&&l.concept.length>0&&l.models.length>0);
}
assert.deepEqual(checkpoint.map(q=>q.answer),['A','C','B','A','C']);
assert.equal(checkpointReasons.length,5);
assert.deepEqual(checkpointReasons.map(q=>q.answer),['B','A','D','A','B']);
for(const reason of checkpointReasons){assert.equal(reason.choices.length,4);assert.ok(reason.choices['ABCD'.indexOf(reason.answer)]);}
// Q04 adaptive flow: owner-confirmed prompts, valid keys, and the cause → path mapping.
const {diagnosis,choosePath,midCheck,recheckB}=await import('../features/fake-hero/content/adaptive04.ts');
assert.equal(lessons[3].main.prompt,'CH₃–C(?)=CH₂ คาร์บอนตรงกลางต้องมีไฮโดรเจนกี่อะตอม จึงจะมีผลรวมอันดับพันธะเท่ากับ?');
assert.deepEqual(diagnosis.map(d=>d.id),['D01','D02','D03','D04']);
for(const q of [...diagnosis,...Object.values(midCheck),recheckB])assert.ok(q.choices['ABCD'.indexOf(q.answer)],q.id+' valid answer');
const right=Object.fromEntries(diagnosis.map(d=>[d.id,d.answer]));
assert.equal(choosePath({...right,D01:'A'}),'A');
assert.equal(choosePath({...right,D02:'A'}),'B');
assert.equal(choosePath({...right,D04:'A'}),'C');
assert.equal(choosePath({...right,D02:'A',D03:'A'}),'D');
// PDF adaptive flows (เนื้อเรื่องและคำถามล่าสุด.pdf): valid keys, PDF answer keys, path rule.
const {adaptiveUnits,pickPath,pickTransfer,nextSwitch}=await import('../features/fake-hero/content/adaptiveUnits.ts');
assert.deepEqual(Object.keys(adaptiveUnits),['C01','C02','C03','C04','C05']);
for(const u of Object.values(adaptiveUnits)){
  for(const q of [...u.diagnosis,...u.practice,u.recheck,u.recheckB])assert.ok(q.choices['ABCD'.indexOf(q.answer)],q.id+' valid answer');
  assert.deepEqual(Object.keys(u.paths),['A','B','C','D']);
  const right=Object.fromEntries(u.diagnosis.map(d=>[d.id,d.answer]));
  assert.equal(pickPath(u,right),'C');
  for(const d of u.diagnosis){const wrong=d.answer==='A'?'B':'A';assert.equal(pickPath(u,{...right,[d.id]:wrong}),d.group,d.id+' path');}
}
const keys=Object.fromEntries(Object.values(adaptiveUnits).flatMap(u=>[...u.practice,u.recheck,u.recheckB]).map(q=>[q.id,q.answer]));
assert.deepEqual(keys,{'R01-1':'A','R01-2':'B',RC01:'B','RC01-B':'C','R02-1':'A','R02-2':'C',RC02:'B','RC02-B':'C','R03-1':'A','R03-2':'C',RC03:'B','RC03-B':'C','R04-1':'C','R04-2':'C',RC04:'C','RC04-B':'B','R05-1':'A','R05-2':'C',RC05:'B','RC05-B':'A'});
// each RC0x in the adaptive flow is the same item as the lesson's recheck
for(const [i,u] of Object.values(adaptiveUnits).entries())assert.deepEqual(u.recheck,lessons[i].recheck,u.id+' recheck matches episode01');
const c04=adaptiveUnits.C04,all=Object.fromEntries(c04.diagnosis.map(d=>[d.id,d.answer]));
assert.equal(pickPath(c04,{...all,'D04-1':'A','D04-2':'A'}),'D');
assert.match(pickTransfer(c04,all).id,/T04-B/);
assert.match(pickTransfer(c04,{}).id,/T04-A/);
// help switch: neighbouring level first, never repeat, never the path already taught
assert.equal(nextSwitch('B',[]),'A');assert.equal(nextSwitch('B',['A']),'C');assert.equal(nextSwitch('C',[]),'B');assert.equal(nextSwitch('A',['B']),'C');assert.equal(nextSwitch('D',['A']),'B');
for(const p of ['A','B','C'])assert.notEqual(nextSwitch(p,[]),p);
console.log('Fake Hero EP01 content: five concepts and answer keys verified');

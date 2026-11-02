import assert from 'node:assert/strict';
import {lessons,checkpoint,checkpointReasons} from '../features/fake-hero/content/episode01.ts';
const expected=[['Q01','A','B','A','B'],['Q02','B','B','B','B'],['Q03','A','C','B','B'],['Q04','B','A','C','B'],['Q05','B','A','A','B']];
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
console.log('Fake Hero EP01 content: five concepts and answer keys verified');

import assert from 'node:assert/strict';
import {lessons,checkpoint} from '../features/fake-hero/content/episode01.ts';
const expected=[['Q01','A','B','A','B'],['Q02','B','B','B','B'],['Q03','A','C','B','B'],['Q04','C','B','C','C'],['Q05','B','A','A','B']];
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
console.log('Fake Hero EP01 content: five concepts and answer keys verified');

import test from 'node:test';
import assert from 'node:assert/strict';
import {serviceSummary} from '../../frontend/src/utils/serviceReports.ts';
const row=(id,service_id,date,status='ACTIVE',member_id='m1',trainer_id='t1')=>({id,service_id,date,status,member_id,trainer_id});
test('Separate services, inclusive dates, cancellations, unique members and empty new service',()=>{
 const rows=[row('1','gym','2026-09-01'),row('2','gym','2026-09-30'),row('3','yoga','2026-09-10'),row('4','gym','2026-09-10','CANCELLED','m2','t2'),row('5','gym','2026-08-31')];
 const r=serviceSummary(rows,'gym','2026-09-01','2026-09-30','month');
 assert.equal(r.total,3);assert.equal(r.active,2);assert.equal(r.cancelled,1);assert.equal(r.members,1);assert.equal(r.coaches,1);assert.deepEqual(r.buckets,[{label:'2026-09',value:2}]);
 assert.equal(serviceSummary(rows,'yoga','2026-09-01','2026-09-30','day').active,1);
 assert.equal(serviceSummary(rows,'new','2026-09-01','2026-09-30','year').total,0);
});

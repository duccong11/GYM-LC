import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { stripTypeScriptTypes } from 'node:module';
const dir='outputs/gym-report-unit';await fs.mkdir(dir,{recursive:true});
const load=async path=>import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(await fs.readFile(path,'utf8'))).toString('base64'));
const root='src/main/webapp/src/utils/';
const {summarize}=await load(root+'reports.ts');
const {serviceSummary}=await load(root+'serviceReports.ts');
const {filterServices}=await load(root+'services.ts');
const groups=[];
const group=(name,file,title,precondition)=>{const g={name,module:root+file,title,precondition,engine:'Node.js assert',cases:[]};groups.push(g);return g;};
function check(g,title,type,input,expected,call,error='',ecode=''){
 const c={title,type,input,expected:typeof expected==='string'?expected:JSON.stringify(expected),error:error||'Không có ngoại lệ',ecode,pass:false};g.cases.push(c);
 try{let actual;try{actual=call();}catch(e){if(!error)throw e;assert.equal(e.message,error);actual='RangeError: '+e.message;}c.actual=typeof actual==='string'?actual:JSON.stringify(actual);assert.deepEqual(actual,expected);c.pass=true;}catch(e){c.actual=e.message;}
}
const p=(id,amount,created_at,extra={})=>({id,plan_id:'G1',plan_name:'Gym',amount,method:'Tiền mặt',created_at,...extra});
const r=(id,plan_id,plan_name,extra={})=>({id,plan_id,plan_name,status:'ACTIVE',created_at:'2026-10-01T03:00:00Z',...extra});
const g=group('summarize','reports.ts','Doanh thu ngày, tháng, năm và top 3 gói tập','Gọi summarize(payments, registrations, from, to, group). Ngày chứng từ đổi về giờ Việt Nam. So sánh các trường được ghi ở đầu ra; không gửi HTTP.');
function report(title,type,payments,registrations,from,to,period,expected,select,error=''){
 check(g,title,type,{payments,registrations,from,to,group:period},expected,()=>select(summarize(payments,registrations,from,to,period)),error,error?'E1':'');
}
report('Không có giao dịch vẫn có ngày doanh thu 0','N',[],[],'2026-10-01','2026-10-01','day',{revenue:0,buckets:[{period:'2026-10-01',amount:0,count:0}],choices:0},x=>({revenue:x.revenue,buckets:x.buckets,choices:x.choices}));
const payment=[p('P1',100000,'2026-10-01T03:00:00Z'),p('P2',200000,'2026-10-01T04:00:00Z',{method:'Chuyển khoản'})];
report('Cộng doanh thu, tách tiền mặt và chuyển khoản','N',payment,[],'2026-10-01','2026-10-01','day',{revenue:300000,cash:100000,transfer:200000},x=>({revenue:x.revenue,cash:x.cash,transfer:x.transfer}));
report('Loại hóa đơn đã hủy','A',[payment[0],{...payment[1],cancelled:1}],[],'2026-10-01','2026-10-01','day',100000,x=>x.revenue);
report('Gộp doanh thu theo tháng','N',[payment[0],p('P3',50000,'2026-11-01T03:00:00Z')],[],'2026-10-01','2026-11-01','month',[{period:'2026-10',amount:100000,count:1},{period:'2026-11',amount:50000,count:1}],x=>x.buckets);
report('Gộp doanh thu theo năm','N',[payment[0],p('P4',50000,'2027-01-01T03:00:00Z')],[],'2026-10-01','2027-01-01','year',[{period:'2026',amount:100000,count:1},{period:'2027',amount:50000,count:1}],x=>x.buckets);
report('Biên 00:00 và 23:59:59 giờ Việt Nam; loại ngoài ngày','B',[p('P1',1,'2026-09-30T16:59:59Z'),p('P2',10,'2026-09-30T17:00:00Z'),p('P3',100,'2026-10-01T16:59:59Z'),p('P4',1000,'2026-10-01T17:00:00Z')],[],'2026-10-01','2026-10-01','day',110,x=>x.revenue);
const regs=[r('R1','G1','Gym'),r('R2','G1','Gym'),r('R3','G1','Gym'),r('R4','G2','Yoga'),r('R5','G2','Yoga'),r('R6','G3','Boxing'),r('R7','G4','Zumba')];
report('Chỉ lấy 3 gói, ưu tiên số lượt rồi tên khi bằng nhau','N',[],regs,'2026-10-01','2026-10-01','day',[{id:'G1',name:'Gym',count:3},{id:'G2',name:'Yoga',count:2},{id:'G3',name:'Boxing',count:1}],x=>x.top);
report('Không đếm đôi đăng ký có hóa đơn liên kết','N',[{...payment[0],registration_id:'R1'}],[regs[0]],'2026-10-01','2026-10-01','day',1,x=>x.choices);
report('Loại đăng ký hủy, tính hóa đơn cũ chưa liên kết','N',[payment[0]],[{...regs[0],status:'CANCELLED'}],'2026-10-01','2026-10-01','day',1,x=>x.choices);
report('Từ ngày lớn hơn đến ngày','A',[],[],'2026-10-02','2026-10-01','day','RangeError: Khoảng báo cáo không hợp lệ.',x=>x,'Khoảng báo cáo không hợp lệ.');
report('Sai định dạng ngày báo cáo','A',[],[],'01/10/2026','2026-10-01','day','RangeError: Khoảng báo cáo không hợp lệ.',x=>x,'Khoảng báo cáo không hợp lệ.');
report('Bỏ trống ngày báo cáo','A',[],[],'','','day','RangeError: Khoảng báo cáo không hợp lệ.',x=>x,'Khoảng báo cáo không hợp lệ.');
const s=group('serviceSummary','serviceReports.ts','Thống kê số buổi, hội viên và HLV theo dịch vụ','Gọi serviceSummary(rows, id, from, to, group). Chỉ ACTIVE được tính vào buổi tập, hội viên và HLV. Khoảng ngày đã hợp lệ ở nơi gọi.');
const schedules=[{id:'L1',service_id:'S1',date:'2026-10-01',status:'ACTIVE',member_id:'M1',trainer_id:'T1',trainer_name:'An'},{id:'L2',service_id:'S1',date:'2026-10-02',status:'ACTIVE',member_id:'M1',trainer_id:'T1',trainer_name:'An'},{id:'L3',service_id:'S1',date:'2026-10-02',status:'CANCELLED',member_id:'M2',trainer_id:'T2',trainer_name:'Bình'},{id:'L4',service_id:'S2',date:'2026-10-01',status:'ACTIVE',member_id:'M3',trainer_id:'T3',trainer_name:'Chi'}];
function service(title,type,rows,id,from,to,period,expected,select){check(s,title,type,{rows,id,from,to,group:period},expected,()=>select(serviceSummary(rows,id,from,to,period)));}
service('Lọc đúng dịch vụ, đếm trạng thái và người duy nhất','N',schedules,'S1','2026-10-01','2026-10-02','day',{total:3,active:2,cancelled:1,members:1,coaches:1},x=>({total:x.total,active:x.active,cancelled:x.cancelled,members:x.members,coaches:x.coaches}));
service('Số buổi theo ngày','N',schedules,'S1','2026-10-01','2026-10-02','day',[{label:'2026-10-01',value:1},{label:'2026-10-02',value:1}],x=>x.buckets);
service('Số buổi theo tháng','N',schedules,'S1','2026-10-01','2026-10-02','month',[{label:'2026-10',value:2}],x=>x.buckets);
service('Số buổi theo năm','N',schedules,'S1','2026-10-01','2026-10-02','year',[{label:'2026',value:2}],x=>x.buckets);
service('Biên ngày đầu bằng ngày cuối','B',schedules,'S1','2026-10-02','2026-10-02','day',2,x=>x.total);
service('Dịch vụ không có lịch','N',[],'S9','2026-10-01','2026-10-02','day',{total:0,members:0,coaches:0},x=>({total:x.total,members:x.members,coaches:x.coaches}));
service('HLV có 2 buổi đứng trước HLV có 1 buổi','N',[...schedules,{...schedules[0],id:'L5',trainer_id:'T4',trainer_name:'Dũng'}],'S1','2026-10-01','2026-10-02','day',[{label:'An',value:2},{label:'Dũng',value:1}],x=>x.trainers);
const f=group('filterServices','services.ts','Tìm kiếm dịch vụ theo tên','Gọi filterServices(rows, query). Danh sách: S1=Gym; S2=Yoga; S3=Boxing. Không phân biệt hoa thường, cắt khoảng trắng hai đầu; không tự bỏ dấu tiếng Việt.');
const rows=[{id:'S1',name:'Gym'},{id:'S2',name:'Yoga'},{id:'S3',name:'Boxing'}];
for(const [title,q,expected]of [['Tìm đúng tên','Gym',['S1']],['Không phân biệt hoa thường','yOgA',['S2']],['Cắt khoảng trắng đầu cuối','  Gym  ',['S1']],['Tìm một phần tên','ox',['S3']],['Rỗng trả toàn bộ','',['S1','S2','S3']],['Không có tên phù hợp','Pilates',[]]])check(f,title,'N',{rows,query:q},expected,()=>{const snapshot=JSON.stringify(rows);const result=filterServices(rows,q).map(x=>x.id);assert.equal(JSON.stringify(rows),snapshot);return result;});
await fs.writeFile(dir+'/js-cases.json',JSON.stringify(groups,null,2));
const failed=groups.flatMap(g=>g.cases).filter(c=>!c.pass);console.log('JS unit cases:',groups.reduce((n,g)=>n+g.cases.length,0),'failed:',failed.length);if(failed.length){console.log(failed);process.exitCode=1;}

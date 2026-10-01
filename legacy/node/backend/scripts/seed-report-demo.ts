import {pool} from '../src/config/database.ts';
import {transaction} from '../src/models/database.model.ts';
import {addDays} from '../src/utils/gym.ts';
// Explicit, repeatable demo dataset. Never called on startup.
const anchor='2026-09-30', base=addDays(anchor,-39), prefix='report-demo-202609';
const names=['Nguyễn Minh Anh','Trần Hoàng Nam','Lê Thanh Hà','Phạm Gia Huy','Võ Ngọc Mai','Đặng Tuấn Kiệt','Bùi Khánh Linh','Đỗ Đức Long','Hồ Phương Thảo','Dương Bảo Ngọc'];
const counts:Record<string,number>={members:0,trainers:0,rooms:0,plans:0,registrations:0,payments:0,schedules:0,services:0};
try {
 await transaction(async db=>{
  const insert=async(table:string, id:string,columns:string,values:unknown[])=>{
   if(await db.prepare('SELECT id FROM '+table+' WHERE id=?').bind(id).first())return;
   await db.prepare(`INSERT INTO ${table}(id,${columns}) VALUES(${['?',...values.map(()=>'?')].join(',')})`).bind(id,...values).run();counts[table]=(counts[table]||0)+1;
  };
  const plans=[['Trải nghiệm',30,350000],['Tiêu chuẩn',90,900000],['Nâng cao',180,1600000],['Cả năm',365,3000000]] as const;
  for(let p=0;p<plans.length;p++)await insert('plans',`${prefix}-p${p}`,'name,days,price,description,code',[`${plans[p][0]} · Mẫu`,plans[p][1],plans[p][2],'Dữ liệu mẫu cho báo cáo',`RP26P${p}`]);
  for(const [s,name] of ['Gym','Yoga','Boxing'].entries()){
   const existing=await db.prepare('SELECT id,active,deleted FROM services WHERE name=?').bind(name).first<{id:string;active:number;deleted:number}>();
   if(existing&&(!existing.active||existing.deleted))throw new Error(`Dịch vụ ${name} đã ngừng; không tự thay đổi.`);
   const sid=existing?.id||`${prefix}-s${s}`;
   if(!existing)await insert('services',sid,'name,description',[name,'Dữ liệu mẫu cho báo cáo']);
   const room=`${prefix}-room${s}`;
   await insert('rooms',room,'name,type,capacity,description',[`Phòng ${name} · Mẫu`,name,20,'Phòng riêng cho lịch mẫu']);
   for(let t=0;t<2;t++){
    const tid=`${prefix}-t${s}-${t}`;
    await insert('trainers',tid,'name,phone,email,specialty,experience,schedule,code',[`${names[s*2+t]} · Mẫu`,`0997600${s}${t}0`,`${tid}@example.test`,name,3+t,'08:00–18:00',`RP26T${s}${t}`]);
    if(!await db.prepare('SELECT trainer_id FROM trainer_services WHERE trainer_id=? AND service_id=?').bind(tid,sid).first())await db.prepare('INSERT INTO trainer_services(trainer_id,service_id) VALUES(?,?)').bind(tid,sid).run();
   }
   for(let j=0;j<20;j++){
    const mid=`${prefix}-m${s}-${j}`,p=j%10<5?0:j%10<8?1:j%10===8?2:3;
    const start=addDays(base,j*2),end=addDays(start,plans[p][1]-1),date=start+' 07:00:00';
    const reg=`${prefix}-r${s}-${j}`,pay=`${prefix}-pay${s}-${j}`;
    await insert('members',mid,'name,phone,email,gender,created_at,trainer_id,code',[`${names[j%10]} ${s+1}${Math.floor(j/10)+1} · Mẫu`,`09876${s}${String(j).padStart(4,'0')}`,`${mid}@example.test`,j%2?'Nữ':'Nam',date,`${prefix}-t${s}-${j%2}`,`RP26M${s}${j}`]);
    await insert('registrations',reg,'member_id,plan_id,plan_name,price,start_date,end_date,status,created_at,code,original_price,discount_percent,promotion_name',[mid,`${prefix}-p${p}`,`${plans[p][0]} · Mẫu`,plans[p][2],start,end,'ACTIVE',date,`RP26R${s}${j}`,plans[p][2],0,'']);
    await insert('payments',pay,'member_id,plan_id,plan_name,amount,method,start_date,end_date,created_at,request_id,requested_start,registration_id,code',[mid,`${prefix}-p${p}`,`${plans[p][0]} · Mẫu`,plans[p][2],j%3?'Chuyển khoản':'Tiền mặt',start,end,date,pay,start,reg,`RP26PAY${s}${j}`]);
    for(let k=0;k<4;k++){
     const day=addDays(start,Math.floor(k/2)),hour=k%2?'16:00':'08:00';
     await insert('schedules',`${prefix}-slot${s}-${j}-${k}`,'member_id,trainer_id,room_id,service_id,date,start_time,end_time,note,status,created_at,code',[mid,`${prefix}-t${s}-${k%2}`,room,sid,day,hour,k%2?'17:00':'09:00','Dữ liệu mẫu biểu đồ', (j+k+s)%11===0?'CANCELLED':'ACTIVE',date,`RP26L${s}${j}K${k}`]);
    }
   }
  }
 },true);
 console.log(JSON.stringify({added:counts,period:base+' — '+anchor}));
}finally{await pool.end();}

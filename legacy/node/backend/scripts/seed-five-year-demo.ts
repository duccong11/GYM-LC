import {pool} from '../src/config/database.ts';
import {transaction} from '../src/models/database.model.ts';
import {addDays} from '../src/utils/gym.ts';

// Explicit historical demo, not a startup task. Fixed IDs make reruns safe.
const replica=Number(process.argv[2] || 0);
if(!Number.isInteger(replica)||replica<0||replica>4)throw new Error('Replica phải từ 0 đến 4.');
const prefix='demo5y-202110-202609'+(replica?`-b${replica}`:'');
const codePrefix=replica?`D5B${replica}`:'D5Y';
const names=['Nguyễn Minh Anh','Trần Hoàng Nam','Lê Thanh Hà','Phạm Gia Huy','Võ Ngọc Mai','Đặng Tuấn Kiệt','Bùi Khánh Linh','Đỗ Đức Long','Hồ Phương Thảo','Dương Bảo Ngọc','Nguyễn Hải Đăng','Trần Thu Trang'];
const planData=[['Cơ bản',30,350000],['Tiêu chuẩn',90,900000],['Nâng cao',180,1600000],['Trọn năm',365,3000000]] as const;
const counts:Record<string,number>={};
try {
 await transaction(async db=>{
  async function batch(table:string,columns:string,rows:unknown[][]){
   const existing=new Set((await db.prepare(`SELECT id FROM ${table} WHERE id LIKE ?`).bind(prefix+'-%').all<{id:string}>()).results.map(r=>r.id));
   const fresh=rows.filter(r=>!existing.has(String(r[0])));counts[table]=(counts[table]||0)+fresh.length;
   for(let i=0;i<fresh.length;i+=150){const part=fresh.slice(i,i+150);await db.connection.query(`INSERT INTO ${table}(${columns}) VALUES ${part.map(r=>'('+r.map(()=>'?').join(',')+')').join(',')}`,part.flat());}
  }
  const serviceIds:string[]=[];
  for(const [i,name] of ['Gym','Yoga','Boxing'].entries()){
   const s=await db.prepare('SELECT id,active,deleted FROM services WHERE name=?').bind(name).first<{id:string;active:number;deleted:number}>();
   if(s&&(!s.active||s.deleted))throw new Error(`${name} đang ngừng hoạt động; không thay đổi tự động.`);
   const id=s?.id||`${prefix}-service${i}`;serviceIds.push(id);
   if(!s)await batch('services','id,name,description',[[id,name,'Dữ liệu mẫu báo cáo 5 năm']]);
  }
  await batch('plans','id,code,name,days,price,description',planData.map((p,i)=>[`${prefix}-plan${i}`,`${codePrefix}PLAN${i}`,`${p[0]} · Mẫu 5 năm`,p[1],p[2],'Dữ liệu mô phỏng 10/2021–09/2026']));
  await batch('rooms','id,name,type,capacity,description',serviceIds.map((_,i)=>[`${prefix}-room${i}`,`Phòng ${['Gym','Yoga','Boxing'][i]} · Mẫu 5 năm`,['Gym','Yoga','Boxing'][i],30,'Phòng riêng cho dữ liệu mô phỏng']));
  const coaches:unknown[][]=[];
  for(let s=0;s<3;s++)for(let t=0;t<3;t++)coaches.push([`${prefix}-coach${s}-${t}`,`${codePrefix}T${s}${t}`,`${names[s*3+t]} · HLV mẫu 5 năm`,'09688'+String(replica*100+s*3+t).padStart(5,'0'),`${prefix}-coach${s}-${t}@example.test`,['Gym','Yoga','Boxing'][s],5+t,'08:00–18:00']);
  await batch('trainers','id,code,name,phone,email,specialty,experience,schedule',coaches);
  for(let s=0;s<3;s++)for(let t=0;t<3;t++){
   const tid=`${prefix}-coach${s}-${t}`;
   if(!await db.prepare('SELECT trainer_id FROM trainer_services WHERE trainer_id=? AND service_id=?').bind(tid,serviceIds[s]).first())await db.prepare('INSERT INTO trainer_services(trainer_id,service_id) VALUES(?,?)').bind(tid,serviceIds[s]).run();
  }
  const members:unknown[][]=[],regs:unknown[][]=[],payments:unknown[][]=[],schedules:unknown[][]=[],checkins:unknown[][]=[];
  let memberNo=0;
  for(let m=0;m<60;m++){
   const month=new Date(Date.UTC(2021,9+m,1)).toISOString().slice(0,7);
   for(let s=0;s<3;s++){
    // Gradual growth and seasonal differences; never random on reruns.
    const size=8+Math.floor(m/12)*2+(m+s)%4;
    for(let j=0;j<size;j++){
     const n=++memberNo,tag=`${m}-${s}-${j}`,mid=`${prefix}-member-${tag}`,rid=`${prefix}-reg-${tag}`,pid=`${prefix}-pay-${tag}`;
     const start=month+'-'+String(j+1).padStart(2,'0');
     const pick=(j+m+s)%10,p=pick<5?0:pick<8?1:pick===8?2:3;
     const end=addDays(start,planData[p][1]-1),planId=`${prefix}-plan${p}`,planName=`${planData[p][0]} · Mẫu 5 năm`;
     // 00:00 UTC = 07:00 Vietnam; schedules are after payment time.
     const created=start+' 00:00:00';
     members.push([mid,`${codePrefix}M${n}`,`${names[n%names.length]} ${String(n).padStart(4,'0')} · Mẫu`,'097'+String(replica*10000+n).padStart(7,'0'),`${mid}@example.test`,n%2?'Nữ':'Nam',created,`${prefix}-coach${s}-${j%3}`]);
     regs.push([rid,`${codePrefix}R${n}`,mid,planId,planName,planData[p][2],start,end,'ACTIVE',created,planData[p][2],0,'']);
     payments.push([pid,`${codePrefix}P${n}`,mid,planId,planName,planData[p][2],(m+j+s)%4?'Chuyển khoản':'Tiền mặt',start,end,created,pid,start,rid]);
     for(let k=0;k<4;k++){
      const date=addDays(start,k),hour=8+k*2,slot=`${prefix}-slot-${tag}-${k}`,cancelled=(m+s+j+k)%17===0;
      schedules.push([slot,`${codePrefix}L${n}K${k}`,mid,`${prefix}-coach${s}-${k%3}`,`${prefix}-room${s}`,serviceIds[s],date,String(hour).padStart(2,'0')+':00',String(hour+1).padStart(2,'0')+':00',cancelled?'CANCELLED':'ACTIVE','Dữ liệu mẫu 5 năm, không phải giao dịch thực',created]);
      if(!cancelled)checkins.push([`${prefix}-check-${tag}-${k}`,mid,date,`${date} ${String(hour-7).padStart(2,'0')}:00:00`,`${date} ${String(hour-6).padStart(2,'0')}:00:00`]);
     }
    }
   }
  }
  await batch('members','id,code,name,phone,email,gender,created_at,trainer_id',members);
  await batch('registrations','id,code,member_id,plan_id,plan_name,price,start_date,end_date,status,created_at,original_price,discount_percent,promotion_name',regs);
  await batch('payments','id,code,member_id,plan_id,plan_name,amount,method,start_date,end_date,created_at,request_id,requested_start,registration_id',payments);
  await batch('schedules','id,code,member_id,trainer_id,room_id,service_id,date,start_time,end_time,status,note,created_at',schedules);
  await batch('checkins','id,member_id,date,created_at,checkout_at',checkins);
  const totals=await db.prepare('SELECT COUNT(*) AS receipts,COUNT(DISTINCT DATE_FORMAT(created_at,\'%Y-%m\')) AS months,MIN(created_at) AS first_date,MAX(created_at) AS last_date,SUM(amount) AS revenue FROM payments WHERE id LIKE ?').bind(prefix+'-pay-%').first<{receipts:number;months:number;revenue:number}>();
  if(totals?.months!==60||totals.receipts!==memberNo)throw new Error('Dữ liệu không đủ 60 tháng; hủy toàn bộ lượt thêm.');
  const conflicts=await db.prepare("SELECT COUNT(*) AS n FROM schedules a JOIN schedules b ON a.id<b.id AND a.date=b.date AND a.start_time<b.end_time AND a.end_time>b.start_time AND (a.trainer_id=b.trainer_id OR a.room_id=b.room_id OR a.member_id=b.member_id) WHERE a.id LIKE ? AND b.id LIKE ? AND a.status='ACTIVE' AND b.status='ACTIVE'").bind(prefix+'-%',prefix+'-%').first<{n:number}>();
  if(conflicts?.n)throw new Error('Lịch mẫu trùng nhau; hủy lượt thêm.');
  console.log(JSON.stringify({added:counts,totals,scheduleConflicts:conflicts?.n}));
 },true);
 console.log('Committed historical demo dataset.');
}finally{await pool.end();}

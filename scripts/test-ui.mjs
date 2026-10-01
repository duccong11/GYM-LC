import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const base='http://127.0.0.1:4100',out='outputs/java-migration';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});const results=[];
try{
 for(const [username,password,sections] of [
  ['admin','GymAdmin2026!',['Tài khoản và phân quyền','Hệ thống']],
  ['manager','GymManager2026!',['Tổng quan','Hội viên','Gói tập','Thanh toán','Lịch tập','Báo cáo','Dịch vụ','Khuyến mãi']],
  ['staff1','GymStaff2026!',['Hội viên','Thanh toán','Lịch tập']],
  ['coach1','GymCoach2026!',['Lịch tập']],
  ['member1','GymMember2026!',['Hội viên','Đăng ký gói','Lịch tập']],
 ]){
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/login');await page.getByLabel('Tên đăng nhập',{exact:true}).fill(username);await page.getByLabel('Mật khẩu',{exact:true}).fill(password);await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
  await page.waitForURL(base+'/');await page.getByRole('button',{name:'Đăng xuất',exact:true}).waitFor();
  for(const label of sections){await page.getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(200);assert.equal(await page.getByText('Chưa kết nối được hệ thống',{exact:true}).count(),0);results.push({actor:username,screen:label});}
  await page.screenshot({path:`${out}/${username}.png`,fullPage:true});assert.deepEqual(errors,[],username+' console errors');await context.close();
 }
 writeFileSync(`${out}/ui-results.json`,JSON.stringify(results,null,2));console.log(`PASS ${results.length} UI screens across 5 actors`);
}finally{await browser.close();}

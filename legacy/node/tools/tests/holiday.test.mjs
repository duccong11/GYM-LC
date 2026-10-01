import test from 'node:test';
import assert from 'node:assert/strict';
import { discountedPrice } from '../../backend/src/services/promotion.service.ts';
import { canMutate } from '../../backend/src/utils/security.ts';
test('Discount boundaries and rounding in VND',()=>{
 assert.equal(discountedPrice(300000,20),240000);
 assert.equal(discountedPrice(300000,100),0);
 assert.equal(discountedPrice(0,30),0);
 assert.equal(discountedPrice(100001,15),85001);
 for(const n of [-1,101,1.5,NaN]) assert.throws(()=>discountedPrice(100,n));
});
test('Only manager manages promotions',()=>{
 for(const role of ['ADMIN','STAFF','TRAINER','MEMBER']) assert.equal(canMutate(role,'promotion.save'),false);
 assert.equal(canMutate('MANAGER','promotion.save'),true);
});

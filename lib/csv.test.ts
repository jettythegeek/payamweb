import { describe, expect, it } from 'vitest';
import { csvCell } from './csv';
describe('CSV safety',()=>{
  it('neutralises formulas',()=>expect(csvCell('=SUM(A1:A2)')).toBe('"\'=SUM(A1:A2)"'));
  it('quotes phone numbers without altering them',()=>expect(csvCell('+2348031234567',{phone:true})).toBe('"+2348031234567"'));
  it('escapes quotes',()=>expect(csvCell('a"b')).toBe('"a""b"'));
});

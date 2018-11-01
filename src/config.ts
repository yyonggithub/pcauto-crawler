import * as path from 'path';
import { IRange, ICar } from './interface';

export const rootPath = path.join(__dirname, '../');

export const pricePath = path.join(rootPath, 'price');

export const pcautoPath = path.join(rootPath, 'pcauto');

export const filesPath = path.join(rootPath, 'files');

export const fields = [
  'brand',
  'logo',
  'mappedBrand',
  'subBrand',
  'name',
  'chName',
  'otherName',
  'carType',
  'carTypeFilter',
  // 'num',
  'status',
  'statusFilter',
  // 'lowPrice',
  // 'heightPrice',
  'intLowPrice',
  'ceilingHighPrice',
  '5万以下',
  '5-7万',
  '7-10万',
  '10-13万',
  '13-15万',
  '15-18万',
  '18-20万',
  '20-25万',
  '25-30万',
  '30-40万',
  '40-60万',
  '60-80万',
  '80万以上',]

// [5-7万	7-10万	10-13万	13-15万	15-18万	18-20万	20-25万	25-30万	30-40万	40-60万	60-80万	80万以上]
// 价格区间
export const priceRange: IRange[] = [
  { low: 0, height: 5, range: '5万以下', index: 0 },
  { low: 5, height: 7, range: '5-7万', index: 1 },
  { low: 7, height: 10, range: '7-10万', index: 2 },
  { low: 10, height: 13, range: '10-13万', index: 3 },
  { low: 13, height: 15, range: '13-15万', index: 4 },
  { low: 15, height: 18, range: '15-18万', index: 5 },
  { low: 18, height: 20, range: '18-20万', index: 6 },
  { low: 20, height: 25, range: '20-25万', index: 7 },
  { low: 25, height: 30, range: '25-30万', index: 8 },
  { low: 30, height: 40, range: '30-40万', index: 9 },
  { low: 40, height: 60, range: '40-60万', index: 10 },
  { low: 60, height: 80, range: '60-80万', index: 11 },
  { low: 80, height: 999999, range: '80万以上', index: 12 },
];
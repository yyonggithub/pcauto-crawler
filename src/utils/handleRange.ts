import { IRange } from '../pcauto/interface';
import { ChangeRange } from '../pcauto/enum';

/**
 * 参数按万元为单位进行处理，返回价格所在区间
 *
 * @export
 * @param {number} lowPrice 最低价位-单位万
 * @param {number} heightPrice 最高价位单位万
 * @param {IRange[]} priceRange
 * @param {ChangeRange} rule
 * @returns
 */
export function handleRange(lowPrice: number, heightPrice: number, priceRange: IRange[], rule: ChangeRange) {
  let l: number, h: Number;
  // 最低价格区间
  const low = priceRange.filter(item => {
    return lowPrice >= item.low && lowPrice <= item.height;
  });
  const lIndex = low.map(item => {
    return item.index;
  });
  l = Math.min(...lIndex);
  if (rule === ChangeRange.down) {
    l = l == 0 ? 0 : l - 1;
  }
  if (rule === ChangeRange.up) {
    l = l + 1;
  }
  // 最高价格区间
  const height = priceRange.filter(item => {
    return heightPrice >= item.low && heightPrice <= item.height;
  });
  const hIndex = height.map(item => {
    return item.index;
  });
  h = Math.max(...hIndex);
  if (rule === ChangeRange.down) {
    h = +h - 1;
  }
  if (rule === ChangeRange.up) {
    h = h === priceRange.length - 1 ? h : +h + 1;
  }
  const range = priceRange.filter((item, index) => {
    return index >= l && index <= h;
  });
  let fields: any = {};
  range.forEach(item => {
    fields[item.range] = 1;
  });
  return fields;
}
/**
 * 参数按元为单位进行处理，返回价格所在区间
 *
 * @export
 * @param {number} lowPrice 最低价位-单位元
 * @param {number} heightPrice 最高价位-单位元
 * @param {IRange[]} priceRange
 * @param {ChangeRange} rule
 * @returns
 */
export function handleRange2(lowPrice: number, heightPrice: number, priceRange: IRange[], rule: ChangeRange) {
  lowPrice = lowPrice / 10000;
  heightPrice = heightPrice / 10000;
  let l: number, h: Number;
  // 最低价格区间
  const low = priceRange.filter(item => {
    return lowPrice >= item.low && lowPrice <= item.height;
  });
  const lIndex = low.map(item => {
    return item.index;
  });
  l = Math.min(...lIndex);
  if (rule === ChangeRange.down) {
    l = l == 0 ? 0 : l - 1;
  }
  if (rule === ChangeRange.up) {
    l = l + 1;
  }
  // 最高价格区间
  const height = priceRange.filter(item => {
    return heightPrice >= item.low && heightPrice <= item.height;
  });
  const hIndex = height.map(item => {
    return item.index;
  });
  h = Math.max(...hIndex);
  if (rule === ChangeRange.down) {
    h = +h - 1;
  }
  if (rule === ChangeRange.up) {
    h = h === priceRange.length - 1 ? h : +h + 1;
  }
  const range = priceRange.filter((item, index) => {
    return index >= l && index <= h;
  });
  let fields: any = {};
  range.forEach(item => {
    fields[item.range] = 1;
  });
  return fields;
}
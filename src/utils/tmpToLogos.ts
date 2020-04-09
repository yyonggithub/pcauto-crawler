import * as path from 'path';
import * as fs from 'fs';
import * as json2csv from 'json2csv';

import { readXlsx } from "./readXlsx";
import { rootPath } from '../pcauto/config'
import { IMappedBrand, ITmp } from '../pcauto/interface';
import { strAddBom } from './strAddBom';

const brandFile = path.join(rootPath, 'src', 'assets', 'MappedBrand.xlsx');
const brandJson = readXlsx(brandFile) as any[];

const tmpFile = path.join(rootPath, 'src', 'assets', 'tmp.xlsx');
const tmpJson = readXlsx(tmpFile) as ITmp[];

const list = tmpJson.map(item => {
  const name = item.name.trim().split('_')[0]
  return {
    brand: name,
    logo: item.logo
  }
})

// const arr:any[] = [];
// const set = new Set()

brandJson.forEach((item,index) => {
  const res = list.find(l => {
    return item.brand === l.brand
  })
  if (res) {
    // set.add(res);
    item.logo = res.logo;
  }
})

const arr = brandJson;

// const arr = Array.from(set);

const json2csvParser = new json2csv.Parser();

const csv = json2csvParser.parse(arr);

const buff = strAddBom(csv);

fs.writeFileSync(path.join(rootPath, 'src', 'assets', 'logos.csv'), buff, {
  encoding: 'utf8'
})





import { getHttp } from "../utils/getHttp";
import * as fs from 'fs';
import * as path from 'path';
import { filesPath } from "./config";
import { getHtml } from "../utils/getHtml";
import * as cheerio from 'cheerio';
import { ICar } from "./interface";

export async function getPriceByCar2(list: ICar[]) {
  for (let i = 0; i < list.length; i++) {
    const car = list[i];
    const url = `https://price.pcauto.com.cn${car.href}`
    const text = await getHttp(url);
    const brandPath = path.join(filesPath, car.brand);
    if (!fs.existsSync(brandPath)) {
      fs.mkdirSync(brandPath)
    }
    fs.writeFileSync(path.join(brandPath, `${car.name}.html`), text, { encoding: 'utf8' });
    const result = analyzeHtml(text);
  }
}

function analyzeHtml(html: string) {
  const $ = cheerio.load(html);
  const contentdivOnsaleE = $('div#contentdivOnsale');
  const aEList = contentdivOnsaleE.find('div.con>a');
  if (aEList && aEList.length > 0) {
    const list = aEList.map((index, element) => {
      return element.data
    })
    console.log(list);

  }
}

// export async function getPriceByCar(list) {

//   let low = NaN, hight = NaN
//   if (!hasPrice) {
//     return {
//       low,
//       hight
//     }
//   }
//   let text = '';
//   text = await getHttp(url);
//   console.log(name, url);
//   // console.log(text)
//   const brandPath = path.join(filesPath, brand);
//   if (!fs.existsSync(brandPath)) {
//     fs.mkdirSync(brandPath);
//   }
//   fs.writeFileSync(path.join(brandPath, `${name}.html`), text, { encoding: 'utf8' });

//   const result = asyncHtml(text);
//   // return { low: result: low, hight: result.low }
//   return { low, hight }
// }

function asyncHtml(html: string) {
  const $ = cheerio.load(html);
  const contentdivOnsaleE = $('div#contentdivOnsale');
  const aEList = contentdivOnsaleE.find('div.con>a')
  if (aEList && aEList.length > 0) {
    const list = aEList.map((index, element) => {
      return element.data
    })
    console.log(list)
  } else {
    console.log('error')
  }

  // return {}
}
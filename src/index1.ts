// 获取车辆状态（停售）


import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import * as json2csv from 'json2csv';

import { getHttp } from './utils/getHttp';
import { rootPath, filesPath, fieldsOfFive } from './config';
import { strAddBom } from './utils/strAddBom';

interface ICar {
  // 名称
  name: string;
  // 状态
  state: string;
  // 品牌
  brand: string | null;
  // 车型
  type: string;
}

// 所有车辆请求地址
const allCarUrl = 'https://price.pcauto.com.cn/cars/';
const allCarName = 'allcar';

getAllCar(allCarUrl, allCarName).then(text => {
  const cars = analyzeHtml(text);
  const fields = ['brand', 'type', 'name', 'state']
  const json2csvParser = new json2csv.Parser({ fields, excelStrings: true })
  const csv = json2csvParser.parse(cars);
  fs.writeFileSync(path.join(filesPath, `${allCarName}-cars.csv`), strAddBom(csv), { encoding: 'utf8' });
  console.log('finish')
})


async function getAllCar(url: string, fileName: string) {
  const text = await getHttp(url);
  fs.writeFileSync(path.join(filesPath, `${fileName}-all.html`), text, { encoding: 'utf8' });

  return text;
}

function analyzeHtml(html: string) {
  const cars: ICar[] = []
  // const car: ICar = {};
  let brand: string;

  const $ = cheerio.load(html);
  const $Brands = $('div.braRow');
  $Brands.each((index, element) => {
    const $braRow = $(element);
    const $braRow_icon = $braRow.find('.braRow-icon');
    if ($braRow_icon && $braRow_icon.length > 0) {
      const $brand = $braRow_icon.find('p')
      if ($brand && $brand.length > 0) {
        brand = $brand[0].firstChild.data || '';
      }
    }

    const $modA = $(element).find('div.modA');
    if ($modA && $modA.length > 0) {
      $modA.each((index, ele) => {
        let subBrand: string;

        const $subBrand = $(ele).find('div.thA>a');
        if ($subBrand && $subBrand.length > 0) {
          subBrand = $subBrand[0].firstChild.data || '';
          subBrand = subBrand.replace('(', '（').replace(')', '）');
        }

        const $otherEle = $(ele).find('div.tbA');
        if ($otherEle && $otherEle.length > 0) {
          $otherEle.each((i, el) => {
            let type: string;

            const $type = $(el).find('p.stit');
            type = $type[0].firstChild.data || '';

            const $li = $(el).find('li');
            if ($li && $li.length > 0) {
              $li.each((ind, li) => {
                let name: string, state: string = '';

                const $name = $(li).find('p.tit>a');
                name = $name[0].firstChild.data || '';

                const $em = $(li).find('p.tit>em');
                if ($em && $em.length > 0) {
                  state = $em[0].firstChild.data || '';
                }

                const car: ICar = {
                  name: name,
                  state: state,
                  type: type,
                  brand: brand,
                }
                cars.push(car);
              })
            }
          })
        }
      })
    }
  })

  return cars
}
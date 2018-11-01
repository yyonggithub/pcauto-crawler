import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import * as json2csv from 'json2csv';

import { getHttp } from './utils/getHttp';
import { rootPath, filesPath, fields } from './config';
import { ICar, INotNeed } from './interface';
import { Range, ChangeRange } from './enum';
import { readXlsx } from './utils/readXlsx';
import { handleNeeded } from './utils/handleNeeded';
import { handleRange } from './utils/handleRange';
import { priceRange } from './config';
import { strAddBom } from './utils/strAddBom';
import { mappedBrandFilter, marketStatusFilter, carTypeFilter, shieldFilter, logoFilter } from './utils/filter'


// 所有车辆请求地址
const allCarUrl = 'https://price.pcauto.com.cn/cars/';
const allCarName = 'allcar';
// 电动车请求地址
const electrocarUrl = 'https://price.pcauto.com.cn/cars/7/';
const electrocarName = 'electrocar';

// const notNeedFile = path.join(__dirname, 'assets', 'notneed.xlsx');
// const notNeedJson = readXlsx(notNeedFile)

getAllCar(allCarUrl, allCarName);
getAllCar(electrocarUrl, electrocarName);


function getAllCar(url: string, fileName: string) {
  getHttp(url).then(text => {
    fs.writeFileSync(path.join(filesPath, `${fileName}.html`), text, { encoding: 'utf8' });

    let { downList, normalList, upList } = asyncCarsHtml(text);

    downList = shieldFilter(downList);
    normalList = shieldFilter(normalList);
    upList = shieldFilter(upList);

    fs.writeFileSync(path.join(filesPath, `${fileName}-down.json`), JSON.stringify(downList), { encoding: 'utf8' });
    fs.writeFileSync(path.join(filesPath, `${fileName}-normal.json`), JSON.stringify(normalList), { encoding: 'utf8' });
    fs.writeFileSync(path.join(filesPath, `${fileName}-up.json`), JSON.stringify(upList), { encoding: 'utf8' });

    const json2csvParser = new json2csv.Parser({ fields });
    const downCsv = json2csvParser.parse(downList);
    const normalCsv = json2csvParser.parse(normalList);
    const upCsv = json2csvParser.parse(upList);
    fs.writeFileSync(path.join(filesPath, `${fileName}-down.csv`), strAddBom(downCsv), { encoding: 'utf8' });
    fs.writeFileSync(path.join(filesPath, `${fileName}-normal.csv`), strAddBom(normalCsv), { encoding: 'utf8' });
    fs.writeFileSync(path.join(filesPath, `${fileName}-up.csv`), strAddBom(upCsv), { encoding: 'utf8' });

    console.log('finish');
  });
}


/**
 * 分析车辆页面
 *
 * @param {string} html 页面字符串
 * @param {INotNeed[]} notNeed 不需要的车辆品牌
 * @returns
 */
function asyncCarsHtml(html: string) {
  const list: ICar[] = []
  const downList: ICar[] = [];
  const normalList: ICar[] = [];
  const upList: ICar[] = [];

  const $ = cheerio.load(html);

  const brandsEle = $('div.braRow');
  brandsEle.each((index, element) => {
    let iconTag: string;
    let brand: string;
    let needed: string;
    let mappedBrand: string;
    let statusFilter: string;
    let typeFilter: string;
    let logo: any;
    // let name: string;
    // let href: string;
    // let type: string;
    // let redMsk: string;
    // let lowPrice: string;
    // let heightPrice: string;

    const cheerioEle = $(element);
    const iconTagEle = cheerioEle.find('div.braRow-iconTag');
    if (iconTagEle && iconTagEle.length > 0) {
      iconTag = iconTagEle[0].firstChild.data || '';
    }

    // 品牌
    const brandEle = cheerioEle.find('a.aPic p')
    if (brandEle && brandEle.length > 0) {
      brand = brandEle[0].firstChild.data || '';
      // needed = handleNeeded(brand, notNeedJson);
      mappedBrand = mappedBrandFilter(brand)
    }

    const modA = cheerioEle.find('div.modA')

    if (modA.length > 0) {
      modA.each((idx, ele) => {
        // 子品牌
        let subBrand: string;
        const thAEle = $(ele).find('div.thA>a');
        if (thAEle && thAEle.length > 0) {
          subBrand = thAEle[0].firstChild.data || '';
          subBrand = subBrand.replace('(', '（').replace(')', '）');
        }

        const tbAEle = $(ele).find('div.tbA');
        if (tbAEle && tbAEle.length > 0) {
          tbAEle.each((i, el) => {
            let type: string;
            // status,lowPrice,heightPrice;
            const typeEle = $(el).find('p.stit');
            type = typeEle[0].firstChild.data || '';

            const reg = /(（\S+）)/g
            const tmpNum = reg.exec(type)
            const num = tmpNum ? tmpNum[0] : '';

            type = type.replace(num, '');
            typeFilter = carTypeFilter(type);

            const carsEle = $(el).find('li');

            if (carsEle && carsEle.length > 0) {
              carsEle.each((n, e) => {
                let name: string, chName: string, status: string = '在售', lowPrice: string = "", heightPrice: string = "", otherName: string;

                const carE = $(e).find('p.tit>a')
                name = carE[0].attribs.title || '';
                name = name.trim().replace('(', '（').replace(')', '）')
                chName = name.replace(/·/g, '')
                chName = chName.replace(/\s/g, '_');

                logo = logoFilter(chName);

                const reg = new RegExp(brand, 'g');
                const regExpExecArray = reg.exec(chName)
                if (brand === chName) {
                  otherName = chName;
                } else if (regExpExecArray) {
                  otherName = chName.replace(regExpExecArray[0], '').replace(/^\_/g, '');
                } else {
                  otherName = chName;
                }

                otherName = otherName.replace(/^-/g, '');

                const redMskE = $(e).find('p.tit em')
                if (redMskE && redMskE.length > 0) {
                  status = redMskE[0].firstChild.data || '在售';
                }

                statusFilter = marketStatusFilter(status);

                const priceE = $(e).find('p.price span')
                if (priceE && priceE.length > 0) {
                  const price = priceE[0].firstChild.data || '';

                  try {
                    const tmp: string[] = price.trim().split(/\-/g);
                    lowPrice = tmp[0].replace(/万/g, '');
                    heightPrice = tmp[1].replace(/万/g, '');
                  } catch (error) {
                    lowPrice = price.replace('万', '');
                    heightPrice = price.replace('万', '');
                  }
                }

                let intLowPrice: number = 0, ceilingHighPrice: number = 0;
                try {
                  intLowPrice = Math.floor(+lowPrice);
                  ceilingHighPrice = Math.floor(+heightPrice) + 1;
                } catch (err) {
                  intLowPrice = 0;
                  ceilingHighPrice = 0;
                }

                const downFields = handleRange(intLowPrice, ceilingHighPrice, priceRange, ChangeRange.down)
                const normalFields = handleRange(intLowPrice, ceilingHighPrice, priceRange, ChangeRange.normal)
                const upFields = handleRange(intLowPrice, ceilingHighPrice, priceRange, ChangeRange.up)

                const car: ICar = {
                  brand,
                  mappedBrand,
                  subBrand,
                  name,
                  chName,
                  logo,
                  otherName,
                  carType: type,
                  carTypeFilter: typeFilter,
                  status,
                  statusFilter,
                  lowPrice,
                  heightPrice,
                  intLowPrice,
                  ceilingHighPrice,
                }

                downList.push({
                  ...car,
                  ...downFields,
                })
                normalList.push({
                  ...car,
                  ...normalFields,
                })
                upList.push({
                  ...car,
                  ...upFields,
                });
              })
            }
          })
        }
      })
    }
  })
  return {
    downList,
    normalList,
    upList,
  };
}



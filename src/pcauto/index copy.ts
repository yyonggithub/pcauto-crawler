import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import * as json2csv from 'json2csv';

import { getHttp } from '../utils/getHttp';
import { rootPath, filesPath, fields, fieldsOfFive } from './config';
import { ICar, INotNeed } from './interface';
import { Range, ChangeRange } from './enum';
import { readXlsx } from '../utils/readXlsx';
import { handleNeeded } from '../utils/handleNeeded';
import { handleRange } from '../utils/handleRange';
import { priceRange } from './config';
import { strAddBom } from '../utils/strAddBom';
import {
  mappedBrandFilter,
  marketStatusFilter,
  carTypeFilter,
  shieldFilter,
  getLogo,
  getBodyTypeFromPrice,
  getBodyType,
  getCarPage,
  getImported,
  getOtherName2,
  getEnName,
} from '../utils/filter'
import { analyzeCarInfoPageAndGetBodyTypeChinese } from '../utils/getCarInfoPage';
import { Way } from './enum';
import { getPriceByCar } from './getPriceByCar'
import { wait } from '../utils/wait';

// 价格获取类型
let way = Way.price;
// 是否存在报价
let hasPrice = true;

// 所有车辆请求地址
const allCarUrl = 'https://price.pcauto.com.cn/cars/';
const allCarName = 'allcar';
// 电动车请求地址
const electrocarUrl = 'https://price.pcauto.com.cn/cars/7/';
const electrocarName = 'electrocar';

// const notNeedFile = path.join(__dirname, 'assets', 'notneed.xlsx');
// const notNeedJson = readXlsx(notNeedFile)

getAllCar(allCarUrl, allCarName).then(res => {
  console.log('success')
})
// getAllCar(electrocarUrl, electrocarName);


async function getAllCar(url: string, fileName: string) {
  const text = await getHttp(url);
  // const text = fs.readFileSync(path.join(filesPath,'allcar.html'),{encoding:'utf8'})

  fs.writeFileSync(path.join(filesPath, `${fileName}.html`), text, { encoding: 'utf8' });

  let { downList, normalList, upList } = await analyzeCarsHtml(text);

  console.log(normalList);

  // downList = shieldFilter(downList);
  // normalList = shieldFilter(normalList);
  // upList = shieldFilter(upList);

  fs.writeFileSync(path.join(filesPath, `${fileName}-down.json`), JSON.stringify(downList), { encoding: 'utf8' });
  fs.writeFileSync(path.join(filesPath, `${fileName}-normal.json`), JSON.stringify(normalList), { encoding: 'utf8' });
  fs.writeFileSync(path.join(filesPath, `${fileName}-up.json`), JSON.stringify(upList), { encoding: 'utf8' });

  const json2csvParser = new json2csv.Parser({ fields, excelStrings: true });
  // const json2csvParser = new json2csv.Parser({ fields:fieldsOfFive,excelStrings:true });
  const downCsv = json2csvParser.parse(downList);
  const normalCsv = json2csvParser.parse(normalList);
  const upCsv = json2csvParser.parse(upList);
  fs.writeFileSync(path.join(filesPath, `${fileName}-down.csv`), strAddBom(downCsv), { encoding: 'utf8' });
  fs.writeFileSync(path.join(filesPath, `${fileName}-normal.csv`), strAddBom(normalCsv), { encoding: 'utf8' });
  fs.writeFileSync(path.join(filesPath, `${fileName}-up.csv`), strAddBom(upCsv), { encoding: 'utf8' });

  console.log('finish');

  // getHttp(url).then(text => {
  // });
}


/**
 * 分析车辆页面
 *
 * @param {string} html 页面字符串
 * @param {INotNeed[]} notNeed 不需要的车辆品牌
 * @returns
 */
async function analyzeCarsHtml(html: string) {
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
              carsEle.each(async (n, e) => {
                let name: string, chName: string, status: string = '在售', lowPrice: string = "", heightPrice: string = "", otherName: string;
                let href: string = '';
                let priceHref: string = '';
                let otherName2: string;
                let enName: string;

                const carE = $(e).find('p.tit>a')
                name = carE[0].attribs.title || '';
                name = name.trim().replace('(', '（').replace(')', '）')
                chName = name.replace(/·/g, '')
                chName = chName.replace(/\s/g, '_');

                logo = getLogo(brand);

                // const reg = new RegExp(brand, 'g');
                const reg = new RegExp(mappedBrand, 'g');
                const regExpExecArray = reg.exec(chName)
                // if (brand === chName) {
                if (mappedBrand === chName) {
                  otherName = chName;
                } else if (regExpExecArray) {
                  otherName = chName.replace(regExpExecArray[0], '').replace(/^\_/g, '');
                } else {
                  otherName = chName;
                }

                otherName = otherName.replace(/^-/g, '');

                const imported = getImported(otherName);

                otherName = otherName.replace(/（进口）/g, '');
                otherName2 = getOtherName2(otherName);

                enName = getEnName(mappedBrand, otherName);

                const aEle = $(e).find('p.tit a')
                if (aEle && aEle.length > 0) {
                  href = aEle[0].attribs.href || ''
                  priceHref = `/price${href}`
                }

                const redMskE = $(e).find('p.tit em')
                if (redMskE && redMskE.length > 0) {
                  status = redMskE[0].firstChild.data || '在售';
                }

                statusFilter = marketStatusFilter(status);

                let priceE;
                priceE = $(e).find('p.price span')
                let intLowPrice: number = NaN, ceilingHighPrice: number = NaN;

                if (way === Way.default) {
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
                  if (lowPrice !== '' && heightPrice !== '') {
                    try {
                      intLowPrice = Math.floor(+lowPrice);
                      ceilingHighPrice = Math.floor(+heightPrice) + 1;
                    } catch (err) {
                      intLowPrice = NaN;
                      ceilingHighPrice = NaN;
                    }
                  }
                } else if (way === Way.price) {
                  if (priceE && priceE.length > 0) {
                    const price = priceE[0].firstChild.data || '';
                    hasPrice = !(/暂无报价|未量产发售|未量产发售/.test(price))
                    // 有报价则进一步获取价格
                    // if (hasPrice) {
                    const url = `https://price.pcauto.com.cn${href}`;
                    // await wait(5000, name)
                    // let { low, hight } = await getPriceByCar(url, brand, name)

                    // getPriceByCar(url, brand, name).then(res => {
                    //   // console.log(res);
                    // })
                    // console.log(url)
                    getPriceByCar(url, brand, name, hasPrice).then(res => {
                      intLowPrice = res.low;
                      ceilingHighPrice = res.hight

                      doSomeThing(name, intLowPrice, ceilingHighPrice, brand, mappedBrand, subBrand, href, priceHref, chName, enName, otherName, otherName2, imported, logo, type, typeFilter, status, statusFilter, lowPrice, heightPrice, downList, normalList, upList);

                    }).catch(error => {
                      intLowPrice = NaN;
                      ceilingHighPrice = NaN;
                      doSomeThing(name, intLowPrice, ceilingHighPrice, brand, mappedBrand, subBrand, href, priceHref, chName, enName, otherName, otherName2, imported, logo, type, typeFilter, status, statusFilter, lowPrice, heightPrice, downList, normalList, upList);

                    })


                    // } else {

                    // }
                  }
                }

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
  }
  // return Promise.resolve({
  //   downList,
  //   normalList,
  //   upList,
  // });
}


function doSomeThing(name: string, intLowPrice: number, ceilingHighPrice: number, brand: string, mappedBrand: string, subBrand: string, href: string, priceHref: string, chName: string, enName: string, otherName: string, otherName2: string, imported: string, logo: any, type: string, typeFilter: string, status: string, statusFilter: string, lowPrice: string, heightPrice: string, downList: ICar[], normalList: ICar[], upList: ICar[]) {
  let bodyTypeChinese = getBodyTypeFromPrice(name);
  bodyTypeChinese = analyzeCarInfoPageAndGetBodyTypeChinese(name, bodyTypeChinese);
  const bodyType = getBodyType(bodyTypeChinese);
  const downFields = handleRange(intLowPrice, ceilingHighPrice, priceRange, ChangeRange.down);
  const normalFields = handleRange(intLowPrice, ceilingHighPrice, priceRange, ChangeRange.normal);
  const upFields = handleRange(intLowPrice, ceilingHighPrice, priceRange, ChangeRange.up);
  // const b = await getCarPage(href);
  const car: ICar = {
    // num,
    brand,
    mappedBrand,
    subBrand,
    href,
    priceHref,
    name,
    chName,
    enName,
    otherName,
    otherName2,
    imported,
    logo,
    carType: type,
    bodyTypeChinese,
    bodyType,
    carTypeFilter: typeFilter,
    status,
    statusFilter,
    lowPrice,
    heightPrice,
    intLowPrice,
    ceilingHighPrice,
  };
  downList.push({
    ...car,
    ...downFields,
  });
  normalList.push({
    ...car,
    ...normalFields,
  });
  upList.push({
    ...car,
    ...upFields,
  });
}


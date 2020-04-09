import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import * as json2csv from 'json2csv';
import { strAddBom } from '../utils/strAddBom';

import { getHttp } from '../utils/getHttp';
import { rootPath, filesPath, fields, fieldsOfFive } from './config';
import { ICar } from './interface';
import { mappedBrandFilter, getBodyTypeFromPrice, getBodyType, marketStatusFilter, getEnName, getOtherName2, getImported, getLogo, carTypeFilter } from '../utils/filter';
import { analyzeCarInfoPageAndGetBodyTypeChinese } from '../utils/getCarInfoPage';
import { getPriceByCar2 } from './getPriceByCar';

const fileName = 'allcar';

getAllCar().then(res => {
  console.log('success');
})

async function getAllCar() {
  const text = fs.readFileSync(path.join(filesPath, 'allcar.html'), { encoding: 'utf8' })

  let { list } = await analyzeCarsHtml(text);

  fs.writeFileSync(path.join(filesPath, `${fileName}-list.json`), JSON.stringify(list), { encoding: 'utf8' });

  await getPriceByCar2(list);
  // fs.writeFileSync(path.join(filesPath, `${fileName}-down.json`), JSON.stringify(downList), { encoding: 'utf8' });
  // fs.writeFileSync(path.join(filesPath, `${fileName}-normal.json`), JSON.stringify(normalList), { encoding: 'utf8' });
  // fs.writeFileSync(path.join(filesPath, `${fileName}-up.json`), JSON.stringify(upList), { encoding: 'utf8' });

  // const json2csvParser = new json2csv.Parser({ fields, excelStrings: true });
  // // const json2csvParser = new json2csv.Parser({ fields:fieldsOfFive,excelStrings:true });
  // const downCsv = json2csvParser.parse(downList);
  // const normalCsv = json2csvParser.parse(normalList);
  // const upCsv = json2csvParser.parse(upList);
  // fs.writeFileSync(path.join(filesPath, `${fileName}-down.csv`), strAddBom(downCsv), { encoding: 'utf8' });
  // fs.writeFileSync(path.join(filesPath, `${fileName}-normal.csv`), strAddBom(normalCsv), { encoding: 'utf8' });
  // fs.writeFileSync(path.join(filesPath, `${fileName}-up.csv`), strAddBom(upCsv), { encoding: 'utf8' });

  console.log('finish');
}

async function analyzeCarsHtml(html: string) {
  const list: ICar[] = [];
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
                }

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

                let hasPrice = true;
                let intLowPrice: number = NaN, ceilingHighPrice: number = NaN;
                if (lowPrice !== '' && heightPrice !== '') {
                  try {
                    intLowPrice = Math.floor(+lowPrice);
                    ceilingHighPrice = Math.floor(+heightPrice) + 1;
                  } catch (err) {
                    intLowPrice = NaN;
                    ceilingHighPrice = NaN;
                  }
                }

                if (intLowPrice == NaN && ceilingHighPrice == NaN) {
                  hasPrice = false;
                }

                let bodyTypeChinese = getBodyTypeFromPrice(name);
                bodyTypeChinese = analyzeCarInfoPageAndGetBodyTypeChinese(name, bodyTypeChinese);
                const bodyType = getBodyType(bodyTypeChinese)

                // const downFields = handleRange(intLowPrice, ceilingHighPrice, priceRange, ChangeRange.down)
                // const normalFields = handleRange(intLowPrice, ceilingHighPrice, priceRange, ChangeRange.normal)
                // const upFields = handleRange(intLowPrice, ceilingHighPrice, priceRange, ChangeRange.up)

                // const b = await getCarPage(href);


                const car: ICar = {
                  // num,
                  brand,
                  mappedBrand,
                  subBrand,
                  href,
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
                  hasPrice
                }

                list.push(car)

                // downList.push({
                //   ...car,
                //   ...downFields,
                // })
                // normalList.push({
                //   ...car,
                //   ...normalFields,
                // })
                // upList.push({
                //   ...car,
                //   ...upFields,
                // });
              })
            }
          })
        }
      })
    }
  })

  return { list };
}
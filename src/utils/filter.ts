import * as path from 'path';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

import { readXlsx } from './readXlsx';
import { rootPath, pcautoUrl } from '../config'
import { ICarTypeFilter, IMarketStatusFilter, IMappedBrand, ICar, ILogo, IPrice, ICarBodyType, ITmp } from '../interface';
import { getHttp } from './getHttp';

const typeFile = path.join(rootPath, 'src', 'assets', 'CarTypeFilter.xlsx');
const typeJson: ICarTypeFilter[] = readXlsx(typeFile)
export function carTypeFilter(carType: string) {
  const obj = typeJson.find(item => {
    return item.carType === carType;
  })
  if (obj) {
    return obj.carTypeFilter
  }
  return ''
}

const brandFile = path.join(rootPath, 'src', 'assets', 'MappedBrand.xlsx');
const brandJson: IMappedBrand[] = readXlsx(brandFile)
export function mappedBrandFilter(brand: string) {
  const obj = brandJson.find(item => {
    return item.brand === brand;
  })
  if (obj) {
    return obj.mappedBrand;
  }
  return ''
}

const statusFile = path.join(rootPath, 'src', 'assets', 'MarketStatusFilter.xlsx');
const statusJson: IMarketStatusFilter[] = readXlsx(statusFile);
export function marketStatusFilter(status: string) {
  const obj = statusJson.find(item => {
    return item.marketStatus === status;
  })

  if (obj) {
    return obj.marketStatusFilter
  }
  return ''
}

export function shieldFilter(list: ICar[]) {
  const arr = list.filter(item => {
    return item.mappedBrand !== '0屏蔽屏蔽屏蔽' && item.carTypeFilter !== '0屏蔽屏蔽屏蔽' && item.statusFilter !== '0屏蔽屏蔽屏蔽';
  })
  return arr;
}

// const logoFile = path.join(rootPath, 'src', 'assets', 'logos.xlsx');
const logoJson: IMappedBrand[] = readXlsx(brandFile);
export function getLogo(brand: string) {
  const obj = logoJson.find(item => {
    return item.brand === brand
  })
  if (obj) {
    return obj.logo;
  }
  return null;
}


const priceFile = path.join(rootPath, 'src', 'assets', 'price.json');
const priceStr: string = fs.readFileSync(priceFile, { encoding: 'utf8' })
const priceJson: IPrice[] = JSON.parse(priceStr)
export function getBodyTypeFromPrice(name: string) {
  const car = priceJson.find(p => {
    return p.car === name;
  })

  if (car) {
    return car.rank
  }

  return '';
}

// export function getBodyTypeFromFilesCarPage(name:string){
//   const file = fs.readFileSync(path.join(rootPath,'files','carPage',`${name}.html`),{encoding:'utf8'});
//   const $ = cheerio.load(file);

//   const desEle = $('ul.des')
// }


const carBodyTypeFile = path.join(rootPath, 'src', 'assets', 'CarBodyType.xlsx')
const carBodyTypeJson: ICarBodyType[] = readXlsx(carBodyTypeFile);
export function getBodyType(carBodyType: string) {
  const car = carBodyTypeJson.find(c => {
    return c.bodyTypeChinese === carBodyType;
  })
  if (car) {
    return car.bodyType
  }
  return '';
}

export async function getCarPage(url: string) {
  const u = pcautoUrl + url;
  const html = await getHttp(u)
  return html;
}

export function getImported(otherName: string) {
  if (/进口/g.test(otherName)) {
    return '进口'
  }
  return ''
}

export function getOtherName2(otherName: string) {
  return otherName.replace(/(-|_)/g, '');
}

const tmpJson: ITmp[] = readXlsx(path.join(rootPath, 'src', 'assets', 'tmp.xlsx'))
export function getEnName(mappedBrand: string, otherName: string) {
  const car = tmpJson.find((item) => {
    const reg1 = new RegExp(mappedBrand, 'g');
    const reg2 = new RegExp(otherName, 'g')

    return reg1.test(item.chName) && reg2.test(item.chName)
  })
  if(car){
    return car.enName;
  }
  return '';
}
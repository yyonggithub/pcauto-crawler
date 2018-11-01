import * as path from 'path';
import { readXlsx } from './readXlsx';
import { rootPath } from '../config'
import { ICarTypeFilter, IMarketStatusFilter, IMappedBrand, ICar, ILogo } from '../interface';

const typeFile = path.join(rootPath, 'src', 'assets', 'CarTypeFilter.xlsx');
const typeJson = readXlsx(typeFile) as ICarTypeFilter[]
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
const brandJson = readXlsx(brandFile) as IMappedBrand[]
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
const statusJson = readXlsx(statusFile) as IMarketStatusFilter[];
export function marketStatusFilter(status: string) {
  const obj = statusJson.find(item => {
    return item.marketStatus === status;
  })

  if (obj) {
    return obj.marketStatusFilter
  }
  return ''
}

export function shieldFilter(list:ICar[]){
  const arr = list.filter(item=>{
    return item.mappedBrand !== '屏蔽屏蔽屏蔽' && item.carTypeFilter !== '屏蔽屏蔽屏蔽' && item.statusFilter !== '屏蔽屏蔽屏蔽';
  })
  return arr;
}

const logoFile = path.join(rootPath,'src','assets','logos.xlsx');
const logoJson = readXlsx(logoFile) as ILogo[]
export function logoFilter(brand:string){
  const obj = logoJson.find(item=>{
    return item.brand === brand
  })
  if(obj){
    return obj.logo;
  }
  return null;
}

import * as fs from 'fs';
import * as cheerio from 'cheerio';
import * as path from 'path';

import { rootPath } from '../pcauto/config';

export function readHtml(fileUrl: string) {
  let file = path.join(rootPath, 'text.html');
  if (fileUrl) {
    file = fileUrl
  }
  const text = fs.readFileSync(file, {
    encoding: 'utf8'
  })
  const $ = cheerio.load(text);

  let arr: any[] = [];
  let cars: any[] = [];

  let list = $('.clearfix.brandDiv')
  list = list.filter((idx, ele) => {
    return ele.attribs.class !== "clearfix brandDiv brandHot";
  })
  list.each((idx, ele: CheerioElement) => {
    const nodes = ele.childNodes
    const array = nodes.filter((element) => {
      return element.type == 'tag'
    })
    arr = arr.concat(array);
  })

  arr.forEach(ele => {
    const nodes = ele.children;
    nodes.forEach((child: any) => {
      cars.push(child.data)
    })

  })
  // console.log(arr);
  // console.log(cars);
  fs.writeFileSync(path.join(rootPath, 'cars.json'), JSON.stringify(cars))

  return cars;
}
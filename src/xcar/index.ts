// 获取xcar车辆状态

import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import * as json2csv from 'json2csv';

import { getHttp } from '../utils/getHttp';

import { strAddBom } from '../utils/strAddBom';

interface ICar {
  letter: string;
  name: string;
  span: string;
  state: string;
  brand: string;
  subBrand: string;
}

const url = 'http://newcar.xcar.com.cn/price/'
const dist = path.join(__dirname, 'dist');

getHtml(url).then(html => {
  const cars = analyzeHtml(html);
  const fields = ['letter', 'name', 'brand', 'subBrand', 'state', 'span']
  const json2csvParser = new json2csv.Parser({ fields, excelStrings: true })
  const csv = json2csvParser.parse(cars);
  fs.writeFileSync(path.join(dist, `xcar.csv`), strAddBom(csv), { encoding: 'utf8' })
}).finally(() => {
  console.log('finish');

})


async function getHtml(url: string) {
  const html = await getHttp(url);
  fs.writeFileSync(path.join(dist, `xcar.html`), html, { encoding: 'utf8' });
  return html
}

function analyzeHtml(text: string) {
  const cars: ICar[] = [];
  const $ = cheerio.load(text);
  const $container = $('.container')

  $container.each((index, element) => {
    // 字母
    let letter = '';
    letter = element.attribs.id || '';
    const $tr = $(element).find('tr')
    $tr.each((idx, ele) => {
      // let brand = '';
      // brand = ele.firstChild.data || '';
      const $td = $(ele).find('td');
      const $first = $td.first()
      const $last = $td.last();

      const $brand = $first.find('div>a>span')
      // 品牌
      const brand = $brand[0].firstChild.data || '';
      const $subBrand = $last.find('.column_content')
      $subBrand.each((n, el) => {
        const $a = $(el).find('p>a')
        // 子品牌
        const subBrand = $a[0].firstChild.data || '';

        const $li = $(el).find('ul li>div a span')
        $li.each((m, elem) => {
          const name = elem.attribs.title || '';
          const span = elem.firstChild.data || '';
          const exec = /\((\S+)\)/g.exec(span)
          let state = ''
          if (exec && exec.length > 0) {
            state = exec[1]
          }
          cars.push({
            letter,
            name,
            span,
            state,
            brand,
            subBrand
          })
        })
      })
    })
  })

  return cars;
}
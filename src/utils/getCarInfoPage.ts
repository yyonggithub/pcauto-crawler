import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { rootPath } from '../config';

export function analyzeCarInfoPageAndGetBodyTypeChinese(name: string, bodyTypeChinese: string) {
  if (bodyTypeChinese === '') {
    try {
      const html: string = fs.readFileSync(path.join(rootPath, 'files', 'carPage', `${name}.html`), { encoding: 'utf8' })
      const $ = cheerio.load(html);
      const liEle = $('ul.des>li')

      let btChinese: string = '';
      if (liEle && liEle.length > 0) {

        const aEle = $(liEle[0]).find('a')
        if (aEle && aEle.length > 0) {
          btChinese = aEle[aEle.length - 1].attribs.title || ''
          // return btChinese;
          if (btChinese === '' || /L|T/g.test(btChinese)) {

            const a2Ele = $(liEle[1]).find('a')
            if (a2Ele && a2Ele.length > 0) {
              btChinese = a2Ele[0].attribs.title || ''
            }
          }
        }

        return btChinese;
      }
    } catch (err) {
      return bodyTypeChinese
    }
  }
  return bodyTypeChinese;
}
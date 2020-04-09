import * as fs from 'fs';
import * as path from 'path';
import { rootPath } from './config';
import { ICar } from './interface';
import { getCarPage } from '../utils/filter';

const allcarStr: string = fs.readFileSync(path.join(rootPath, 'files', 'allcar-normal.json'), { encoding: 'utf8' })
const allcarJson: ICar[] = JSON.parse(allcarStr);


getCarInfoPage();

/**
 * 从pcauto获取车辆页面到filtes/carPage
 */
async function getCarInfoPage() {
  for (let i = 0; i < allcarJson.length; i++) {
    const html = await getCarPage(allcarJson[i].href);
    const carPageFolder = path.join(rootPath, 'files', 'carPage');
    if (!fs.existsSync(carPageFolder)) {
      fs.mkdirSync(carPageFolder);
    }
    fs.writeFileSync(path.join(rootPath, 'files', 'carPage', `${allcarJson[i].name}.html`), html, {
      encoding: 'utf8'
    });

    await wait(`index:${i}, count=${allcarJson.length}`);
  }
}

async function wait(info: string) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(new Date(), info);

      resolve('wait')
    }, 200)
  })
}
// TODO: 抛弃

import * as fs from 'fs';
import fetch from 'isomorphic-fetch';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';

import * as http from 'https';

const url = 'https://price.pcauto.com.cn/price/';
let brandList: any;

async function getHtml(url: string) {
  const headers = {
    // "Content-Type": "application/x-javascript",
    'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
  }
  const response = await fetch(url, {
    headers
  })
  if (response.status >= 400) {
    throw new Error('Bad response from server')
  }
  const text = await response.text();
  return text;
}

function getHttp(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      const chunks: any[] = [];
      res.on('data', d => {
        chunks.push(d);
      })
      res.on('end', () => {
        // let buffer = new Buffer(chunks);
        let buffer = Buffer.concat(chunks);
        const str = iconv.decode(buffer, 'GBK')
        resolve(str);
      })
      res.on('error', (err) => {
        reject(err);
      })
    })
  })
}

// const html = getHtml(url);

// getHtml(url).then(text => {
//   fs.writeFileSync('./text.html', text, { encoding: 'utf8' })
// })


// readHtml();

// readDemo1Html()


function readHtml() {
  const text = fs.readFileSync('./text.html', {
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
      cars.push({ brand: child.data })
    })

  })
  console.log(cars);
  console.log(cars.length);

  fs.writeFileSync('./cars.json', JSON.stringify(cars))
}


function readDemo1Html() {
  const text = fs.readFileSync('./demo1.html', {
    encoding: 'utf8'
  })
  const $ = cheerio.load(text);
  const liEles = $('li');
  const closeChilds = liEles.filter((index, element) => {
    return element.attribs.class === 'closeChild'
  })

  let aEles: any[] = [];
  closeChilds.map((index, element) => {
    const arr = element.children.filter((element) => {
      return element.type === 'tag' && element.attribs.name && element.attribs.name === 'VA' ? true : false;
    })
    aEles = aEles.concat(arr);
  })

  // console.log(aEles);

  const json = aEles.map((element) => {
    return {
      brand: element.attribs.title,
      href: element.attribs.href,
      id: element.attribs.id,
      brandId: +element.attribs.id.replace('pictext_a_', '')
    }
  })

  fs.writeFileSync('./carLink.json', JSON.stringify(json))

  return json
}

async function getPriceHtml(brand: string, href: string) {
  const url = `https:${href}`;
  const text = await getHtml(url)
  if (!fs.existsSync(`./price/${brand}`)) {
    fs.mkdirSync(`./price/${brand}`)
  }
  fs.writeFileSync(`./price/${brand}/text.html`, text);
}

async function analyze(json: any[]) {
  // json.forEach(async item => {
  //   await getPriceHtml(item.brand, item.href)
  // })
  // const list: Promise<any>[] = [];
  // for (const obj of json) {
  //   list.push(getPriceHtml(obj.brand, obj.href))
  // }
  // // return list;
  // Promise.all(list).then(() => {
  //   console.log('success');
  // }).catch(err => {
  //   console.log(err);
  // })
  for (let i = 0; i < json.length; i++) {
    await getPriceHtml(json[i].brand,json[i].href);
    await wait(`index: ${i}, count=${json.length}`)
  }

  console.log('success');
}

const json = readDemo1Html()
analyze(json);

async function getCarsByBrand(brand: string, brandId: number) {
  const url = `https://price.pcauto.com.cn/index/js/5_5/treedata-cn-${brandId}.js?t=${Math.floor(Math.random() * 10 + 1)}`
  const text = await getHttp(url)

  const regStr = `var brandList_${brandId}='`;
  const reg = new RegExp(regStr, 'g');
  let str = text.replace(reg, '')
  str = str.replace('\';', '')
  return str

  // // return list;
  // getHttp(url).then(res => {
  //   console.log(res);

  // })
}

async function asyncJsonByBrandId(json: any[]) {
  json.forEach(async item => {
    let text = await getCarsByBrand(item.brand, item.brandId)
    if (!fs.existsSync(`./price/${item.brand}`)) {
      fs.mkdirSync(`./price/${item.brand}`)
    }
    // const buff = new Buffer(text)
    // text = iconv.decode(buff, 'gbk')
    fs.writeFileSync(`./price/${item.brand}/cars.html`, text);
  })
  // console.log(111);

}

function getCarsInfo(json: any[]) {
  const list: any[] = [];
  json.forEach(item => {
    const { brand, brandId } = item;
    const filePath = `./price/${brand}/cars.html`
    const text = fs.readFileSync(filePath, {
      encoding: 'utf8'
    })
    list.push(text);
  })
  return list;
}

function analyzeCarsHtml(text: string) {
  const $ = cheerio.load(text);
  const banTits = $('li.banTit');
  const brands: any[] = []
  banTits.map((index, element) => {
    const aELement = element.firstChild;
    const childNodes = aELement.childNodes;
    // if (childNodes) {
    const [icon, sname, snum] = childNodes;

    const obj = {
      id: aELement.attribs.id.replace(/brand_/g, ''),
      href: aELement.attribs.href,
      title: sname.firstChild.data,
      snum: snum.firstChild.data ? snum.firstChild.data.trim().replace(/\(|\)/g, '') : ''
    }

    brands.push(obj);
    return obj;
    // }
  })

  const products = $('li.product');


  const producetList: any[] = [];

  products.map((index, element) => {
    const aElement = element.firstChild;
    const [emElement, iElement] = aElement.childNodes;
    const [em, span1, span2] = iElement.childNodes;

    const temStr = aElement.attribs.id.replace(/product\_a\_/g, '');
    const tmpArr = temStr.split('_')
    const obj = {
      id: aElement.attribs.id,
      firstId: tmpArr[0],
      lastId: tmpArr[1],
      href: aElement.attribs.href,
      title: aElement.attribs.title,
      sname: em.firstChild.data ? em.firstChild.data.trim() : '',
      snum: '',
      isSell: true,
      // isSell: span1.firstChild.data && span1.firstChild.data !== '' ? false : true,
      // snum: span2.firstChild.data ? span2.firstChild.data.trim().replace(/\(|\)/g, '') : '',
    }

    if (span2) {
      obj.isSell = false;
      obj.snum = span2.firstChild.data ? span2.firstChild.data.trim().replace(/\(|\)/g, '') : '';
    } else {
      obj.snum = span1.firstChild.data ? span1.firstChild.data.trim().replace(/\(|\)/g, '') : '';
    }
    producetList.push(obj);
    return obj;
  })


  const cars = producetList.map(item => {

    const brand = brands.find((i) => {
      return item.firstId === i.id;
    })
    if (brand) {
      item.brand = brand.title;
    }
    return item;
  })

  // console.log(producetList);
  // console.log(cars);
  return cars;
}

function mkFolder(brand: string, carName: string) {
  const pcautoPath = `./pcauto`;
  const brandPath = `${pcautoPath}/${brand}`;
  const carPath = `${brandPath}/${carName}`;
  if (!fs.existsSync(pcautoPath)) {
    fs.mkdirSync(pcautoPath)
  }
  if (!fs.existsSync(brandPath)) {
    fs.mkdirSync(brandPath)
  }
  if (!fs.existsSync(carPath)) {
    fs.mkdirSync(carPath)
  }
}


async function analyzeAllCars() {
  for (let i = 0; i < allCars.length; i++) {
    const car = allCars[i];
    // cars.forEach(async car => {
    mkFolder(car.brand, car.title)

    fs.writeFileSync(`./pcauto/${car.brand}/${car.title}/car.json`, JSON.stringify(car))

    // const html = await getHttp(`https:${car.href}`)
    const html = await getHtml(`https:${car.href}`)
    await wait(`all:${allCars.length},index:${i}`);
    fs.writeFileSync(`./pcauto/${car.brand}/${car.title}/price.html`, html);
    // })
  }
}
// analyzeAllCars()

function analyzePriceByAllCars() {
  const list = []
  for (let i = 0; i < allCars.length; i++) {
    const car = allCars[i]
    const { id, href, brand, title, isSell } = car;
    const html = fs.readFileSync(`./pcauto/${brand}/${title}/price.html`, { encoding: 'utf8' })

    const $ = cheerio.load(html);

    const pList = $('ul.des li p')

    const pl = pList[0];
    // const [pl, jb, bsx, cslx] = pList;

    const rankEle = pList[1].children.find((item) => {
      return item.tagName === 'a'
    })
    const rank = rankEle ? rankEle.attribs.title : '';

    const em = pList[3].children.find((ele) => {
      return ele.tagName === 'em'
    })

    let typeEles: any[] = [];
    if (em) {
      typeEles = em.children.filter((i) => {
        return i.tagName === 'a'
      })
    }


    let type = '';

    typeEles.forEach(i => {
      type = type + i.attribs.title + ','
    })

    let price, p, lowPrice, heightPrice, obj: any;
    const priceELes = $('p.p1>em')
    if (priceELes.length === 1) {
      price = priceELes[0];
      p = price.firstChild.data ? price.firstChild.data.trim() : ''
      // console.log(p);
      // allCars[i].price = p;
      try {
        const prices = p.split('-');
        lowPrice = prices[0];
        heightPrice = prices[0].replace(/万/g, '');
      } catch (err) {
        lowPrice = p
        heightPrice = ''
      }

      obj = {
        brand: car.brand,
        car: car.title,
        isSell: car.isSell,
        lowPrice,
        heightPrice,
        href: car.href
      }
    }

    obj.rank = rank;
    obj.type = type;
    list.push(obj);
  }

  return list;
}



// const json = readDemo1Html();

// const list = getCarsInfo(json);

let allCars: any[] = []

// list.forEach(item => {
//   const cars = analyzeCarsHtml(item)
//   allCars = allCars.concat(cars);
// })

async function wait(str: string) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(new Date(), str);
      resolve(true)
    }, 500);

  })
}

// const price = analyzePriceByAllCars();
// fs.writeFileSync('./price.json', JSON.stringify(price))
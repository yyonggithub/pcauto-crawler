import { getHtml } from './utils/getHtml';
import { readHtml } from './utils/readHtml';

const url = 'https://price.pcauto.com.cn/price/';

async function analyzeDemo1() {
  const text = await getHtml(url);

}
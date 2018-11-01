import fetch from 'isomorphic-fetch';

export async function getHtml(url: string): Promise<string> {
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
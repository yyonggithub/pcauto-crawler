import * as https from 'https';
import * as http from 'http';
import * as iconv from 'iconv-lite';

export function getHttps(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks: any[] = [];
      res.on('data', d => {
        chunks.push(d);
      })
      res.on('end', () => {
        // let buffer = new Buffer(chunks);
        let buffer = Buffer.concat(chunks);
        const str = iconv.decode(buffer, 'gbk')
        resolve(str);
      })
      res.on('error', (err) => {
        reject(err);
      })
    })
  })
}
export function getHttp(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      const chunks: any[] = [];
      res.on('data', d => {
        chunks.push(d);
      })
      res.on('end', () => {
        // let buffer = new Buffer(chunks);
        let buffer = Buffer.concat(chunks);
        const str = iconv.decode(buffer, 'gbk')
        resolve(str);
      })
      res.on('error', (err) => {
        reject(err);
      })
    })
  })
}
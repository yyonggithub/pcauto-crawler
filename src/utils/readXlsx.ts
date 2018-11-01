import * as xlsx from 'xlsx';

import { INotNeed } from '../interface';

export function readXlsx(file: string) {
  const wb = xlsx.readFile(file);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json: INotNeed[] = xlsx.utils.sheet_to_json(sheet);
  return json;
}
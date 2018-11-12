import * as xlsx from 'xlsx';

export function readXlsx<T>(file: string):T[] {
  const wb = xlsx.readFile(file);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json:T[] = xlsx.utils.sheet_to_json(sheet);
  return json;
}
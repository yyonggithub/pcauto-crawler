export interface ICar {
  // iconTag: string;
  brand: string;
  needed: boolean;
  subBrand: string;
  name: string;
  chName: string;
  otherName: string;
  // href: string;
  type: string;
  num: string;
  status: string;
  lowPrice: string;
  heightPrice: string;
  intLowPrice: number;
  ceilingHighPrice: number;
  [propName: string]: any;
}

export interface INotNeed {
  notneed: string
}

export interface IRange {
  index: number;
  low: number;
  height: number;
  range: string;
}

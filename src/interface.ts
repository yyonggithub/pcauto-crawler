export interface ICar {
  // iconTag: string;
  brand: string;
  mappedBrand: string;
  subBrand: string;
  name: string;
  chName: string;
  logo:string;
  otherName: string;
  // href: string;
  carType: string;
  carTypeFilter: string;
  // num: string;
  status: string;
  statusFilter: string;
  lowPrice: string;
  heightPrice: string;
  intLowPrice: number;
  ceilingHighPrice: number;
  [propName: string]: any;
}

export interface INotNeed {
  notneed: string
}

export interface IMappedBrand {
  brand: string;
  mappedBrand: string;
}

export interface ICarTypeFilter {
  carType: string;
  carTypeFilter: string;
}

export interface IMarketStatusFilter {
  marketStatus: string;
  marketStatusFilter: string;
}

export interface IRange {
  index: number;
  low: number;
  height: number;
  range: string;
}

export interface ITmp{
  name:string;
  logo:string;
  chName:string;
  zhName:string;
  enName:string;
  pyName:string;
}

export interface ILogo{
  brand:string;
  logo:string;
}
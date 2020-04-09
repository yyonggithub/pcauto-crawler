export interface ICar {
  // iconTag: string;
  imported: string;
  brand: string;
  mappedBrand: string;
  subBrand: string;
  name: string;
  chName: string;
  enName: string;
  logo: string;
  otherName: string;
  otherName2: string;
  href: string;
  // priceHref: string;
  carType: string;
  carTypeFilter: string;
  // num: string;
  status: string;
  statusFilter: string;
  lowPrice: string;
  heightPrice: string;
  intLowPrice: number;
  ceilingHighPrice: number;
  hasPrice?: boolean;
  bodyTypeChinese: string;
  bodyType: string;
  [propName: string]: any;
}

export interface INotNeed {
  notneed: string
}

export interface IMappedBrand {
  brand: string;
  mappedBrand: string;
  mappedLogo: string;
  logo: string;
  pyAllMappedBrandWords: string;
  pyFirstMapedBrandWords: string;
  pyFirstFourMappedBrandCharacters: string;
  brandFirstTwoMappedBrandWords: string;
  homophonesOfMappedBrand: string;
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

export interface ITmp {
  name: string;
  logo: string;
  chName: string;
  zhName: string;
  enName: string;
  pyName: string;
}

export interface ILogo {
  brand: string;
  logo: string;
}

/**
 * price.json
 */
export interface IPrice {
  brand: string;
  car: string;
  isSell: string;
  lowPrice: string;
  heightPrice: string;
  href: string;
  priceHref: string;
  rank: string;
  type: string;
}

export interface ICarBodyType {
  bodyTypeChinese: string;
  bodyType: string;
}
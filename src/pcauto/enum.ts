export enum Range {
  '5万以下',
  '5-7万',
  '7-10万',
  '10-13万',
  '13-15万',
  '15-18万',
  '18-20万',
  '20-25万',
  '25-30万',
  '30-40万',
  '40-60万',
  '60-80万',
  '80万以上',
}

export enum ChangeRange {
  down,
  normal,
  up,
}

export enum Way {
  'default', // 默认处理方式:只处理单页获取的价格数据
  'price', // 默认处理方式:只处理单页获取的价格数据
}
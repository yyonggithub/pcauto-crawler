export function strAddBom(str: string) {
  const buffer = Buffer.concat([
    Buffer.from('\xEF\xBB\xBF', 'binary'),
    Buffer.from(str)
  ]);
  return buffer;
}
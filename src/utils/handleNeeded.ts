export function handleNeeded(brand: string, json: { notneed: string }[]) {
  const index = json.findIndex(item => {
    return item.notneed === brand;
  });
  if (index === -1) {
    return brand;
  }
  return '屏蔽屏蔽屏蔽';
}
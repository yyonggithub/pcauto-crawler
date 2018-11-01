export function handleNeeded(brand: string, json: {
  notneed: string;
}[]) {
  const index = json.findIndex(item => {
    return item.notneed === brand;
  });
  if (index === -1) {
    return true;
  }
  return false;
}
export async function wait(time: number, name: string) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(name)
    }, time);
  })
}
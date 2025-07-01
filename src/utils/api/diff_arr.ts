export const giveDiffArr = <T>(from: Array<T>, sub: Array<T>) => {
  const res: Array<T> = [];

  from.forEach((item) => {
    if (!sub.includes(item)) res.push(item);
  });

  return res;
};

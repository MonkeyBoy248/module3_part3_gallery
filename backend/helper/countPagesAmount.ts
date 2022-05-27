export function countPagesAmount (picturesAmount: number, limit: number) {
  return Math.ceil(picturesAmount / limit);
}
// Fictieve dagwaarden voor november 2026, in chronologische volgorde.
const dagwaarden = [
  [4, 2], [6, 1], [3, 4], [4, 3], [2, 5], [5, 2], [8, 3],
  [7, 1], [3, 4], [2, 6], [4, 4], [5, 2], [6, 3], [9, 2],
  [7, 0], [2, 3], [3, 7], [4, 6], [3, 5], [5, 2], [8, 4],
  [10, 2], [4, 3], [5, 5], [0, 4], [4, 3], [6, 1], [8, 2],
  [7, 3], [3, 4],
];

export const pootjesVoorbeelddata = dagwaarden.map(([adopted, rescued], index) => ({
  date: `2026-11-${String(index + 1).padStart(2, '0')}`,
  adopted,
  rescued,
}));

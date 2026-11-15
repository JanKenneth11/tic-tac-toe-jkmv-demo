export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = Cell[];

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export function emptyBoard(): Board {
  return Array(9).fill(null);
}

export function getWinner(board: Board): { player: Player; line: readonly number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    const player = board[a];
    if (player && player === board[b] && player === board[c]) {
      return { player, line };
    }
  }
  return null;
}

export function isDraw(board: Board): boolean {
  return !getWinner(board) && board.every((cell) => cell !== null);
}

"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Circle, Handshake, RotateCcw, Trophy, Undo2, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { emptyBoard, getWinner, isDraw, type Board, type Player } from "@/lib/game";
import { updateScore, useScore, ZERO_SCORE } from "@/lib/score-store";

const other = (p: Player): Player => (p === "X" ? "O" : "X");

export function TicTacToe() {
  const [history, setHistory] = useState<Board[]>([emptyBoard()]);
  const [starter, setStarter] = useState<Player>("X");
  const [focusIndex, setFocusIndex] = useState(4);
  const [resetOpen, setResetOpen] = useState(false);
  const score = useScore();
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const board = history[history.length - 1];
  const moves = history.length - 1;
  const current: Player = moves % 2 === 0 ? starter : other(starter);
  const winner = getWinner(board);
  const draw = isDraw(board);
  const gameOver = Boolean(winner) || draw;
  const hasScore = score.X + score.O + score.draw > 0;
  const standings =
    score.X === score.O
      ? `Match tied ${score.X}–${score.O}`
      : score.X > score.O
        ? `X leads ${score.X}–${score.O}`
        : `O leads ${score.O}–${score.X}`;

  function play(index: number) {
    if (board[index] || gameOver) return;
    const next = board.slice();
    next[index] = current;
    setHistory([...history, next]);

    const nextWinner = getWinner(next);
    if (nextWinner) updateScore((s) => ({ ...s, [nextWinner.player]: s[nextWinner.player] + 1 }));
    else if (isDraw(next)) updateScore((s) => ({ ...s, draw: s.draw + 1 }));
  }

  function undo() {
    if (moves > 0 && !gameOver) setHistory(history.slice(0, -1));
  }

  function newGame() {
    // Alternate who goes first after each finished game.
    if (gameOver) setStarter(other);
    setHistory([emptyBoard()]);
  }

  function resetScore() {
    updateScore(() => ZERO_SCORE);
    setStarter("X");
    setHistory([emptyBoard()]);
    setResetOpen(false);
  }

  function focusCell(index: number) {
    setFocusIndex(index);
    cellRefs.current[index]?.focus();
  }

  function onCellKeyDown(e: React.KeyboardEvent, i: number) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const target: Record<string, number> = {
      ArrowUp: ((row + 2) % 3) * 3 + col,
      ArrowDown: ((row + 1) % 3) * 3 + col,
      ArrowLeft: row * 3 + ((col + 2) % 3),
      ArrowRight: row * 3 + ((col + 1) % 3),
      Home: 0,
      End: 8,
    };
    if (e.key in target) {
      e.preventDefault();
      focusCell(target[e.key]);
    }
  }

  const onGlobalKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (resetOpen || e.altKey) return;
    if ((e.target as HTMLElement).closest("input, textarea, [contenteditable='true']")) return;

    const key = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && key === "z") {
      e.preventDefault();
      undo();
      return;
    }
    if (e.metaKey || e.ctrlKey) return;

    if (key === "n") newGame();
    else if (key === "u") undo();
    else if (/^[1-9]$/.test(key)) {
      const index = Number(key) - 1;
      play(index);
      focusCell(index);
    }
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onGlobalKeyDown(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="gap-1">
        <CardTitle
          aria-live="polite"
          className="flex h-8 items-center gap-2 text-2xl font-semibold tracking-tight whitespace-nowrap"
        >
          {winner ? (
            <>
              <Trophy className="size-6 text-amber-500" aria-hidden />
              <Mark player={winner.player} className="size-6" />
              <span>
                <span className="sr-only">{winner.player}</span> wins!
              </span>
            </>
          ) : draw ? (
            <>
              <Handshake className="size-6 text-muted-foreground" aria-hidden />
              It&apos;s a draw
            </>
          ) : (
            <>
              <Mark player={current} className="size-6" />
              <span>
                <span className="sr-only">{current}</span> to move
              </span>
            </>
          )}
        </CardTitle>
        <CardDescription className="truncate">
          {gameOver ? standings : `Move ${moves + 1} of 9`}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <PlayerCard player="X" score={score.X} active={!gameOver && current === "X"} won={winner?.player === "X"} />
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <span className="text-xs text-muted-foreground">Draws</span>
            <span className="font-heading text-lg font-semibold tabular-nums">{score.draw}</span>
          </div>
          <PlayerCard player="O" score={score.O} active={!gameOver && current === "O"} won={winner?.player === "O"} />
        </div>

        <div role="group" aria-label="Game board" className="grid grid-cols-3 gap-2.5">
          {board.map((cell, i) => {
            const highlighted = winner?.line.includes(i);
            const playable = !cell && !gameOver;
            return (
              <Button
                key={i}
                ref={(el) => {
                  cellRefs.current[i] = el;
                }}
                variant="outline"
                tabIndex={i === focusIndex ? 0 : -1}
                aria-disabled={!playable}
                aria-label={`Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}: ${cell ?? "empty"}`}
                onClick={() => play(i)}
                onFocus={() => setFocusIndex(i)}
                onKeyDown={(e) => onCellKeyDown(e, i)}
                className={cn(
                  "group/cell h-auto aspect-square rounded-xl p-0 active:not-aria-[haspopup]:translate-y-0",
                  playable
                    ? "hover:bg-muted active:scale-95"
                    : "cursor-default hover:bg-background dark:hover:bg-input/30",
                  highlighted &&
                    "border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/10 dark:border-emerald-400 dark:bg-emerald-400/15 dark:hover:bg-emerald-400/15",
                  gameOver && !highlighted && "opacity-40",
                )}
              >
                {cell ? (
                  <Mark
                    player={cell}
                    className="size-[55%] animate-in duration-200 fade-in-0 zoom-in-50 motion-reduce:animate-none"
                  />
                ) : (
                  playable && (
                    <Mark
                      player={current}
                      className="size-[55%] opacity-0 transition-opacity group-hover/cell:opacity-25 group-focus-visible/cell:opacity-25"
                    />
                  )
                )}
              </Button>
            );
          })}
        </div>

        <p className="hidden items-center justify-center gap-1.5 text-xs text-muted-foreground pointer-fine:flex">
          Play with <Kbd>1</Kbd>–<Kbd>9</Kbd> or arrow keys and <Kbd>Enter</Kbd>
        </p>
      </CardContent>

      <CardFooter className="flex-wrap gap-2">
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="outline" onClick={undo} disabled={moves === 0 || gameOver} />}
          >
            <Undo2 /> Undo
          </TooltipTrigger>
          <TooltipContent>
            Undo last move <Kbd>U</Kbd>
          </TooltipContent>
        </Tooltip>

        <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
          <AlertDialogTrigger render={<Button variant="ghost" disabled={!hasScore} />}>
            Reset score
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset the scoreboard?</AlertDialogTitle>
              <AlertDialogDescription>
                This clears all wins and draws and starts a fresh game. It can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={resetScore}>
                Reset score
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className={cn("ml-auto min-w-28", gameOver && "animate-in zoom-in-95 motion-reduce:animate-none")}
                variant={gameOver ? "default" : "secondary"}
                onClick={newGame}
              />
            }
          >
            <RotateCcw /> {gameOver ? "Play again" : "New game"}
          </TooltipTrigger>
          <TooltipContent>
            {gameOver ? `${other(starter)} starts next` : "Restart this game"} <Kbd>N</Kbd>
          </TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  );
}

function Mark({ player, className }: { player: Player; className?: string }) {
  return player === "X" ? (
    <XIcon aria-hidden strokeWidth={2.75} className={cn("text-sky-600 dark:text-sky-400", className)} />
  ) : (
    <Circle aria-hidden strokeWidth={2.75} className={cn("text-rose-600 dark:text-rose-400", className)} />
  );
}

function PlayerCard({
  player,
  score,
  active,
  won,
}: {
  player: Player;
  score: number;
  active: boolean;
  won: boolean;
}) {
  return (
    <Card
      size="sm"
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex-row items-center gap-3 px-3 transition-shadow",
        active && "ring-2 ring-primary",
        won && "ring-2 ring-emerald-500 dark:ring-emerald-400",
      )}
    >
      <Mark player={player} className="size-7 shrink-0" />
      {/* Fixed two-line layout: only the label text/colour changes between states, never the height. */}
      <div className="flex min-w-0 flex-col">
        <span
          className={cn(
            "truncate text-xs font-medium whitespace-nowrap text-muted-foreground",
            active && "text-foreground",
            won && "text-emerald-600 dark:text-emerald-400",
          )}
        >
          {won ? "Winner" : active ? "Your turn" : `Player ${player}`}
        </span>
        <span className="font-heading text-2xl leading-tight font-semibold tabular-nums">{score}</span>
      </div>
    </Card>
  );
}

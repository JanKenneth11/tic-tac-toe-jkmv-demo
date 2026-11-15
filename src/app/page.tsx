import { Grid3x3 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { TicTacToe } from "@/components/tic-tac-toe";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
          <Grid3x3 className="size-5" aria-hidden />
          Tic-Tac-Toe
          <span className="text-sm font-normal tracking-normal text-muted-foreground">by Jan Kenneth Villa</span>
        </span>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pt-2 pb-12">
        <TicTacToe />
      </main>
    </div>
  );
}

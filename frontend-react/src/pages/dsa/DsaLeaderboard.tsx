import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Trophy, Loader2 } from "lucide-react";
import { useDsaAuth } from "@/features/dsa/auth/DsaAuthContext";
import { getApiUrl } from "@/lib/api";

interface LeaderboardRow {
  rank: number;
  username: string;
  userId: string;
  rating: number;
  problemsSolved: number;
}

const PAGE_SIZE = 20;

export default function DsaLeaderboard() {
  const { user } = useDsaAuth();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl("/api/dsa/leaderboard?limit=200"))
      .then((res) => res.ok ? res.json() : { items: [] })
      .then((data) => {
        const rows = (data.items || []).map((r: { id: string; username: string; rating: number; problems_solved: number }, i: number) => ({
          rank: i + 1,
          username: r.username,
          userId: r.id,
          rating: r.rating ?? 1200,
          problemsSolved: r.problems_solved ?? 0,
        }));
        setItems(rows);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(items.length / PAGE_SIZE) || 1;
  const paginated = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex-1 p-6">
      <div className="container max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Top users by rating. Filter by country (coming later).
            </p>
          </div>
        </div>

        <div className="rounded-md border">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Rank</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="text-right">Problems Solved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((row) => {
                const isCurrentUser = user?.username === row.username;
                return (
                  <TableRow
                    key={row.userId}
                    className={isCurrentUser ? "bg-primary/10 font-medium" : ""}
                  >
                    <TableCell>
                      <span className={row.rank <= 3 ? "font-bold" : ""}>
                        #{row.rank}
                      </span>
                    </TableCell>
                    <TableCell>
                      {row.username}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-primary">(you)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{row.rating}</TableCell>
                    <TableCell className="text-right">{row.problemsSolved}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(1); }} isActive={page === 1}>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}

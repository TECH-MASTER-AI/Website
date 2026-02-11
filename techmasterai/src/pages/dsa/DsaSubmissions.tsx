import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type SubStatus = "Accepted" | "Wrong Answer" | "TLE" | "MLE" | "Runtime Error";

interface SubmissionRow {
  id: string;
  problemId: string;
  problemTitle: string;
  status: SubStatus;
  language: string;
  runtime: number | null;
  memory: number | null;
  date: string;
}

const MOCK_SUBMISSIONS: SubmissionRow[] = [
  { id: "s1", problemId: "p-1", problemTitle: "Two Sum", status: "Accepted", language: "JavaScript", runtime: 45, memory: 21, date: "2025-01-29 14:30" },
  { id: "s2", problemId: "p-2", problemTitle: "Add Two Numbers", status: "Wrong Answer", language: "Python", runtime: null, memory: null, date: "2025-01-29 13:00" },
  { id: "s3", problemId: "p-3", problemTitle: "Longest Substring", status: "TLE", language: "Java", runtime: null, memory: null, date: "2025-01-28 18:00" },
];

const PAGE_SIZE = 10;

export default function DsaSubmissions() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = statusFilter === "all"
    ? MOCK_SUBMISSIONS
    : MOCK_SUBMISSIONS.filter((s) => s.status === statusFilter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusClass = (s: SubStatus) => {
    if (s === "Accepted") return "bg-green-500/20 text-green-600 dark:text-green-400";
    if (s === "Wrong Answer" || s === "Runtime Error") return "bg-red-500/20 text-red-600 dark:text-red-400";
    return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
  };

  return (
    <div className="flex-1 p-6">
      <div className="container max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Submissions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and filter your submission history. Click a row to view code (UI).
          </p>
        </div>

        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Wrong Answer">Wrong Answer</SelectItem>
              <SelectItem value="TLE">TLE</SelectItem>
              <SelectItem value="MLE">MLE</SelectItem>
              <SelectItem value="Runtime Error">Runtime Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Language</TableHead>
                <TableHead className="text-right">Runtime</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {}}
                >
                  <TableCell>
                    <Link to={`/dsa/problem/${row.problemId}`} className="font-medium hover:underline">
                      {row.problemTitle}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusClass(row.status)}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.language}</TableCell>
                  <TableCell className="text-right">
                    {row.runtime != null ? `${row.runtime} ms` : "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {row.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

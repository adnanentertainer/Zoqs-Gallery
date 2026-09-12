"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { exportReportCsv, type ReportCsvFilters } from "@/app/admin/reports/actions";
import type { ReportType } from "@/types/admin";

interface ExportCsvButtonProps {
  type: ReportType;
  filters: ReportCsvFilters;
}

export function ExportCsvButton({ type, filters }: ExportCsvButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setIsExporting(true);
    setError(null);

    const result = await exportReportCsv(type, filters);
    setIsExporting(false);

    if (result.error || !result.csv) {
      setError(result.error ?? "Unable to generate this report right now.");
      return;
    }

    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename ?? "report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="md"
        isLoading={isExporting}
        onClick={handleExport}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Export CSV
      </Button>
      {error && <p className="font-body text-xs text-error">{error}</p>}
    </div>
  );
}

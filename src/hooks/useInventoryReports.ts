"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventory.service";
import { inventoryKeys } from "./queryKeys";
import { downloadBlob } from "@/utils/helpers/helperfn";
import { useToast } from "@/components/ui/toast";

export const useInventoryReportList = (enabled = true) =>
  useQuery({
    queryKey: inventoryKeys.reports(),
    queryFn: () => inventoryService.listReports(),
    enabled,
  });

const todayStamp = () => new Date().toISOString().slice(0, 10);

export const useDownloadReport = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ key, filters }: { key: string; filters: Record<string, string> }) =>
      inventoryService.downloadReport(key, filters),
    onSuccess: (blob, { key }) => {
      downloadBlob(blob, `rerokart-${key}-${todayStamp()}.xlsx`);
      toast.success("Report downloaded");
    },
    // The axios client already turned the server's JSON error body into the message.
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to download the report");
    },
  });
};

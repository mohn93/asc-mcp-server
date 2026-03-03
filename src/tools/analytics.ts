import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ascGet } from "../client/api-client.js";

export function registerAnalyticsTools(server: McpServer): void {
  server.tool(
    "get_sales_report",
    "Request a sales or financial report. Returns report data as text.",
    {
      filterFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
        .describe("Report frequency"),
      filterReportType: z.enum(["SALES", "PRE_ORDER", "NEWSSTAND", "SUBSCRIPTION", "SUBSCRIPTION_EVENT", "SUBSCRIBER", "SUBSCRIPTION_OFFER_CODE_REDEMPTION", "INSTALLS", "FIRST_ANNUAL"])
        .describe("Type of report"),
      filterReportDate: z.string()
        .describe("Report date in YYYY-MM-DD format"),
      filterVendorNumber: z.string()
        .describe("Your vendor number from App Store Connect"),
      filterReportSubType: z.enum(["SUMMARY", "DETAILED", "SUMMARY_INSTALL_TYPE", "SUMMARY_TERRITORY", "SUMMARY_CHANNEL"]).optional()
        .describe("Report sub-type (default SUMMARY)"),
    },
    async ({ filterFrequency, filterReportType, filterReportDate, filterVendorNumber, filterReportSubType }) => {
      const params: Record<string, string> = {
        "filter[frequency]": filterFrequency,
        "filter[reportType]": filterReportType,
        "filter[reportDate]": filterReportDate,
        "filter[vendorNumber]": filterVendorNumber,
        "filter[reportSubType]": filterReportSubType ?? "SUMMARY",
      };

      try {
        const response = await ascGet<unknown>("/salesReports", params);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error fetching report: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ascGet, type PaginatedResponse } from "../client/api-client.js";
import type { InAppPurchase, SubscriptionGroup } from "../types/asc-api.js";

export function registerSubscriptionsTools(server: McpServer): void {
  server.tool(
    "list_in_app_purchases",
    "List in-app purchases for an app",
    {
      appId: z.string().describe("The App Store Connect app ID"),
      limit: z.number().min(1).max(200).optional()
        .describe("Number of IAPs to return (default 50)"),
    },
    async ({ appId, limit }) => {
      const params: Record<string, string> = {
        "fields[inAppPurchases]": "name,productId,inAppPurchaseType,state",
        limit: String(limit ?? 50),
      };

      const response = await ascGet<PaginatedResponse<InAppPurchase>>(
        `/apps/${appId}/inAppPurchasesV2`,
        params
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              inAppPurchases: response.data.map((iap) => ({
                id: iap.id,
                name: iap.attributes.name,
                productId: iap.attributes.productId,
                type: iap.attributes.inAppPurchaseType,
                state: iap.attributes.state,
              })),
            }, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "list_subscriptions",
    "List subscription groups for an app",
    {
      appId: z.string().describe("The App Store Connect app ID"),
      limit: z.number().min(1).max(200).optional()
        .describe("Number of subscription groups to return (default 50)"),
    },
    async ({ appId, limit }) => {
      const params: Record<string, string> = {
        "fields[subscriptionGroups]": "referenceName",
        limit: String(limit ?? 50),
      };

      const response = await ascGet<PaginatedResponse<SubscriptionGroup>>(
        `/apps/${appId}/subscriptionGroups`,
        params
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              subscriptionGroups: response.data.map((sg) => ({
                id: sg.id,
                referenceName: sg.attributes.referenceName,
              })),
            }, null, 2),
          },
        ],
      };
    }
  );
}

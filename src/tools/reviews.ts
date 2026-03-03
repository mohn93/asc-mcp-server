import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ascGet, ascPost, type PaginatedResponse } from "../client/api-client.js";
import type { CustomerReview } from "../types/asc-api.js";

export function registerReviewsTools(server: McpServer): void {
  server.tool(
    "list_customer_reviews",
    "List customer reviews for an app",
    {
      appId: z.string().describe("The App Store Connect app ID"),
      filterRating: z.string().optional()
        .describe("Filter by rating (1-5)"),
      filterTerritory: z.string().optional()
        .describe("Filter by territory code (e.g. USA, GBR)"),
      sort: z.enum(["createdDate", "-createdDate", "rating", "-rating"]).optional()
        .describe("Sort order (prefix with - for descending)"),
      limit: z.number().min(1).max(200).optional()
        .describe("Number of reviews to return (default 20)"),
    },
    async ({ appId, filterRating, filterTerritory, sort, limit }) => {
      const params: Record<string, string> = {
        "fields[customerReviews]": "rating,title,body,reviewerNickname,createdDate,territory",
        limit: String(limit ?? 20),
        sort: sort ?? "-createdDate",
      };

      if (filterRating) params["filter[rating]"] = filterRating;
      if (filterTerritory) params["filter[territory]"] = filterTerritory;

      const response = await ascGet<PaginatedResponse<CustomerReview>>(
        `/apps/${appId}/customerReviews`,
        params
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              reviews: response.data.map((r) => ({
                id: r.id,
                rating: r.attributes.rating,
                title: r.attributes.title,
                body: r.attributes.body,
                reviewer: r.attributes.reviewerNickname,
                date: r.attributes.createdDate,
                territory: r.attributes.territory,
              })),
            }, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "respond_to_review",
    "Respond to a customer review",
    {
      reviewId: z.string().describe("The customer review ID"),
      responseBody: z.string().describe("Your response text"),
    },
    async ({ reviewId, responseBody }) => {
      await ascPost("/customerReviewResponses", {
        data: {
          type: "customerReviewResponses",
          attributes: {
            responseBody,
          },
          relationships: {
            review: {
              data: {
                type: "customerReviews",
                id: reviewId,
              },
            },
          },
        },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ message: "Response posted successfully" }, null, 2),
          },
        ],
      };
    }
  );
}

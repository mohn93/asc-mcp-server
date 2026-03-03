import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ascGet, type PaginatedResponse } from "../client/api-client.js";
import type { Certificate, Profile } from "../types/asc-api.js";

export function registerCertificatesTools(server: McpServer): void {
  server.tool(
    "list_certificates",
    "List signing certificates in your developer account",
    {
      filterCertificateType: z.string().optional()
        .describe("Filter by type (e.g. IOS_DISTRIBUTION, IOS_DEVELOPMENT, MAC_APP_DISTRIBUTION)"),
      limit: z.number().min(1).max(200).optional()
        .describe("Number of certificates to return (default 50)"),
    },
    async ({ filterCertificateType, limit }) => {
      const params: Record<string, string> = {
        "fields[certificates]": "name,certificateType,displayName,serialNumber,platform,expirationDate",
        limit: String(limit ?? 50),
      };

      if (filterCertificateType) params["filter[certificateType]"] = filterCertificateType;

      const response = await ascGet<PaginatedResponse<Certificate>>("/certificates", params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              certificates: response.data.map((c) => ({
                id: c.id,
                name: c.attributes.name,
                type: c.attributes.certificateType,
                displayName: c.attributes.displayName,
                serialNumber: c.attributes.serialNumber,
                platform: c.attributes.platform,
                expirationDate: c.attributes.expirationDate,
              })),
            }, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "list_profiles",
    "List provisioning profiles",
    {
      filterProfileType: z.string().optional()
        .describe("Filter by type (e.g. IOS_APP_STORE, IOS_APP_DEVELOPMENT)"),
      filterProfileState: z.enum(["ACTIVE", "INVALID"]).optional()
        .describe("Filter by state"),
      limit: z.number().min(1).max(200).optional()
        .describe("Number of profiles to return (default 50)"),
    },
    async ({ filterProfileType, filterProfileState, limit }) => {
      const params: Record<string, string> = {
        "fields[profiles]": "name,platform,profileType,profileState,uuid,createdDate,expirationDate",
        limit: String(limit ?? 50),
      };

      if (filterProfileType) params["filter[profileType]"] = filterProfileType;
      if (filterProfileState) params["filter[profileState]"] = filterProfileState;

      const response = await ascGet<PaginatedResponse<Profile>>("/profiles", params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              profiles: response.data.map((p) => ({
                id: p.id,
                name: p.attributes.name,
                platform: p.attributes.platform,
                type: p.attributes.profileType,
                state: p.attributes.profileState,
                uuid: p.attributes.uuid,
                createdDate: p.attributes.createdDate,
                expirationDate: p.attributes.expirationDate,
              })),
            }, null, 2),
          },
        ],
      };
    }
  );
}

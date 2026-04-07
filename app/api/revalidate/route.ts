/**
 * On-demand cache revalidation API endpoint
 * Allows manual cache invalidation for specific pages or tags
 * Useful for content updates and emergency cache clearing
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { cacheInvalidation, cacheMonitoring, CACHE_TAGS } from "@/lib/cache";

// Simple API key for security (in production, use proper auth)
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || "dev-secret";

export async function POST(request: NextRequest) {
  try {
    // Simple authentication check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.includes(`Bearer ${REVALIDATION_SECRET}`)) {
      return NextResponse.json(
        { 
          ok: false, 
          error: "Unauthorized" 
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { 
          ok: false, 
          error: "Invalid request body" 
        },
        { status: 400 }
      );
    }

    const { type, path, tag, tags } = body;

    // Validate request parameters
    if (!type || !["path", "tag", "tags", "all"].includes(type)) {
      return NextResponse.json(
        { 
          ok: false, 
          error: "Invalid type. Must be 'path', 'tag', 'tags', or 'all'" 
        },
        { status: 400 }
      );
    }

    let invalidatedItems: string[] = [];

    switch (type) {
      case "path":
        if (!path || typeof path !== "string") {
          return NextResponse.json(
            { 
              ok: false, 
              error: "Path is required for path-based revalidation" 
            },
            { status: 400 }
          );
        }
        
        cacheInvalidation.byPath(path);
        cacheMonitoring.logCacheOperation("manual-path-revalidation", undefined, path);
        invalidatedItems = [path];
        break;

      case "tag":
        if (!tag || typeof tag !== "string") {
          return NextResponse.json(
            { 
              ok: false, 
              error: "Tag is required for tag-based revalidation" 
            },
            { status: 400 }
          );
        }
        
        cacheInvalidation.byTag(tag);
        cacheMonitoring.logCacheOperation("manual-tag-revalidation", tag);
        invalidatedItems = [tag];
        break;

      case "tags":
        if (!Array.isArray(tags) || tags.length === 0) {
          return NextResponse.json(
            { 
              ok: false, 
              error: "Tags array is required for tags-based revalidation" 
            },
            { status: 400 }
          );
        }
        
        cacheInvalidation.byTags(tags);
        cacheMonitoring.logCacheOperation("manual-tags-revalidation", undefined, undefined);
        invalidatedItems = tags;
        break;

      case "all":
        cacheInvalidation.invalidateAllPages();
        cacheMonitoring.logCacheOperation("manual-all-revalidation", undefined, undefined);
        invalidatedItems = Object.values(CACHE_TAGS);
        break;

      default:
        return NextResponse.json(
          { 
            ok: false, 
            error: "Unsupported revalidation type" 
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      ok: true,
      message: "Cache revalidation triggered successfully",
      invalidated: invalidatedItems,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Revalidation API error:", error);
    return NextResponse.json(
      { 
        ok: false, 
        error: "Internal server error during revalidation" 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for checking revalidation status (development only)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { 
        ok: false, 
        error: "This endpoint is only available in development" 
      },
      { status: 403 }
    );
  }

  // Simple authentication check
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.includes(`Bearer ${REVALIDATION_SECRET}`)) {
    return NextResponse.json(
      { 
        ok: false, 
        error: "Unauthorized" 
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Revalidation API is active",
    availableTags: Object.values(CACHE_TAGS),
    usage: {
      path: "POST with { type: 'path', path: '/about' }",
      tag: "POST with { type: 'tag', tag: 'homepage' }",
      tags: "POST with { type: 'tags', tags: ['homepage', 'about'] }",
      all: "POST with { type: 'all' }",
    },
    timestamp: new Date().toISOString(),
  });
}

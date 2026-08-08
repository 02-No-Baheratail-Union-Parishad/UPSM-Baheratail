// ============================================================
// upsm-baheratail — Full-featured Cloudflare Worker with KV, R2, and D1
// ============================================================

export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path.startsWith("/api")) {
        return await handleApi(request, env, path, method, corsHeaders);
      }
      return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not Found", { status: 404 });
    } catch (err: any) {
      return jsonResponse(
        { error: "Internal Server Error", message: err.message },
        500,
        corsHeaders
      );
    }
  },
};

async function handleApi(request: Request, env: any, path: string, method: string, corsHeaders: Record<string, string>) {
  // --- D1: Users ---
  if (path === "/api/users" && method === "GET") {
    const result = await env.MY_DB.prepare("SELECT * FROM users ORDER BY created_at DESC").all();
    return jsonResponse({ users: result.results }, 200, corsHeaders);
  }

  if (path === "/api/users" && method === "POST") {
    const body: any = await request.json();
    const { name, email } = body;
    if (!name || !email) {
      return jsonResponse({ error: "name and email are required" }, 400, corsHeaders);
    }
    const result = await env.MY_DB
      .prepare("INSERT INTO users (name, email) VALUES (?, ?) RETURNING *")
      .bind(name, email)
      .first();
    return jsonResponse({ user: result }, 201, corsHeaders);
  }

  if (path === "/api/users" && method === "DELETE") {
    const userId = new URL(request.url).searchParams.get("id");
    if (!userId) return jsonResponse({ error: "id parameter required" }, 400, corsHeaders);
    await env.MY_DB.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();
    return jsonResponse({ success: true }, 200, corsHeaders);
  }

  // --- D1: Posts ---
  if (path === "/api/posts" && method === "GET") {
    const result = await env.MY_DB.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
    return jsonResponse({ posts: result.results }, 200, corsHeaders);
  }

  if (path === "/api/posts" && method === "POST") {
    const body: any = await request.json();
    const { title, content } = body;
    if (!title) return jsonResponse({ error: "title is required" }, 400, corsHeaders);
    const result = await env.MY_DB
      .prepare("INSERT INTO posts (title, content) VALUES (?, ?) RETURNING *")
      .bind(title, content || "")
      .first();
    return jsonResponse({ post: result }, 201, corsHeaders);
  }

  // --- KV: Session / Config ---
  if (path === "/api/kv" && method === "GET") {
    const key = new URL(request.url).searchParams.get("key");
    if (!key) return jsonResponse({ error: "key parameter required" }, 400, corsHeaders);
    const value = await env.MY_KV.get(key);
    return jsonResponse({ key, value }, 200, corsHeaders);
  }

  if (path === "/api/kv" && method === "POST") {
    const body: any = await request.json();
    const { key, value } = body;
    if (!key || value === undefined)
      return jsonResponse({ error: "key and value are required" }, 400, corsHeaders);
    await env.MY_KV.put(key, JSON.stringify(value));
    return jsonResponse({ success: true, key }, 201, corsHeaders);
  }

  // --- R2: File Upload ---
  if (path === "/api/upload" && method === "POST") {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return jsonResponse({ error: "file field required" }, 400, corsHeaders);

    const fileName = `${Date.now()}-${file.name}`;
    await env.MY_BUCKET.put(fileName, file.stream(), {
      httpMetadata: { contentType: file.type },
    });
    return jsonResponse(
      { success: true, fileName, url: `/api/files/${fileName}` },
      201,
      corsHeaders
    );
  }

  // --- R2: File Download ---
  if (path.startsWith("/api/files/") && method === "GET") {
    const fileName = path.replace("/api/files/", "");
    const object = await env.MY_BUCKET.get(fileName);
    if (!object) return jsonResponse({ error: "File not found" }, 404, corsHeaders);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    return new Response(object.body, { headers });
  }

  // --- R2: List Files ---
  if (path === "/api/files" && method === "GET") {
    const listing = await env.MY_BUCKET.list();
    const files = listing.objects.map((obj: any) => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
    }));
    return jsonResponse({ files }, 200, corsHeaders);
  }

  // --- Health Check ---
  if (path === "/api/health") {
    return jsonResponse(
      {
        status: "ok",
        bindings: {
          kv: !!env.MY_KV,
          r2: !!env.MY_BUCKET,
          d1: !!env.MY_DB,
        },
      },
      200,
      corsHeaders
    );
  }

  return jsonResponse({ error: "API endpoint not found" }, 404, corsHeaders);
}

function jsonResponse(data: any, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

import { mkdir, unlink } from "node:fs/promises";

const STORAGE_DIR = "./documentos";

// Asegurar carpeta
try {
  await mkdir(STORAGE_DIR, { recursive: true });
} catch (e) {}

interface MarkdownRequest {
  title?: string;
  content: string;
}

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (method === "OPTIONS")
      return new Response("ok", { headers: corsHeaders });

    // --- [CREATE] POST /api/files ---
    if (url.pathname === "/api/files" && method === "POST") {
      const body = (await req.json()) as MarkdownRequest;
      const cleanTitle = (body.title || "sin-titulo")
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      const date = new Date().toISOString().split("T")[0];
      const fileName = `${cleanTitle}-${date}.md`;

      await Bun.write(`${STORAGE_DIR}/${fileName}`, body.content);
      return new Response(JSON.stringify({ message: "Creado", fileName }), {
        status: 201,
        headers: corsHeaders,
      });
    }

    // --- [READ LIST] GET /api/files ---
    if (url.pathname === "/api/files" && method === "GET") {
      const glob = new Bun.Glob("*.md");
      const files = [];
      for await (const file of glob.scan(STORAGE_DIR)) {
        files.push(file);
      }
      return new Response(JSON.stringify(files), { headers: corsHeaders });
    }

    // --- [READ SINGLE] GET /api/files/:name ---
    if (url.pathname.startsWith("/api/files/") && method === "GET") {
      const fileName = url.pathname.replace("/api/files/", "");
      const file = Bun.file(`${STORAGE_DIR}/${fileName}`);
      if (!(await file.exists()))
        return new Response("No existe", { status: 404, headers: corsHeaders });

      return new Response(file, {
        headers: { ...corsHeaders, "Content-Type": "text/markdown" },
      });
    }

    // --- [UPDATE] PUT /api/files/:name ---
    if (url.pathname.startsWith("/api/files/") && method === "PUT") {
      const fileName = url.pathname.replace("/api/files/", "");
      const body = (await req.json()) as MarkdownRequest;
      const file = Bun.file(`${STORAGE_DIR}/${fileName}`);

      if (!(await file.exists()))
        return new Response("No existe", { status: 404, headers: corsHeaders });

      await Bun.write(`${STORAGE_DIR}/${fileName}`, body.content);
      return new Response(JSON.stringify({ message: "Actualizado" }), {
        headers: corsHeaders,
      });
    }

    // --- [DELETE] DELETE /api/files/:name ---
    if (url.pathname.startsWith("/api/files/") && method === "DELETE") {
      const fileName = url.pathname.replace("/api/files/", "");
      const path = `${STORAGE_DIR}/${fileName}`;

      try {
        await unlink(path);
        return new Response(JSON.stringify({ message: "Eliminado" }), {
          headers: corsHeaders,
        });
      } catch (e) {
        return new Response("No se pudo eliminar", {
          status: 404,
          headers: corsHeaders,
        });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
});

console.log(`🚀 CRUD MD listo en: ${server.port}`);

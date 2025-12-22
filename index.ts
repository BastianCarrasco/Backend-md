// 1. Definimos la ruta del archivo.
// TIP: Si usas Volúmenes en Railway, cambia esto a "/data/documento.md"
const FILE_PATH = "./documento.md";

interface MarkdownRequest {
  content: string;
}

// 2. Aseguramos que el archivo exista al arrancar
const initialFile = Bun.file(FILE_PATH);
if (!(await initialFile.exists())) {
  await Bun.write(FILE_PATH, "# Archivo Inicial\nBienvenido al editor.");
}

// 3. Servidor con Bun
const server = Bun.serve({
  // Railway inyecta el puerto automáticamente en la variable PORT
  port: process.env.PORT || 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;

    // Configuración de CORS completa
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // Permite peticiones de cualquier lugar (Vercel, Localhost, etc.)
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Responder a peticiones de pre-vuelo (Browser Pre-flight)
    if (method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    // RUTA GET: Retornar el contenido del archivo
    if (url.pathname === "/" && method === "GET") {
      const file = Bun.file(FILE_PATH);
      return new Response(file, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/markdown; charset=utf-8",
        },
      });
    }

    // RUTA POST: Editar el contenido del archivo
    if (url.pathname === "/api/md" && method === "POST") {
      try {
        const body = (await req.json()) as MarkdownRequest;

        if (!body || typeof body.content !== "string") {
          return new Response(JSON.stringify({ error: "Formato inválido" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Escritura atómica ultra rápida de Bun
        await Bun.write(FILE_PATH, body.content);

        return new Response(
          JSON.stringify({ message: "Guardado correctamente" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Error procesando el archivo" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // 404 para cualquier otra ruta
    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
});

console.log(`🚀 Servidor listo en el puerto: ${server.port}`);

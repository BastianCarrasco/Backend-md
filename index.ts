// 1. Definimos la ruta del archivo MD
const FILE_PATH = "./documento.md";

// Interfaz para definir la estructura de los datos que recibiremos (POST)
interface MarkdownRequest {
  content: string;
}

// 2. Verificamos/Creamos el archivo al iniciar
const initialFile = Bun.file(FILE_PATH);
if (!(await initialFile.exists())) {
  await Bun.write(FILE_PATH, "# Archivo Inicial\nBienvenido al editor MD.");
  console.log("📝 Archivo documento.md creado con éxito.");
}

// 3. Iniciamos el servidor
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;

    // Configuración de CORS
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Manejar pre-flight de CORS (Importante para navegadores)
    if (method === "OPTIONS") {
      return new Response("ok", { headers });
    }

    // RUTA PARA OBTENER EL CONTENIDO (GET)
    if (url.pathname === "/api/md" && method === "GET") {
      const file = Bun.file(FILE_PATH);
      return new Response(file, { headers });
    }

    // RUTA PARA GUARDAR EL CONTENIDO (POST)
    if (url.pathname === "/api/md" && method === "POST") {
      try {
        // Leemos el JSON y le decimos a TS que tiene el formato de la interfaz
        const body = (await req.json()) as MarkdownRequest;

        if (!body || typeof body.content !== "string") {
          return new Response(
            JSON.stringify({ error: "Contenido inválido o vacío" }),
            {
              status: 400,
              headers: { ...headers, "Content-Type": "application/json" },
            }
          );
        }

        // Escribimos el contenido en el archivo físico
        await Bun.write(FILE_PATH, body.content);

        return new Response(
          JSON.stringify({
            message: "Guardado correctamente",
            size: body.content.length,
          }),
          {
            headers: { ...headers, "Content-Type": "application/json" },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            error: "El cuerpo de la petición no es un JSON válido",
          }),
          {
            status: 400,
            headers: { ...headers, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Ruta no encontrada
    return new Response("Ruta no encontrada", {
      status: 404,
      headers,
    });
  },
});

console.log(`🚀 Backend corriendo en http://localhost:${server.port}`);

# 📅 Horario Codelco 2026 - Grupo 4

Aplicación web para visualizar el sistema de turnos **4x4** del Sindicato Caletones (Codelco Chile División El Teniente) correspondiente al año 2026.

## 🚀 Funcionalidades

- **Cálculo Automático:** Genera el calendario de turnos para cualquier mes del año.
- **Patrón Grupo 4:** Ciclo exacto de 16 días (4 Noches, 4 Libres, 4 Días, 4 Libres).
- **Diseño Responsivo:** Optimizado para su uso en teléfonos móviles y computadoras.
- **Indicador Actual:** Resalta automáticamente el día actual con un borde rojo.

## 🛠️ Tecnologías Utilizadas

- [Vue.js 3](https://vuejs.org/) (Framework)
- [Vite](https://vitejs.dev/) (Entorno de desarrollo)
- CSS3 (Flexbox y Grid para la matriz)

## 📁 Estructura del Proyecto

- `src/utils/calendarLogic.js`: Motor de cálculo de turnos.
- `src/constants/calendar.js`: Nombres de meses y días.
- `src/App.vue`: Interfaz y diseño principal.

## 📦 Instalación y Uso

1. Instalar dependencias: `npm install`
2. Ejecutar en desarrollo: `npm run dev`
3. Construir para producción: `npm run build`

---

_Desarrollado para facilitar la consulta de turnos del personal._

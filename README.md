# ELECTRO GROUP — Sistema de Presupuestos & Catálogo de Materiales Eléctricos

Sistema web integral de presupuestación, gestión de clientes y catálogo de materiales eléctricos con **actualización automática de precios según la cotización del dólar (ARS / USD)** y sincronización en la nube con **Neon PostgreSQL**.

Diseñado y adaptado a la identidad visual de **ELECTRO GROUP — Tableros Realistas**.

---

## ⚡ Características Principales

1. **Gestión de Clientes (`/clientes`)**:
   - Agenda completa de contactos (Nombre, Empresa, CUIT/DNI, Teléfono, WhatsApp, Email, Dirección, Ciudad).
   - Acceso directo a envío por WhatsApp (`wa.me`).
   - Historial de presupuestos por cliente.

2. **Catálogo de Materiales Eléctricos con Dólar Dinámico (`/materiales`)**:
   - Catálogo precargado con más de 40 materiales normalizados según normas IRAM (Cables, Termomagnéticas Schneider/Sica, Disyuntores diferenciales, Jabalina con tomacable, Tableros DIN, Cañerías ignífugas, etc.).
   - **Actualización Inmediata por Dólar**: Al cambiar el valor del dólar (o pulsar "Traer Blue" en vivo), todos los precios en pesos (ARS) de todos los materiales se recalculan automáticamente en tiempo real: `Precio ARS = Precio USD × Cotización Dólar`.
   - Permite agregar nuevos materiales, editar marcas, unidades (metro, unidad, rollo, pack) y códigos SKU.

3. **Presupuestador por Obra / Trabajo (`/presupuestos/nuevo` y `/presupuestos/[id]`)**:
   - Selección rápida de materiales desde el catálogo con autocompletado y cantidad requerida.
   - Detalle de mano de obra y tareas (horas, bocas, global).
   - Cotización del dólar fijada para cada presupuesto (los presupuestos antiguos mantienen el dólar de cuando se emitieron o pueden recalcularse).
   - Cálculo automático de subtotales, descuentos e IVA.
   - **Generación y Descarga de PDF Oficial** con encabezado institucional, logo, colores corporativos (`#EAB308`), tablas de materiales y mano de obra, validez de 15 días y firmas.
   - **Lista de Compras de Materiales**: Vista rápida imprimible solo con los materiales y cantidades necesarias para llevar a la distribuidora o corralón eléctrico.
   - Compartir directo por **WhatsApp** al cliente con el resumen y monto total.
   - Duplicar presupuestos en 1 click ("Duplicar").

4. **Identidad y Configuración (`/configuracion`)**:
   - Configuración de datos de la empresa: **ELECTRO GROUP**, Titular: **Pedro Espinosa Molina**, CUIT: **20-30405060-7**, Teléfono: **3512477860**.
   - Carga de logo corporativo y selección de color de marca (`#EAB308`).
   - Cotización del dólar por defecto y notas de pie de página para los PDFs.

---

## 🚀 Despliegue en Vercel

Este proyecto está 100% optimizado para desplegarse en [Vercel](https://vercel.com):

1. **Importar el repositorio en Vercel**:
   - URL del repositorio: `https://github.com/Eddu33/elctrogrup.git`
   - Framework Preset: `Next.js`

2. **Variables de Entorno (Environment Variables)**:
   En la pantalla de configuración de Vercel (o en `Settings > Environment Variables`), agregar:
   - **`DATABASE_URL`**:
     ```
     postgresql://neondb_owner:npg_AfHSCtgN8K2P@ep-tiny-term-belz8zs8-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
     ```
   - **`NEXT_PUBLIC_APP_NAME`**: `ELECTRO GROUP`

3. **Deploy**:
   - Presionar **Deploy**. Vercel ejecutará automáticamente `prisma generate` y compilará la aplicación en producción.

---

## 🛠️ Ejecución Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Eddu33/elctrogrup.git
   cd elctrogrup
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Sincronizar la base de datos de Neon (si no estuviese sincronizada):
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

Desarrollado para **ELECTRO GROUP — Tableros Realistas**.

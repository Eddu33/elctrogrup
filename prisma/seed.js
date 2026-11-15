const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Company Settings (Matching Screenshot 2)
  const settings = await prisma.companySettings.upsert({
    where: { id: 'default' },
    update: {
      companyName: 'ELECTRO GROUP',
      ownerName: 'Pedro Espinosa Molina',
      cuitDni: '20-30405060-7',
      phone: '3512477860',
      email: 'contacto@electrogroup.com.ar',
      address: 'Córdoba, Argentina',
      brandColor: '#EAB308',
      dollarRate: 1250,
      dollarSource: 'blue',
      pdfHeaderNotes: 'Presupuesto oficial emitido por ELECTRO GROUP - Tableros Realistas',
      pdfFooterNotes: 'Validez de la oferta: 15 días corridos. Precios expresados en Pesos Argentinos (ARS) convertidos a valor dólar del día.',
    },
    create: {
      id: 'default',
      companyName: 'ELECTRO GROUP',
      ownerName: 'Pedro Espinosa Molina',
      cuitDni: '20-30405060-7',
      phone: '3512477860',
      email: 'contacto@electrogroup.com.ar',
      address: 'Córdoba, Argentina',
      brandColor: '#EAB308',
      dollarRate: 1250,
      dollarSource: 'blue',
      pdfHeaderNotes: 'Presupuesto oficial emitido por ELECTRO GROUP - Tableros Realistas',
      pdfFooterNotes: 'Validez de la oferta: 15 días corridos. Precios expresados en Pesos Argentinos (ARS) convertidos a valor dólar del día.',
    },
  });
  console.log('✅ Company settings configured:', settings.companyName);

  // 2. Client: Leonardo Fenoglio (Matching Screenshot 1 & 3)
  const clientLeonardo = await prisma.client.create({
    data: {
      name: 'Leonardo Fenoglio',
      company: 'Residencial Fenoglio',
      cuitDni: '20-29876543-8',
      phone: '3515984321',
      email: 'leonardo.fenoglio@gmail.com',
      address: 'Av. Rafael Núñez 4200',
      city: 'Córdoba',
      notes: 'Cliente particular. Requiere chequeo general de seguridad y adecuación de protecciones en tablero.',
    },
  });

  const clientMartin = await prisma.client.create({
    data: {
      name: 'Ing. Martín Balbastro',
      company: 'Industrias Mediterráneas SRL',
      cuitDni: '30-71458923-4',
      phone: '3514789652',
      email: 'mbalbastro@indmediterraneas.com.ar',
      address: 'Zona Franca Nave 4',
      city: 'Córdoba',
      notes: 'Planta fabril. Instalación trifásica y puesta a tierra certificada.',
    },
  });

  const clientCarolina = await prisma.client.create({
    data: {
      name: 'Dra. Carolina Méndez',
      company: 'Consultorios Médicos Centro',
      cuitDni: '27-33124567-2',
      phone: '3513698521',
      email: 'dra.mendez@consultorioscentro.com',
      address: 'Chacabuco 650 Piso 3',
      city: 'Córdoba',
      notes: 'Renovación integral de iluminación y tomas para aparatología médica.',
    },
  });
  console.log('✅ Sample clients created');

  // 3. Electrical Materials Catalog (with USD and calculated ARS at $1250)
  const dollar = 1250;
  const initialMaterials = [
    // Cables
    { code: 'CAB-150', name: 'Cable Unipolar 1.5 mm² Normalizado IRAM 2183 (Rollo 100m)', category: 'Cables', unit: 'rollo', priceUSD: 34.0, brand: 'Prysmian / Fonseca' },
    { code: 'CAB-250', name: 'Cable Unipolar 2.5 mm² Normalizado IRAM 2183 (Rollo 100m)', category: 'Cables', unit: 'rollo', priceUSD: 49.5, brand: 'Prysmian / Fonseca' },
    { code: 'CAB-400', name: 'Cable Unipolar 4.0 mm² Normalizado IRAM 2183 (Rollo 100m)', category: 'Cables', unit: 'rollo', priceUSD: 78.0, brand: 'Prysmian / Fonseca' },
    { code: 'CAB-600', name: 'Cable Unipolar 6.0 mm² Normalizado IRAM 2183 (Rollo 100m)', category: 'Cables', unit: 'rollo', priceUSD: 115.0, brand: 'Prysmian' },
    { code: 'CAB-100', name: 'Cable Unipolar 10 mm² Normalizado IRAM 2183 (metro)', category: 'Cables', unit: 'metro', priceUSD: 2.1, brand: 'Prysmian' },
    { code: 'CAB-STX-24', name: 'Cable Subterráneo Sintenax 2x4 mm² Cobre (metro)', category: 'Cables', unit: 'metro', priceUSD: 3.9, brand: 'Prysmian' },
    { code: 'CAB-STX-44', name: 'Cable Subterráneo Sintenax 4x4 mm² Cobre (metro)', category: 'Cables', unit: 'metro', priceUSD: 7.2, brand: 'Prysmian' },
    { code: 'CAB-TPR-325', name: 'Cable Tipo Taller TPR 3x2.5 mm² flexible (metro)', category: 'Cables', unit: 'metro', priceUSD: 2.3, brand: 'Kalop' },

    // Protecciones Eléctricas
    { code: 'PRO-TM-16', name: 'Interruptor Termomagnético Bipolar 16A Curva C', category: 'Protecciones', unit: 'unidad', priceUSD: 8.5, brand: 'Schneider Acti9 / Sica' },
    { code: 'PRO-TM-20', name: 'Interruptor Termomagnético Bipolar 20A Curva C', category: 'Protecciones', unit: 'unidad', priceUSD: 8.5, brand: 'Schneider Acti9 / Sica' },
    { code: 'PRO-TM-25', name: 'Interruptor Termomagnético Bipolar 25A Curva C', category: 'Protecciones', unit: 'unidad', priceUSD: 9.0, brand: 'Schneider Acti9 / Sica' },
    { code: 'PRO-TM-32', name: 'Interruptor Termomagnético Bipolar 32A Curva C', category: 'Protecciones', unit: 'unidad', priceUSD: 9.5, brand: 'Schneider Acti9 / Sica' },
    { code: 'PRO-TM-432', name: 'Interruptor Termomagnético Tetrapolar 32A Curva C', category: 'Protecciones', unit: 'unidad', priceUSD: 26.0, brand: 'Schneider' },
    { code: 'PRO-DD-225', name: 'Disyuntor Diferencial Bipolar 25A / 30mA Sensibilidad', category: 'Protecciones', unit: 'unidad', priceUSD: 28.0, brand: 'Schneider / Sica' },
    { code: 'PRO-DD-240', name: 'Disyuntor Diferencial Bipolar 40A / 30mA Sensibilidad', category: 'Protecciones', unit: 'unidad', priceUSD: 31.0, brand: 'Schneider' },
    { code: 'PRO-DD-440', name: 'Disyuntor Diferencial Tetrapolar 40A / 30mA Sensibilidad', category: 'Protecciones', unit: 'unidad', priceUSD: 58.0, brand: 'Schneider' },
    { code: 'PRO-PROT-TEN', name: 'Protector Automático de Alta y Baja Tensión DIN monofásico', category: 'Protecciones', unit: 'unidad', priceUSD: 19.5, brand: 'RBC / BAW' },

    // Tableros
    { code: 'TAB-DIN-04', name: 'Caja Tablero DIN Embutir 4 Bocas PVC Blanco', category: 'Tableros', unit: 'unidad', priceUSD: 6.2, brand: 'Genrod / Gabexel' },
    { code: 'TAB-DIN-08', name: 'Caja Tablero DIN Embutir 8 Bocas PVC Puerta Fumé', category: 'Tableros', unit: 'unidad', priceUSD: 11.5, brand: 'Genrod' },
    { code: 'TAB-DIN-12', name: 'Caja Tablero DIN Embutir 12 Bocas PVC Puerta Fumé', category: 'Tableros', unit: 'unidad', priceUSD: 17.0, brand: 'Genrod' },
    { code: 'TAB-DIN-24', name: 'Caja Tablero DIN Embutir 24 Bocas (2x12) Puerta Fumé', category: 'Tableros', unit: 'unidad', priceUSD: 29.0, brand: 'Genrod' },
    { code: 'TAB-MET-3040', name: 'Gabinete Metálico Estanco IP65 300x400x200 con Contrafrente', category: 'Tableros', unit: 'unidad', priceUSD: 52.0, brand: 'Gabexel' },

    // Puesta a Tierra
    { code: 'PAT-JAB-15', name: 'Jabalina Cobre-Acero 1.5m 1/2" Normalizada IRAM 2309', category: 'Puesta a Tierra', unit: 'unidad', priceUSD: 14.5, brand: 'FacBSA' },
    { code: 'PAT-MOR-12', name: 'Tomacable / Morseto Bronce para Jabalina 1/2"', category: 'Puesta a Tierra', unit: 'unidad', priceUSD: 3.5, brand: 'FacBSA' },
    { code: 'PAT-CAJ-INSP', name: 'Caja de Inspección para Puesta a Tierra PVC C/Tapa', category: 'Puesta a Tierra', unit: 'unidad', priceUSD: 4.5, brand: 'Genrod' },

    // Cañerías y Cajas
    { code: 'CAN-COR-34', name: 'Caño Corrugado Ignífugo Blanco 3/4" (Rollo 25m)', category: 'Cañerías y Cajas', unit: 'rollo', priceUSD: 9.8, brand: 'Tubomax' },
    { code: 'CAN-COR-78', name: 'Caño Corrugado Ignífugo Blanco 7/8" (Rollo 25m)', category: 'Cañerías y Cajas', unit: 'rollo', priceUSD: 12.5, brand: 'Tubomax' },
    { code: 'CAJ-OCT-CH', name: 'Caja Octogonal Chica Chapa Estampada 18', category: 'Cañerías y Cajas', unit: 'unidad', priceUSD: 0.95, brand: 'Chapa Pesada' },
    { code: 'CAJ-REC-510', name: 'Caja Rectangular 5x10 Chapa Estampada 18', category: 'Cañerías y Cajas', unit: 'unidad', priceUSD: 0.90, brand: 'Chapa Pesada' },
    { code: 'CAJ-CUA-1010', name: 'Caja Cuadrada 10x10 Chapa Estampada de Paso', category: 'Cañerías y Cajas', unit: 'unidad', priceUSD: 1.90, brand: 'Chapa Pesada' },
    { code: 'ACC-CON-34', name: 'Conectores PVC para Caño Corrugado 3/4" (Bolsa x 10)', category: 'Cañerías y Cajas', unit: 'pack', priceUSD: 2.8, brand: 'Genrod' },

    // Módulos, Bastidores y Llaves
    { code: 'MOD-TOM-10A', name: 'Módulo Tomacorriente Bipolar con Toma Tierra 10A', category: 'Módulos y Teclas', unit: 'unidad', priceUSD: 1.5, brand: 'Jeluz / Kalop' },
    { code: 'MOD-TOM-20A', name: 'Módulo Tomacorriente 20A Reforzado para Aire Acondicionado', category: 'Módulos y Teclas', unit: 'unidad', priceUSD: 2.6, brand: 'Jeluz / Kalop' },
    { code: 'MOD-INT-PTO', name: 'Módulo Llave Interruptor de Punto 10A', category: 'Módulos y Teclas', unit: 'unidad', priceUSD: 1.4, brand: 'Jeluz / Kalop' },
    { code: 'MOD-INT-COM', name: 'Módulo Llave de Combinación 10A', category: 'Módulos y Teclas', unit: 'unidad', priceUSD: 1.8, brand: 'Jeluz / Kalop' },
    { code: 'MOD-BAS-TAP', name: 'Bastidor y Tapa Rectangular 5x10 Completa', category: 'Módulos y Teclas', unit: 'unidad', priceUSD: 1.3, brand: 'Jeluz Platinum / Kalop' },

    // Insumos e Iluminación
    { code: 'INS-CIN-3M', name: 'Cinta Aisladora PVC 3M Temflex 1700 20 metros', category: 'Insumos', unit: 'unidad', priceUSD: 2.4, brand: '3M' },
    { code: 'INS-BOR-UNI', name: 'Bornera Repartidora Unipolar Escalonada DIN', category: 'Insumos', unit: 'unidad', priceUSD: 8.5, brand: 'Zoloda' },
    { code: 'INS-TAR-06', name: 'Tarugos SX Fischer 6mm con Tornillo Fix (Caja x 100)', category: 'Insumos', unit: 'pack', priceUSD: 5.2, brand: 'Fischer' },
    { code: 'ILU-PAN-18W', name: 'Panel Plafón LED Embutir/Aplicar 18W Luz Cálida/Fría', category: 'Iluminación', unit: 'unidad', priceUSD: 7.9, brand: 'Macroled' },
  ];

  for (const item of initialMaterials) {
    const priceARS = Math.round(item.priceUSD * dollar);
    await prisma.material.create({
      data: {
        code: item.code,
        name: item.name,
        category: item.category,
        unit: item.unit,
        priceUSD: item.priceUSD,
        priceARS: priceARS,
        brand: item.brand,
      },
    });
  }
  console.log(`✅ ${initialMaterials.length} electrical materials seeded successfully!`);

  // 4. Sample Presupuesto: "chequeo de seguridad eléctrica" (Matching Screenshot 1 & 3: $61.760)
  const presupuesto1 = await prisma.presupuesto.create({
    data: {
      number: 1001,
      title: 'chequeo de seguridad eléctrica',
      obra: 'Sin obra',
      status: 'Borrador',
      date: new Date('2026-11-09T10:00:00Z'),
      validityDays: 15,
      dollarRate: 1250,
      clientId: clientLeonardo.id,
      clientName: clientLeonardo.name,
      notes: 'Chequeo integral del cuadro seccional, medición de resistencia de puesta a tierra y verificación de accionamiento diferencial.',
      terms: 'Presupuesto con precios de referencia al valor del dólar actual. No incluye rotura de mampostería ni pintura.',
      subtotalMaterials: 26760,
      subtotalLabor: 35000,
      discountPercent: 0,
      taxPercent: 0,
      total: 61760, // Exactly $61.760 as in the user screenshot!
      materials: {
        create: [
          {
            name: 'Interruptor Termomagnético Bipolar 20A Curva C',
            category: 'Protecciones',
            unit: 'unidad',
            quantity: 1,
            unitPriceUSD: 8.5,
            unitPriceARS: 10625,
            subtotalARS: 10625,
            notes: 'Reemplazo de térmica desgastada',
          },
          {
            name: 'Tomacable / Morseto Bronce para Jabalina 1/2"',
            category: 'Puesta a Tierra',
            unit: 'unidad',
            quantity: 1,
            unitPriceUSD: 3.5,
            unitPriceARS: 4375,
            subtotalARS: 4375,
            notes: 'Ajuste y reposición borne jabalina',
          },
          {
            name: 'Cinta Aisladora PVC 3M Temflex 1700 20 metros',
            category: 'Insumos',
            unit: 'unidad',
            quantity: 2,
            unitPriceUSD: 2.4,
            unitPriceARS: 3000,
            subtotalARS: 6000,
            notes: 'Aislación de empalmes en caja de paso',
          },
          {
            name: 'Módulo Tomacorriente Bipolar con Toma Tierra 10A',
            category: 'Módulos y Teclas',
            unit: 'unidad',
            quantity: 3,
            unitPriceUSD: 1.5,
            unitPriceARS: 1920,
            subtotalARS: 5760,
            notes: 'Cambio de módulos deteriorados en cocina',
          },
        ],
      },
      labors: {
        create: [
          {
            description: 'Inspección de continuidad, medición puesta a tierra y testeo de disyuntor',
            quantity: 1,
            unit: 'global',
            unitPrice: 20000,
            subtotal: 20000,
          },
          {
            description: 'Reacondicionamiento de peinado y borneras en tablero seccional',
            quantity: 1,
            unit: 'global',
            unitPrice: 15000,
            subtotal: 15000,
          },
        ],
      },
    },
  });
  console.log(`✅ Sample quote "${presupuesto1.title}" created with total ARS ${presupuesto1.total}`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

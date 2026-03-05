const fs = require('fs');
const path = require('path');

// ============================================
// 1. DATA ESTATICA PARA CATALOGO GENERAL
// ============================================

const catalogoGeneral = [
    // Tipos de Documento
    { grupo: 'TIPO_DOC', codigo: 'DNI', valor: 'DNI', descripcion: 'Documento Nacional de Identidad' },
    { grupo: 'TIPO_DOC', codigo: 'CE', valor: 'CE', descripcion: 'Carné de Extranjería' },
    { grupo: 'TIPO_DOC', codigo: 'PASAPORTE', valor: 'Pasaporte', descripcion: 'Pasaporte' },

    // Estados de Pedido
    { grupo: 'ESTADO_PEDIDO', codigo: 'PAGO_PENDIENTE', valor: 'Pago pendiente (Generado)', descripcion: 'El pedido fue registrado, esperando pago' },
    { grupo: 'ESTADO_PEDIDO', codigo: 'PAGO_ENVIADO', valor: 'Voucher Enviado (Validar Pago)', descripcion: 'El voucher del pedido está en validación' },
    { grupo: 'ESTADO_PEDIDO', codigo: 'PAGO_VERIFICADO', valor: 'Pago Verificado (Falta Empaquetar)', descripcion: 'El pago ha sido validado' },
    { grupo: 'ESTADO_PEDIDO', codigo: 'EMPAQUETADO', valor: 'Empaquetado (Falta Enviar)', descripcion: 'El pedido está listo para recojo o envío' },
    { grupo: 'ESTADO_PEDIDO', codigo: 'ENVIADO', valor: 'Enviado (En camino)', descripcion: 'El paquete se encuentra en ruta' },
    { grupo: 'ESTADO_PEDIDO', codigo: 'ENTREGADO', valor: 'Entregados (Completados)', descripcion: 'El pedido fue entregado exitosamente' },
    { grupo: 'ESTADO_PEDIDO', codigo: 'PAGO_RECHAZADO', valor: 'Rechazados', descripcion: 'El pago fue rechazado' },

    // Monedas
    { grupo: 'MONEDA', codigo: 'PEN', valor: 'Soles (S/)', descripcion: 'Moneda nacional del Perú' },
    { grupo: 'MONEDA', codigo: 'USD', valor: 'Dólares ($)', descripcion: 'Dólar estadounidense' },

    // Categorias de Cuento
    { grupo: 'CATEGORIA_CUENTO', codigo: 'CAT_AVENTURA', valor: 'Aventura', descripcion: 'Cuentos de aventura para niños' },
    { grupo: 'CATEGORIA_CUENTO', codigo: 'CAT_DIDACTICO', valor: 'Didáctico', descripcion: 'Cuentos para aprendizaje y refuerzo' },
    { grupo: 'CATEGORIA_CUENTO', codigo: 'CAT_CLASICO', valor: 'Clásico', descripcion: 'Historias y fábulas populares' },

    // Rangos de Edad
    { grupo: 'RANGO_EDAD', codigo: 'EDAD_0_3', valor: '0-3 años', descripcion: 'Para niños de 0 a 3 años' },
    { grupo: 'RANGO_EDAD', codigo: 'EDAD_4_6', valor: '4-6 años', descripcion: 'Para niños de 4 a 6 años' },
    { grupo: 'RANGO_EDAD', codigo: 'EDAD_7_10', valor: '7-10 años', descripcion: 'Para niños de 7 a 10 años' },
];

// ============================================
// 2. PARSEO DEL UBIGEO DESDE EL HTML LOCAL
// ============================================

const html = fs.readFileSync('h:/Proyectos/Forjix/KillaCuentosWeb/cuentos-killa-FE/ubigeo_source.html', 'utf8');
const fontRegex = /<font[^>]*>(.*?)<\/font>/gis;
const allFonts = [];
let m;
while ((m = fontRegex.exec(html)) !== null) {
    const text = m[1].replace(/&nbsp;/gi, '').replace(/<[^>]*>/g, '').trim();
    if (text) allFonts.push(text);
}

let startIdx = 0;
for (let i = 0; i < allFonts.length; i++) {
    if (allFonts[i].trim().toUpperCase() === 'DEPARTAMENTO') {
        startIdx = i + 1;
        break;
    }
}

const deptosMap = new Map(); // nombre -> id
const provsMap = new Map();  // nombre|idDepto -> id
const distrosMap = new Map(); // nombre|idProv -> id

const toTitle = (s) => s.split(/\s+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

let deptoCounter = 1;
const provCounters = new Map(); // idDepto -> counter
const distCounters = new Map(); // idProv -> counter

for (let i = startIdx; i + 3 < allFonts.length; i += 4) {
    let distName = toTitle(allFonts[i + 1].trim());
    let provName = toTitle(allFonts[i + 2].trim());
    let deptoName = toTitle(allFonts[i + 3].trim());

    if (!deptosMap.has(deptoName)) {
        deptosMap.set(deptoName, String(deptoCounter++).padStart(2, '0'));
    }
    const idDepto = deptosMap.get(deptoName);

    const provKey = `${provName}|${idDepto}`;
    if (!provsMap.has(provKey)) {
        if (!provCounters.has(idDepto)) provCounters.set(idDepto, 1);
        const currentProvCounter = provCounters.get(idDepto);
        provsMap.set(provKey, idDepto + String(currentProvCounter).padStart(2, '0'));
        provCounters.set(idDepto, currentProvCounter + 1);
    }
    const idProv = provsMap.get(provKey);

    const distKey = `${distName}|${idProv}`;
    if (!distrosMap.has(distKey)) {
        if (!distCounters.has(idProv)) distCounters.set(idProv, 1);
        const currentDistCounter = distCounters.get(idProv);
        distrosMap.set(distKey, idProv + String(currentDistCounter).padStart(2, '0'));
        distCounters.set(idProv, currentDistCounter + 1);
    }
}

// ============================================
// 3. GENERACIÓN DEL SCRIPT DDL (CREATE TABLES) y DML (INSERTS)
// ============================================
let sql = `-- SCRIPT GENERADO PARA KILLA CUENTOS - MAESTROS Y UBIGEO\n\n`;

// a) Create Tables
sql += `-- ==========================================================\n`;
sql += `-- 1. DDL: ESTRUCTURA DE TABLAS MAESTRAS\n`;
sql += `-- ==========================================================\n\n`;

sql += `CREATE TABLE IF NOT EXISTS tabla_catalogo_general (
    id BIGSERIAL PRIMARY KEY,
    grupo_codigo VARCHAR(50) NOT NULL,
    codigo_maestro VARCHAR(50) NOT NULL UNIQUE,
    valor_mostrar VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255),
    estado BOOLEAN NOT NULL DEFAULT true
);\n\n`;

sql += `CREATE TABLE IF NOT EXISTS tabla_departamento (
    id_departamento VARCHAR(2) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);\n\n`;

sql += `CREATE TABLE IF NOT EXISTS tabla_provincia (
    id_provincia VARCHAR(4) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_departamento VARCHAR(2) NOT NULL REFERENCES tabla_departamento(id_departamento)
);\n\n`;

sql += `CREATE TABLE IF NOT EXISTS tabla_distrito (
    id_distrito VARCHAR(6) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_provincia VARCHAR(4) NOT NULL REFERENCES tabla_provincia(id_provincia)
);\n\n`;

// b) Generar inserts de Catalogo
sql += `-- ==========================================================\n`;
sql += `-- 2. INSERTS DE CATALOGO (MONEDAS, ESTADOS, DOCUMENTOS)\n`;
sql += `-- ==========================================================\n\n`;

for (let item of catalogoGeneral) {
    const safeDesc = item.descripcion.replace(/'/g, "''");
    sql += `INSERT INTO tabla_catalogo_general (grupo_codigo, codigo_maestro, valor_mostrar, descripcion, estado) `;
    sql += `VALUES ('${item.grupo}', '${item.codigo}', '${item.valor}', '${safeDesc}', true) `;
    sql += `ON CONFLICT (codigo_maestro) DO NOTHING;\n`;
}

sql += `\n-- ==========================================================\n`;
sql += `-- 3. INSERTS DE UBIGEO (DEPARTAMENTOS)\n`;
sql += `-- ==========================================================\n\n`;

for (let [nombre, id] of deptosMap.entries()) {
    sql += `INSERT INTO tabla_departamento (id_departamento, nombre) VALUES ('${id}', '${nombre}') ON CONFLICT DO NOTHING;\n`;
}

sql += `\n-- ==========================================================\n`;
sql += `-- 4. INSERTS DE UBIGEO (PROVINCIAS)\n`;
sql += `-- ==========================================================\n\n`;

for (let [key, id] of provsMap.entries()) {
    const [nombre, idDepto] = key.split('|');
    sql += `INSERT INTO tabla_provincia (id_provincia, nombre, id_departamento) VALUES ('${id}', '${nombre}', '${idDepto}') ON CONFLICT DO NOTHING;\n`;
}

sql += `\n-- ==========================================================\n`;
sql += `-- 5. INSERTS DE UBIGEO (DISTRITOS)\n`;
sql += `-- ==========================================================\n\n`;

for (let [key, id] of distrosMap.entries()) {
    const [nombre, idProv] = key.split('|');
    sql += `INSERT INTO tabla_distrito (id_distrito, nombre, id_provincia) VALUES ('${id}', '${nombre}', '${idProv}') ON CONFLICT DO NOTHING;\n`;
}

const outPath = 'h:/Proyectos/Cuentos de Killa/cuentos-killa-backend/script_iniciales_maestros.sql';
fs.writeFileSync(outPath, sql, 'utf8');

console.log(`Script SQL regenerado correctamente en: ${outPath}`);

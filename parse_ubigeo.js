// Script to extract department/province/district data from the INEI HTML table
// Font elements order: ..., "DISTRITO", "PROVINCIA", "DEPARTAMENTO", "1", "3 DE DICIEMBRE", "CHUPACA", "JUNIN", "2", ...
const fs = require('fs');
const html = fs.readFileSync('h:/Proyectos/Forjix/KillaCuentosWeb/cuentos-killa-FE/ubigeo_source.html', 'utf8');

const fontRegex = /<font[^>]*>(.*?)<\/font>/gis;
const allFonts = [];
let m;
while ((m = fontRegex.exec(html)) !== null) {
    const text = m[1].replace(/&nbsp;/gi, '').replace(/<[^>]*>/g, '').trim();
    if (text) allFonts.push(text);
}

// Data starts after the header row (DISTRITO, PROVINCIA, DEPARTAMENTO)
// Find the DEPARTAMENTO header
let startIdx = 0;
for (let i = 0; i < allFonts.length; i++) {
    if (allFonts[i].trim().toUpperCase() === 'DEPARTAMENTO') {
        startIdx = i + 1;
        break;
    }
}

console.log('Starting from index:', startIdx);
console.log(`Elements at start: [${allFonts[startIdx]}, ${allFonts[startIdx + 1]}, ${allFonts[startIdx + 2]}, ${allFonts[startIdx + 3]}]`);

const data = {};
let count = 0;

for (let i = startIdx; i + 3 < allFonts.length; i += 4) {
    const num = allFonts[i].trim();
    let dist = allFonts[i + 1].trim();
    let prov = allFonts[i + 2].trim();
    let dep = allFonts[i + 3].trim();

    if (!/^\d+$/.test(num)) continue;

    const toTitle = (s) => s.split(/\s+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    dep = toTitle(dep);
    prov = toTitle(prov);
    dist = toTitle(dist);

    if (!data[dep]) data[dep] = {};
    if (!data[dep][prov]) data[dep][prov] = [];
    if (!data[dep][prov].includes(dist)) {
        data[dep][prov].push(dist);
    }
    count++;
}

const deps = Object.keys(data).sort();
console.log('Total rows processed:', count);
console.log('Departments:', deps.length);
console.log('Departments:', deps.join(', '));

// Sort provinces and districts within each department
const sorted = {};
for (const dep of deps) {
    sorted[dep] = {};
    const provs = Object.keys(data[dep]).sort();
    for (const prov of provs) {
        sorted[dep][prov] = data[dep][prov].sort();
    }
}

fs.writeFileSync('h:/Proyectos/Forjix/KillaCuentosWeb/cuentos-killa-FE/src/assets/ubigeo.json', JSON.stringify(sorted, null, 2), 'utf8');
console.log('Written to ubigeo.json');

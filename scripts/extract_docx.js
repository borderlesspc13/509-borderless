const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function extractDocx(docxPath) {
    const filename = path.basename(docxPath, '.docx');
    const outDir = path.join(__dirname, '..', 'tmp', filename);
    const txtFile = path.join(__dirname, '..', 'tmp', `${filename}.txt`);
    
    try {
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }
        
        // Extract zip
        execSync(`tar -xf "${docxPath}" -C "${outDir}"`);
        
        // Read document.xml
        const xmlPath = path.join(outDir, 'word', 'document.xml');
        if (fs.existsSync(xmlPath)) {
            const xml = fs.readFileSync(xmlPath, 'utf8');
            // Very naive XML tag stripper, but enough to read text
            const text = xml.replace(/<\/w:p>/g, '\n').replace(/<[^>]+>/g, '');
            fs.writeFileSync(txtFile, text, 'utf8');
            console.log(`Extracted text to ${txtFile}`);
        } else {
            console.log(`No document.xml found in ${docxPath}`);
        }
    } catch (e) {
        console.error(`Error processing ${docxPath}:`, e.message);
    }
}

const files = [
    "D:/borderless/509-borderless/ANAMNESE FISIOTERAPIA MODELO EM BRANCO.docx",
    "D:/borderless/509-borderless/Anamnese Modelo Novo Terapia Ocupacional - MODELO 2026.docx",
    "D:/borderless/509-borderless/Modelo de Relatório Terapia Ocupacional - PARA EDIÇÃO.docx",
    "D:/borderless/509-borderless/Sistema Nurse Car Fisioterapeia.docx"
];

files.forEach(extractDocx);

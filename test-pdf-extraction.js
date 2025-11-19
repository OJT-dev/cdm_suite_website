const PDFParser = require('pdf2json');
const fs = require('fs');
const path = require('path');

async function testPdfExtraction(pdfPath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        let fullText = '';
        
        if (pdfData && pdfData.Pages) {
          for (const page of pdfData.Pages) {
            if (page.Texts) {
              for (const text of page.Texts) {
                if (text.R) {
                  for (const run of text.R) {
                    if (run.T) {
                      try {
                        fullText += decodeURIComponent(run.T) + ' ';
                      } catch (decodeError) {
                        // If URI is malformed, use raw text
                        fullText += (run.T || '').replace(/%[0-9A-F]{2}/g, '') + ' ';
                      }
                    }
                  }
                }
              }
              fullText += '\n\n';
            }
          }
        }
        
        console.log(`✓ Extracted ${pdfData.Pages?.length || 0} pages`);
        console.log(`✓ Text length: ${fullText.length} characters`);
        console.log(`✓ First 500 characters:\n${fullText.substring(0, 500)}\n`);
        
        resolve(fullText.trim());
      } catch (err) {
        reject(err);
      }
    });
    
    pdfParser.on('pdfParser_dataError', (err) => {
      reject(err);
    });
    
    pdfParser.loadPDF(pdfPath);
  });
}

async function main() {
  const testFiles = [
    '/home/ubuntu/Uploads/26-4159 Website Redesign (3).pdf',
    '/home/ubuntu/Uploads/Re_ Proposal for SMART Website Redesign (Control No. 26-4159).pdf'
  ];
  
  for (const file of testFiles) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing: ${path.basename(file)}`);
    console.log('='.repeat(80));
    
    try {
      await testPdfExtraction(file);
      console.log('✅ SUCCESS: PDF extraction worked!');
    } catch (error) {
      console.error('❌ FAILED:', error.message);
    }
  }
}

main();

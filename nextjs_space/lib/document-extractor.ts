
import mammoth from 'mammoth';
import PDFParser from 'pdf2json';
import * as v8 from 'v8';

export interface ExtractedDocument {
  name: string;
  content: string;
  type: 'pdf' | 'word' | 'text' | 'email' | 'unknown';
}

/**
 * Extract text content from PDF using pdf2json (pure JavaScript, serverless-compatible)
 * Implements aggressive warning suppression and memory management with dynamic timeout
 */
async function extractPdfText(arrayBuffer: ArrayBuffer, fileSizeMB: number = 0): Promise<string> {
  // Store original stream methods
  const originalStderrWrite = process.stderr.write;
  const originalStdoutWrite = process.stdout.write;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  // Calculate dynamic timeout based on file size
  // Base: 60s, add 15s per MB, max 240s (4 minutes)
  const baseTimeout = 60000; // 60 seconds
  const perMBTimeout = 15000; // 15 seconds per MB
  const maxTimeout = 240000; // 4 minutes max
  const calculatedTimeout = Math.min(baseTimeout + (fileSizeMB * perMBTimeout), maxTimeout);
  const timeoutSeconds = Math.round(calculatedTimeout / 1000);
  
  console.log(`PDF timeout: ${timeoutSeconds}s for ${fileSizeMB.toFixed(1)}MB file`);
  
  return new Promise((resolve, reject) => {
    try {
      // Suppress benign pdf2json warnings that go directly to stderr/stdout
      const suppressedPatterns = [
        /TT: undefined function/i,
        /TT: invalid function id/i,
        /TT: complementing a missing function/i,
        /Unsupported: field\.type of/i,
        /NOT valid form element/i,
        /Setting up fake worker/i,
        /Warning: TODO: graphic state operator SMask/i,
        /Warning: to be implemented: contextPrototype\.clearRect/i,
      ];
      
      const shouldSuppress = (message: string): boolean => {
        return suppressedPatterns.some(pattern => pattern.test(message));
      };
      
      // Intercept stderr writes (pdf2json writes warnings directly to stderr)
      process.stderr.write = function(chunk: any, encoding?: any, callback?: any): boolean {
        const message = chunk?.toString ? chunk.toString() : String(chunk);
        if (!shouldSuppress(message)) {
          return originalStderrWrite.call(process.stderr, chunk, encoding, callback);
        }
        // Suppress the warning by returning true without writing
        if (typeof callback === 'function') callback();
        return true;
      } as any;
      
      // Intercept stdout writes
      process.stdout.write = function(chunk: any, encoding?: any, callback?: any): boolean {
        const message = chunk?.toString ? chunk.toString() : String(chunk);
        if (!shouldSuppress(message)) {
          return originalStdoutWrite.call(process.stdout, chunk, encoding, callback);
        }
        if (typeof callback === 'function') callback();
        return true;
      } as any;
      
      // Also suppress console methods
      console.warn = (...args: any[]) => {
        const message = args.join(' ');
        if (!shouldSuppress(message)) {
          originalWarn.apply(console, args);
        }
      };
      
      console.error = (...args: any[]) => {
        const message = args.join(' ');
        if (!shouldSuppress(message)) {
          originalError.apply(console, args);
        }
      };
      
      const pdfParser = new PDFParser();
      const buffer = Buffer.from(arrayBuffer);
      
      let fullText = '';
      let cleanupTimer: NodeJS.Timeout;
      let pdfDataRef: any = null; // Keep reference for explicit cleanup
      
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        // Store reference for cleanup
        pdfDataRef = pdfData;
        
        // Restore all intercepted methods
        process.stderr.write = originalStderrWrite;
        process.stdout.write = originalStdoutWrite;
        console.warn = originalWarn;
        console.error = originalError;
        
        try {
          // Extract text from all pages with memory-efficient processing
          if (pdfData && pdfData.Pages) {
            const totalPages = pdfData.Pages.length;
            let processedPages = 0;
            
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const text of page.Texts) {
                  if (text.R) {
                    for (const run of text.R) {
                      if (run.T) {
                        try {
                          // Decode URI-encoded text, skip if malformed
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
              
              // Null out page data immediately after processing to free memory
              page.Texts = null;
              
              processedPages++;
              // Log progress for large PDFs
              if (totalPages > 50 && processedPages % 50 === 0) {
                console.log(`Progress: ${processedPages}/${totalPages} pages extracted...`);
              }
            }
          }
          
          console.log(`✓ Extracted ${pdfData.Pages?.length || 0} pages, ${fullText.length} characters from PDF`);
          
          // Clear cleanup timer
          if (cleanupTimer) clearTimeout(cleanupTimer);
          
          // Clean up parser reference
          pdfParser.removeAllListeners();
          
          // Aggressive memory cleanup - null out all references
          if (pdfData) {
            if (pdfData.Pages) {
              pdfData.Pages.length = 0;
              pdfData.Pages = null;
            }
            if (pdfData.Meta) pdfData.Meta = null;
            if (pdfData.FormFill) pdfData.FormFill = null;
          }
          pdfDataRef = null;
          
          resolve(fullText.trim());
        } catch (err) {
          // Restore all intercepted methods
          process.stderr.write = originalStderrWrite;
          process.stdout.write = originalStdoutWrite;
          console.warn = originalWarn;
          console.error = originalError;
          
          originalError('Error processing PDF data:', err);
          if (cleanupTimer) clearTimeout(cleanupTimer);
          pdfParser.removeAllListeners();
          reject(err);
        }
      });
      
      pdfParser.on('pdfParser_dataError', (err: any) => {
        // Restore all intercepted methods
        process.stderr.write = originalStderrWrite;
        process.stdout.write = originalStdoutWrite;
        console.warn = originalWarn;
        console.error = originalError;
        
        originalError('PDF parsing error:', err);
        if (cleanupTimer) clearTimeout(cleanupTimer);
        pdfParser.removeAllListeners();
        reject(err instanceof Error ? err : new Error(JSON.stringify(err)));
      });
      
      // Set dynamic timeout to prevent hanging
      cleanupTimer = setTimeout(() => {
        // Restore all intercepted methods
        process.stderr.write = originalStderrWrite;
        process.stdout.write = originalStdoutWrite;
        console.warn = originalWarn;
        console.error = originalError;
        
        pdfParser.removeAllListeners();
        reject(new Error(`PDF parsing timeout after ${timeoutSeconds} seconds`));
      }, calculatedTimeout);
      
      // Parse the buffer
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      // Restore all intercepted methods
      process.stderr.write = originalStderrWrite;
      process.stdout.write = originalStdoutWrite;
      console.warn = originalWarn;
      console.error = originalError;
      
      originalError('PDF extraction failed:', error);
      reject(error);
    }
  });
}

/**
 * Extract text content from various document types
 */
export async function extractTextFromFile(file: File): Promise<ExtractedDocument> {
  const fileName = file.name.toLowerCase();
  
  try {
    // PDF files
    if (fileName.endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const fileSizeMB = file.size / (1024 * 1024); // Convert to MB
        const text = await extractPdfText(arrayBuffer, fileSizeMB);
        
        console.log(`✓ Successfully extracted ${text.length} characters from ${file.name}`);
        
        return {
          name: file.name,
          content: text || '',
          type: 'pdf',
        };
      } catch (pdfError) {
        // PDF parsing failed - log error and return empty content
        console.error(`❌ PDF extraction failed for ${file.name}:`, pdfError);
        
        // Return empty content so AI can proceed based on filename and context
        return {
          name: file.name,
          content: '',
          type: 'pdf',
        };
      }
    }
    
    // Word documents
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      return {
        name: file.name,
        content: result.value,
        type: 'word',
      };
    }
    
    // Email files
    if (fileName.endsWith('.eml') || fileName.endsWith('.msg')) {
      const arrayBuffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(arrayBuffer);
      return {
        name: file.name,
        content: text,
        type: 'email',
      };
    }
    
    // Text files
    if (fileName.endsWith('.txt')) {
      const arrayBuffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(arrayBuffer);
      return {
        name: file.name,
        content: text,
        type: 'text',
      };
    }
    
    // Fallback for unknown types
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(arrayBuffer);
    return {
      name: file.name,
      content: text.substring(0, 5000), // Limit unknown types
      type: 'unknown',
    };
  } catch (error) {
    console.error(`Error extracting text from ${file.name}:`, error);
    return {
      name: file.name,
      content: '',
      type: 'unknown',
    };
  }
}

/**
 * Process files sequentially to avoid memory exhaustion
 * This is critical for large PDF files that can overwhelm the heap
 */
export async function extractTextFromFilesSequentially(files: File[]): Promise<ExtractedDocument[]> {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit for non-PDF files
  const MAX_PDF_SIZE = 15 * 1024 * 1024; // 15MB limit for PDFs (conservative to prevent OOM)
  const LARGE_PDF_THRESHOLD = 5 * 1024 * 1024; // 5MB - PDFs larger than this require extended processing
  const MEMORY_THRESHOLD = 0.70; // Halt processing if heap usage exceeds 70% of limit (conservative to prevent OOM)
  const MIN_MEMORY_REQUIRED_MB = 2048; // Require at least 2GB free before processing each PDF
  const results: ExtractedDocument[] = [];
  
  // Get actual heap limit (not just currently allocated heap)
  const heapStats = v8.getHeapStatistics();
  const heapLimitMB = Math.round(heapStats.heap_size_limit / 1024 / 1024);
  
  console.log(`Starting sequential extraction of ${files.length} files...`);
  console.log(`Heap limit: ${heapLimitMB}MB, Memory usage at start: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  
  // Pre-flight check: Ensure we have enough heap configured
  if (heapLimitMB < 8000) {
    console.error(`❌ CRITICAL: Heap limit is only ${heapLimitMB}MB. Need at least 8GB for PDF processing.`);
    return files.map(file => ({
      name: file.name,
      content: '[System Configuration Error: Insufficient memory allocated for PDF processing. Please contact support.]',
      type: 'pdf',
    }));
  }
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    
    // Check memory before processing each file (use actual heap limit, not heapTotal)
    const memStatus = process.memoryUsage();
    const heapUsedMB = memStatus.heapUsed / 1024 / 1024;
    const heapAvailableMB = heapLimitMB - heapUsedMB;
    const heapUsedPercent = memStatus.heapUsed / heapStats.heap_size_limit;
    
    console.log(`[File ${i + 1}/${files.length}] Memory check: ${Math.round(heapUsedMB)}MB used, ${Math.round(heapAvailableMB)}MB available, ${Math.round(heapUsedPercent * 100)}% of limit`);
    
    // Stop if memory threshold exceeded
    if (heapUsedPercent > MEMORY_THRESHOLD) {
      console.error(`❌ Memory threshold exceeded: ${Math.round(heapUsedMB)}MB / ${heapLimitMB}MB (${Math.round(heapUsedPercent * 100)}% of heap limit). Halting extraction to prevent crash.`);
      results.push({
        name: file.name,
        content: `[Extraction halted: Memory limit reached at ${Math.round(heapUsedPercent * 100)}%. Please process files in smaller batches or reduce file sizes. Current usage: ${Math.round(heapUsedMB)}MB / ${heapLimitMB}MB]`,
        type: isPdf ? 'pdf' : 'unknown',
      });
      
      // Skip remaining files
      for (let j = i + 1; j < files.length; j++) {
        results.push({
          name: files[j].name,
          content: '[Extraction skipped: Memory limit reached for batch]',
          type: 'unknown',
        });
      }
      break;
    }
    
    // For PDFs, ensure we have enough free memory before attempting extraction
    if (isPdf && heapAvailableMB < MIN_MEMORY_REQUIRED_MB) {
      console.error(`❌ Insufficient free memory for PDF: ${Math.round(heapAvailableMB)}MB available, need ${MIN_MEMORY_REQUIRED_MB}MB minimum`);
      
      // Run aggressive GC to try to free memory
      if (global.gc) {
        console.log(`Running emergency garbage collection...`);
        for (let gc_i = 0; gc_i < 5; gc_i++) {
          global.gc();
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        const memAfterGC = process.memoryUsage();
        const heapAvailableAfterGC = heapLimitMB - (memAfterGC.heapUsed / 1024 / 1024);
        console.log(`Memory after emergency GC: ${Math.round(memAfterGC.heapUsed / 1024 / 1024)}MB used, ${Math.round(heapAvailableAfterGC)}MB available`);
        
        // If still not enough memory, skip this file
        if (heapAvailableAfterGC < MIN_MEMORY_REQUIRED_MB) {
          console.error(`❌ Still insufficient memory after GC. Skipping ${file.name}`);
          results.push({
            name: file.name,
            content: `[Extraction skipped: Insufficient memory available (${Math.round(heapAvailableAfterGC)}MB free, need ${MIN_MEMORY_REQUIRED_MB}MB). Please process this file separately or restart the system.]`,
            type: 'pdf',
          });
          continue;
        }
      } else {
        // GC not available, skip file
        console.error(`❌ GC not available and insufficient memory. Skipping ${file.name}`);
        results.push({
          name: file.name,
          content: `[Extraction skipped: Insufficient memory available and garbage collection unavailable. Please process this file separately or restart the system.]`,
          type: 'pdf',
        });
        continue;
      }
    }
    
    // Apply stricter size limit for PDFs
    const effectiveLimit = isPdf ? MAX_PDF_SIZE : MAX_FILE_SIZE;
    
    // Validate file size
    if (file.size > effectiveLimit) {
      const limitMB = Math.round(effectiveLimit / 1024 / 1024);
      const fileMB = Math.round(file.size / 1024 / 1024);
      console.warn(`⚠ Skipping ${file.name} - exceeds ${limitMB}MB limit (${fileMB}MB)`);
      results.push({
        name: file.name,
        content: `[File too large: ${fileMB}MB. Maximum size for ${isPdf ? 'PDFs' : 'files'} is ${limitMB}MB to prevent memory exhaustion. Please split into smaller files, reduce file complexity, or compress the PDF.]`,
        type: isPdf ? 'pdf' : 'unknown',
      });
      continue;
    }
    
    // Warn about potentially problematic PDFs
    if (isPdf && file.size > LARGE_PDF_THRESHOLD) {
      const fileMB = (file.size / 1024 / 1024).toFixed(1);
      console.warn(`⚠ Large PDF detected: ${file.name} (${fileMB}MB) - may require extended processing time and significant memory`);
    }
    
    console.log(`[${i + 1}/${files.length}] Extracting ${file.name} (${Math.round(file.size / 1024)}KB)...`);
    
    // Check memory before processing
    const memBefore = process.memoryUsage();
    console.log(`Memory before: ${Math.round(memBefore.heapUsed / 1024 / 1024)}MB / ${Math.round(memBefore.heapTotal / 1024 / 1024)}MB`);
    
    try {
      const extracted = await extractTextFromFile(file);
      results.push(extracted);
      
      // Aggressive memory cleanup after each file
      if (global.gc) {
        console.log(`Running garbage collection...`);
        
        // Run GC multiple times for large PDFs
        const gcRuns = (isPdf && file.size > LARGE_PDF_THRESHOLD) ? 3 : 1;
        for (let gc_i = 0; gc_i < gcRuns; gc_i++) {
          global.gc();
          await new Promise(resolve => setTimeout(resolve, 150));
        }
        
        const memAfterGC = process.memoryUsage();
        console.log(`Memory after GC: ${Math.round(memAfterGC.heapUsed / 1024 / 1024)}MB / ${Math.round(memAfterGC.heapTotal / 1024 / 1024)}MB`);
      }
      
      // Longer delay for large PDFs to allow thorough memory cleanup
      const delayMs = (isPdf && file.size > LARGE_PDF_THRESHOLD) ? 2000 : 500;
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      console.log(`✓ [${i + 1}/${files.length}] Completed ${file.name}`);
    } catch (error: any) {
      console.error(`❌ [${i + 1}/${files.length}] Failed to extract ${file.name}:`, error);
      
      // Check if it's a memory error
      if (error.message && (error.message.includes('heap') || error.message.includes('memory'))) {
        console.error(`💥 Memory exhaustion detected for ${file.name}. Skipping remaining files to prevent crash.`);
        results.push({
          name: file.name,
          content: `[Extraction failed: File too complex and caused memory exhaustion. Please try uploading a smaller or simpler PDF.]`,
          type: 'pdf',
        });
        
        // Skip remaining files to prevent cascade failures
        for (let j = i + 1; j < files.length; j++) {
          results.push({
            name: files[j].name,
            content: '[Extraction skipped: Previous file caused memory exhaustion]',
            type: 'unknown',
          });
        }
        break;
      }
      
      results.push({
        name: file.name,
        content: `[Extraction failed: ${error.message || 'Unknown error'}]`,
        type: 'unknown',
      });
      
      // Force GC even on error
      if (global.gc) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  const finalMemUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  const finalMemPercent = Math.round((process.memoryUsage().heapUsed / heapStats.heap_size_limit) * 100);
  
  console.log(`Sequential extraction complete: ${results.length} files processed`);
  console.log(`Memory usage at end: ${finalMemUsage}MB / ${heapLimitMB}MB (${finalMemPercent}%)`);
  return results;
}

/**
 * Categorize documents into RFP docs vs preliminary emails
 */
export function categorizeDocuments(extractedDocs: ExtractedDocument[]): {
  rfpDocuments: ExtractedDocument[];
  emailDocuments: ExtractedDocument[];
} {
  const rfpDocuments: ExtractedDocument[] = [];
  const emailDocuments: ExtractedDocument[] = [];
  
  for (const doc of extractedDocs) {
    if (doc.type === 'email' || doc.name.toLowerCase().includes('email')) {
      emailDocuments.push(doc);
    } else {
      rfpDocuments.push(doc);
    }
  }
  
  return { rfpDocuments, emailDocuments };
}
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFName, PDFDict, PDFArray, PDFNumber } from 'pdf-lib';
import { getContactInfo } from './cdm-suite-knowledge';

export interface ProposalSection {
  title: string;
  content: string;
}

export interface ProposalPDFData {
  title: string;
  solicitationNumber: string;
  companyName: string;
  date: string;
  sections: ProposalSection[];
}

// CDM Suite professional color scheme
const colors = {
  primary: rgb(0.114, 0.169, 0.325), // Dark blue #1D2B53
  secondary: rgb(0.29, 0.56, 0.88), // Light blue #4A90E2
  accent: rgb(0.929, 0.522, 0.133), // Orange #ED8522
  text: rgb(0.2, 0.2, 0.2), // Dark gray for text
  mediumGray: rgb(0.4, 0.4, 0.4),
  lightGray: rgb(0.96, 0.96, 0.96), // Lighter for subtle backgrounds
  white: rgb(1, 1, 1),
  tableBorder: rgb(0.85, 0.85, 0.85),
};

/**
 * Sanitize text for PDF rendering by replacing Unicode characters
 * that are not supported by WinAnsi encoding with ASCII equivalents
 */
function sanitizeTextForPDF(text: string): string {
  if (!text) return '';
  
  return text
    // Arrows
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/↑/g, '^')
    .replace(/↓/g, 'v')
    .replace(/⇒/g, '=>')
    .replace(/⇐/g, '<=')
    // Smart quotes
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Dashes
    .replace(/—/g, '--')  // em dash
    .replace(/–/g, '-')   // en dash
    // Ellipsis
    .replace(/…/g, '...')
    // Symbols
    .replace(/©/g, '(c)')
    .replace(/®/g, '(R)')
    .replace(/™/g, '(TM)')
    .replace(/°/g, ' degrees')
    // Math symbols
    .replace(/×/g, 'x')
    .replace(/÷/g, '/')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/≠/g, '!=')
    .replace(/±/g, '+/-')
    // Currency (keep $ but replace others)
    .replace(/€/g, 'EUR')
    .replace(/£/g, 'GBP')
    .replace(/¥/g, 'YEN')
    // Other common unicode
    .replace(/•/g, '*')  // bullet point (but we handle this separately in rendering)
    .replace(/◦/g, 'o')  // white bullet
    .replace(/▪/g, '-')  // black square
    .replace(/§/g, 'Section')
    .replace(/¶/g, 'Para')
    // Remove any remaining problematic characters (non-printable ASCII)
    .replace(/[^\x20-\x7E\n\r\t]/g, '');
}

/**
 * Strip all markdown formatting from text
 * Removes headers, bold, italic, links, code blocks, horizontal rules, etc.
 */
function stripMarkdown(text: string): string {
  if (!text) return '';
  
  return text
    // Remove horizontal rules (---, ___, ***)
    .replace(/^[\s]*[-_*]{3,}[\s]*$/gm, '')
    // Remove headers (# ## ### etc)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold (**text** or __text__)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic (*text* or _text_)
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove strikethrough (~~text~~)
    .replace(/~~(.+?)~~/g, '$1')
    // Remove inline code (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks (```code```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1')
    // Remove blockquotes (> text)
    .replace(/^>\s+/gm, '')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface TableRow {
  cells: string[];
}

interface ParsedContent {
  type: 'paragraph' | 'heading' | 'bullet' | 'number' | 'table';
  content: string;
  level?: number;
  tableData?: TableRow[];
}

export async function generateProposalPDF(data: ProposalPDFData): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    
    // Page settings - professional margins
    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 72; // 1 inch margins for professional look
    const contentWidth = pageWidth - (margin * 2);
    
    // Track section pages for clickable TOC
    const sectionPageRefs: { pageIndex: number; yPosition: number }[] = [];
    
    // === COVER PAGE - Executive Style ===
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - 150;
    
    // Top accent bar (thinner, more elegant)
    page.drawRectangle({
      x: 0,
      y: pageHeight - 12,
      width: pageWidth,
      height: 12,
      color: colors.accent,
    });
    
    // Company name on cover - prominent but refined
    page.drawText(sanitizeTextForPDF(stripMarkdown(data.companyName.toUpperCase())), {
      x: margin,
      y: pageHeight - 100,
      size: 18,
      font: helveticaBold,
      color: colors.primary,
    });
    
    // Underline for company name
    page.drawLine({
      start: { x: margin, y: pageHeight - 110 },
      end: { x: margin + (data.companyName.length * 11), y: pageHeight - 110 },
      thickness: 2,
      color: colors.accent,
    });
    
    // Proposal title - large and commanding
    yPosition = pageHeight - 200;
    const titleLines = wrapText(sanitizeTextForPDF(stripMarkdown(data.title)), contentWidth, 36, helveticaBold);
    for (const line of titleLines) {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 36,
        font: helveticaBold,
        color: colors.primary,
      });
      yPosition -= 45;
    }
    
    // Subtitle or tagline area
    yPosition -= 20;
    page.drawText('PROPOSAL RESPONSE', {
      x: margin,
      y: yPosition,
      size: 12,
      font: helveticaBold,
      color: colors.mediumGray,
    });
    
    // Solicitation info box - refined design
    yPosition -= 60;
    const infoBoxHeight = 140;
    const infoBoxY = yPosition - infoBoxHeight;
    
    // Box background
    page.drawRectangle({
      x: margin,
      y: infoBoxY,
      width: contentWidth,
      height: infoBoxHeight,
      color: colors.lightGray,
    });
    
    // Left accent bar on info box
    page.drawRectangle({
      x: margin,
      y: infoBoxY,
      width: 5,
      height: infoBoxHeight,
      color: colors.primary,
    });
    
    yPosition -= 30;
    page.drawText('Solicitation Number', {
      x: margin + 20,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: colors.mediumGray,
    });
    
    yPosition -= 20;
    page.drawText(sanitizeTextForPDF(stripMarkdown(data.solicitationNumber)), {
      x: margin + 20,
      y: yPosition,
      size: 16,
      font: helveticaBold,
      color: colors.primary,
    });
    
    yPosition -= 35;
    page.drawText('Submitted By', {
      x: margin + 20,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: colors.mediumGray,
    });
    
    yPosition -= 20;
    page.drawText(sanitizeTextForPDF(stripMarkdown(data.companyName)), {
      x: margin + 20,
      y: yPosition,
      size: 14,
      font: helvetica,
      color: colors.text,
    });
    
    yPosition -= 30;
    page.drawText(sanitizeTextForPDF(stripMarkdown(`Submission Date: ${data.date}`)), {
      x: margin + 20,
      y: yPosition,
      size: 10,
      font: helvetica,
      color: colors.text,
    });
    
    // Professional footer on cover with contact information
    page.drawLine({
      start: { x: margin, y: 90 },
      end: { x: pageWidth - margin, y: 90 },
      thickness: 1,
      color: colors.lightGray,
    });
    
    // Get contact information from knowledge base
    const contactInfo = getContactInfo();
    
    // Contact information
    page.drawText('CDM Suite LLC', {
      x: margin,
      y: 70,
      size: 9,
      font: helveticaBold,
      color: colors.text,
    });
    
    page.drawText(`Email: ${contactInfo.email}`, {
      x: margin,
      y: 55,
      size: 8,
      font: helvetica,
      color: colors.mediumGray,
    });
    
    page.drawText(`Phone: ${contactInfo.phone}`, {
      x: margin,
      y: 42,
      size: 8,
      font: helvetica,
      color: colors.mediumGray,
    });
    
    page.drawText('CONFIDENTIAL & PROPRIETARY', {
      x: pageWidth - margin - 160,
      y: 30,
      size: 8,
      font: helveticaBold,
      color: colors.mediumGray,
    });
    
    // === TABLE OF CONTENTS (if more than 3 sections) ===
    let tocPageIndex = -1;
    const tocItems: { yPosition: number; sectionIndex: number }[] = [];
    
    if (data.sections.length > 3) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      tocPageIndex = pdfDoc.getPageCount() - 1;
      yPosition = pageHeight - margin - 20;
      
      page.drawText('TABLE OF CONTENTS', {
        x: margin,
        y: yPosition,
        size: 20,
        font: helveticaBold,
        color: colors.primary,
      });
      
      page.drawLine({
        start: { x: margin, y: yPosition - 8 },
        end: { x: margin + 180, y: yPosition - 8 },
        thickness: 2,
        color: colors.accent,
      });
      
      yPosition -= 40;
      
      data.sections.forEach((section, idx) => {
        const sectionNum = `${idx + 1}.`;
        page.drawText(sectionNum, {
          x: margin,
          y: yPosition,
          size: 11,
          font: helveticaBold,
          color: colors.primary,
        });
        
        const truncatedTitle = section.title.length > 65 
          ? section.title.substring(0, 62) + '...'
          : section.title;
        
        page.drawText(sanitizeTextForPDF(stripMarkdown(truncatedTitle)), {
          x: margin + 25,
          y: yPosition,
          size: 11,
          font: helvetica,
          color: colors.text,
        });
        
        // Store TOC item position for later annotation
        tocItems.push({ yPosition, sectionIndex: idx });
        
        yPosition -= 22;
        
        if (yPosition < margin + 50) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin;
        }
      });
    }
    
    // === CONTENT SECTIONS ===
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    yPosition = pageHeight - margin - 20;
    
    for (let i = 0; i < data.sections.length; i++) {
      const section = data.sections[i];
      
      // Check if we need a new page for section title (more conservative)
      if (yPosition < margin + 180) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin - 20;
      }
      
      // Store section page reference for clickable TOC
      sectionPageRefs.push({
        pageIndex: pdfDoc.getPageCount() - 1,
        yPosition: yPosition
      });
      
      // Section number badge
      const sectionNum = `${i + 1}`;
      const badgeWidth = 30;
      const badgeHeight = 26;
      
      page.drawRectangle({
        x: margin - 5,
        y: yPosition - badgeHeight + 5,
        width: badgeWidth,
        height: badgeHeight,
        color: colors.primary,
      });
      
      page.drawText(sectionNum, {
        x: margin + 7,
        y: yPosition - 14,
        size: 16,
        font: helveticaBold,
        color: colors.white,
      });
      
      // Section title - prominent and clear
      const sectionTitleSize = 18;
      const wrappedTitle = wrapText(sanitizeTextForPDF(stripMarkdown(section.title)), contentWidth - 40, sectionTitleSize, helveticaBold);
      
      let titleY = yPosition;
      for (const titleLine of wrappedTitle) {
        page.drawText(titleLine, {
          x: margin + 35,
          y: titleY,
          size: sectionTitleSize,
          font: helveticaBold,
          color: colors.primary,
        });
        titleY -= sectionTitleSize + 5;
      }
      
      // Accent line under title
      page.drawLine({
        start: { x: margin, y: titleY - 5 },
        end: { x: pageWidth - margin, y: titleY - 5 },
        thickness: 1.5,
        color: colors.accent,
      });
      
      yPosition = titleY - 25;
      
      // Parse and render content
      const parsedContent = parseMarkdownContent(section.content);
      
      for (const item of parsedContent) {
        const result = await renderContentItem(
          page,
          item,
          margin,
          yPosition,
          contentWidth,
          helvetica,
          helveticaBold,
          helveticaOblique,
          pdfDoc
        );
        
        page = result.page;
        yPosition = result.yPosition;
      }
      
      // Add space after section
      yPosition -= 30;
    }
    
    // Add clickable links to TOC (if TOC exists)
    if (tocPageIndex >= 0 && tocItems.length > 0) {
      const tocPage = pdfDoc.getPages()[tocPageIndex];
      const context = pdfDoc.context;
      
      tocItems.forEach((tocItem) => {
        const targetPageRef = sectionPageRefs[tocItem.sectionIndex];
        if (targetPageRef) {
          const targetPage = pdfDoc.getPages()[targetPageRef.pageIndex];
          
          // Create clickable link annotation using pdf-lib low-level API
          const linkAnnotDict = context.obj({});
          linkAnnotDict.set(PDFName.of('Type'), PDFName.of('Annot'));
          linkAnnotDict.set(PDFName.of('Subtype'), PDFName.of('Link'));
          linkAnnotDict.set(PDFName.of('Rect'), context.obj([
            margin, 
            tocItem.yPosition - 5, 
            pageWidth - margin, 
            tocItem.yPosition + 16
          ]));
          linkAnnotDict.set(PDFName.of('Border'), context.obj([0, 0, 0]));
          
          // Create destination array
          const destArray = context.obj([
            targetPage.ref, 
            PDFName.of('XYZ'), 
            null, 
            targetPageRef.yPosition, 
            null
          ]);
          linkAnnotDict.set(PDFName.of('Dest'), destArray);
          
          // Add annotation to page
          const tocPageDict = tocPage.node;
          const annotsName = PDFName.of('Annots');
          const existingAnnots = tocPageDict.lookup(annotsName);
          
          if (existingAnnots && existingAnnots instanceof PDFArray) {
            existingAnnots.push(linkAnnotDict);
          } else {
            const newAnnots = context.obj([linkAnnotDict]);
            tocPageDict.set(annotsName, newAnnots);
          }
        }
      });
    }
    
    // Add page numbers and footers to all pages (skip cover)
    const pages = pdfDoc.getPages();
    const pageCount = pages.length;
    
    pages.forEach((page, index) => {
      if (index === 0) return; // Skip cover page
      
      // Footer line
      page.drawLine({
        start: { x: margin, y: 40 },
        end: { x: pageWidth - margin, y: 40 },
        thickness: 1,
        color: colors.lightGray,
      });
      
      // Page number
      const pageText = `Page ${index} of ${pageCount - 1}`;
      const pageTextWidth = pageText.length * 5;
      page.drawText(pageText, {
        x: (pageWidth - pageTextWidth) / 2,
        y: 25,
        size: 9,
        font: helvetica,
        color: colors.text,
      });
      
      // Company name in footer
      page.drawText(sanitizeTextForPDF(stripMarkdown(data.companyName)), {
        x: margin,
        y: 25,
        size: 9,
        font: helveticaBold,
        color: colors.text,
      });
      
      // Solicitation number in footer
      const solTextWidth = data.solicitationNumber.length * 5;
      page.drawText(sanitizeTextForPDF(stripMarkdown(data.solicitationNumber)), {
        x: pageWidth - margin - solTextWidth,
        y: 25,
        size: 9,
        font: helvetica,
        color: colors.text,
      });
    });
    
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

function parseMarkdownContent(content: string): ParsedContent[] {
  const items: ParsedContent[] = [];
  const lines = content.split('\n');
  let currentTable: TableRow[] = [];
  let inTable = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    if (!line) {
      if (inTable && currentTable.length > 0) {
        items.push({ type: 'table', content: '', tableData: currentTable });
        currentTable = [];
        inTable = false;
      }
      continue;
    }
    
    // Skip horizontal rules (---, ___, ***)
    if (line.match(/^[-_*]{3,}$/)) {
      continue;
    }
    
    // Table detection (do this before markdown stripping to preserve structure)
    if (line.includes('|')) {
      inTable = true;
      // Skip separator rows
      if (line.match(/^[\s|:-]+$/)) continue;
      
      const cells = line.split('|')
        .map(cell => stripMarkdown(cell.trim()))
        .filter(cell => cell.length > 0);
      
      if (cells.length > 0) {
        currentTable.push({ cells });
      }
      continue;
    }
    
    // If we were in a table, save it
    if (inTable && currentTable.length > 0) {
      items.push({ type: 'table', content: '', tableData: currentTable });
      currentTable = [];
      inTable = false;
    }
    
    // Headings (detect before stripping markdown to preserve structure)
    if (line.startsWith('###')) {
      const cleanContent = stripMarkdown(line.replace(/^###\s*/, ''));
      if (cleanContent) {
        items.push({ type: 'heading', content: cleanContent, level: 3 });
      }
    } else if (line.startsWith('##')) {
      const cleanContent = stripMarkdown(line.replace(/^##\s*/, ''));
      if (cleanContent) {
        items.push({ type: 'heading', content: cleanContent, level: 2 });
      }
    }
    // Bullet points
    else if (line.match(/^[-•*]\s/)) {
      const cleanContent = stripMarkdown(line.replace(/^[-•*]\s/, ''));
      if (cleanContent) {
        items.push({ type: 'bullet', content: cleanContent });
      }
    }
    // Numbered lists
    else if (line.match(/^\d+\.\s/)) {
      const cleanContent = stripMarkdown(line.replace(/^\d+\.\s/, ''));
      if (cleanContent) {
        items.push({ type: 'number', content: cleanContent });
      }
    }
    // Regular paragraph
    else {
      const cleanContent = stripMarkdown(line);
      if (cleanContent) {
        items.push({ type: 'paragraph', content: cleanContent });
      }
    }
  }
  
  // Save any remaining table
  if (inTable && currentTable.length > 0) {
    items.push({ type: 'table', content: '', tableData: currentTable });
  }
  
  return items;
}

async function renderContentItem(
  page: PDFPage,
  item: ParsedContent,
  margin: number,
  yPosition: number,
  contentWidth: number,
  helvetica: any,
  helveticaBold: any,
  helveticaOblique: any,
  pdfDoc: PDFDocument
): Promise<{ page: PDFPage; yPosition: number }> {
  const lineHeight = 16;
  const paragraphSize = 11;
  const bulletSize = 11;
  const pageWidth = 612;
  const pageHeight = 792;
  const bottomMargin = margin + 80; // More conservative space for footers
  
  // Helper function to check if we need a new page (more conservative)
  const needsNewPage = (requiredSpace: number) => {
    return yPosition - requiredSpace - 20 < bottomMargin; // Add 20px buffer
  };
  
  // Helper function to create new page
  const createNewPage = () => {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    return pageHeight - margin - 20; // Start with some padding from top
  };
  
  switch (item.type) {
    case 'heading':
      const headingSize = item.level === 2 ? 15 : 13;
      const headingSpace = headingSize + 20;
      
      if (needsNewPage(headingSpace)) {
        yPosition = createNewPage();
      }
      
      // Small accent bar before heading
      page.drawRectangle({
        x: margin,
        y: yPosition - 3,
        width: 3,
        height: headingSize + 3,
        color: colors.accent,
      });
      
      page.drawText(sanitizeTextForPDF(item.content), {
        x: margin + 10,
        y: yPosition,
        size: headingSize,
        font: helveticaBold,
        color: colors.primary,
      });
      return { page, yPosition: yPosition - headingSize - 15 };
      
    case 'bullet':
      const bulletLines = wrapText(sanitizeTextForPDF(item.content), contentWidth - 30, bulletSize, helvetica);
      
      for (let i = 0; i < bulletLines.length; i++) {
        if (needsNewPage(lineHeight + 10)) {
          yPosition = createNewPage();
        }
        
        // Only draw bullet on first line
        if (i === 0) {
          page.drawEllipse({
            x: margin + 8,
            y: yPosition - 3,
            xScale: 3,
            yScale: 3,
            color: colors.accent,
          });
        }
        
        page.drawText(bulletLines[i], {
          x: margin + 20,
          y: yPosition,
          size: bulletSize,
          font: helvetica,
          color: colors.text,
        });
        yPosition -= lineHeight;
      }
      return { page, yPosition: yPosition - 6 };
      
    case 'number':
      const numberLines = wrapText(sanitizeTextForPDF(item.content), contentWidth - 30, bulletSize, helvetica);
      
      for (const line of numberLines) {
        if (needsNewPage(lineHeight + 10)) {
          yPosition = createNewPage();
        }
        
        page.drawText(line, {
          x: margin + 20,
          y: yPosition,
          size: bulletSize,
          font: helvetica,
          color: colors.text,
        });
        yPosition -= lineHeight;
      }
      return { page, yPosition: yPosition - 6 };
      
    case 'table':
      if (item.tableData && item.tableData.length > 0) {
        const result = renderTable(page, item.tableData, margin, yPosition, contentWidth, helvetica, helveticaBold, pdfDoc);
        return { page: result.page, yPosition: result.yPosition };
      }
      return { page, yPosition };
      
    case 'paragraph':
    default:
      const paraLines = wrapText(sanitizeTextForPDF(item.content), contentWidth, paragraphSize, helvetica);
      
      for (const line of paraLines) {
        if (needsNewPage(lineHeight + 10)) {
          yPosition = createNewPage();
        }
        
        page.drawText(line, {
          x: margin,
          y: yPosition,
          size: paragraphSize,
          font: helvetica,
          color: colors.text,
        });
        yPosition -= lineHeight;
      }
      return { page, yPosition: yPosition - 10 };
  }
}

function renderTable(
  page: PDFPage,
  tableData: TableRow[],
  margin: number,
  yPosition: number,
  contentWidth: number,
  helvetica: any,
  helveticaBold: any,
  pdfDoc: PDFDocument
): { page: PDFPage; yPosition: number } {
  if (tableData.length === 0) return { page, yPosition };
  
  const pageWidth = 612;
  const pageHeight = 792;
  const bottomMargin = margin + 80; // More conservative margin
  const numColumns = tableData[0].cells.length;
  const cellWidth = contentWidth / numColumns;
  const minRowHeight = 26; // Slightly taller minimum for better readability
  const cellPadding = 8;
  const lineHeight = 13; // Slightly more space between lines
  const fontSize = 9;
  
  // Helper to wrap text for a cell
  const wrapCellText = (text: string, maxWidth: number): string[] => {
    return wrapText(sanitizeTextForPDF(text), maxWidth, fontSize, helvetica);
  };
  
  // Helper to calculate row height based on content
  const calculateRowHeight = (row: TableRow): number => {
    let maxLines = 1;
    for (let i = 0; i < row.cells.length; i++) {
      const lines = wrapCellText(row.cells[i], cellWidth - cellPadding * 2);
      maxLines = Math.max(maxLines, lines.length);
    }
    return Math.max(minRowHeight, maxLines * lineHeight + cellPadding * 2);
  };
  
  // Helper to draw header
  const drawHeader = (currentPage: PDFPage, currentY: number) => {
    const headerHeight = calculateRowHeight(tableData[0]);
    
    // Header row with gradient effect (simulated with darker primary)
    currentPage.drawRectangle({
      x: margin,
      y: currentY - headerHeight,
      width: contentWidth,
      height: headerHeight,
      color: colors.primary,
    });
    
    // Orange accent line on top of header
    currentPage.drawRectangle({
      x: margin,
      y: currentY,
      width: contentWidth,
      height: 2,
      color: colors.accent,
    });
    
    // Header cells with multi-line support
    for (let i = 0; i < tableData[0].cells.length; i++) {
      const lines = wrapCellText(tableData[0].cells[i], cellWidth - cellPadding * 2);
      let cellY = currentY - cellPadding - 10;
      
      for (const line of lines) {
        currentPage.drawText(line, {
          x: margin + (i * cellWidth) + cellPadding,
          y: cellY,
          size: fontSize,
          font: helveticaBold,
          color: colors.white,
        });
        cellY -= lineHeight;
      }
      
      // Column separator lines in header
      if (i > 0) {
        currentPage.drawLine({
          start: { x: margin + (i * cellWidth), y: currentY },
          end: { x: margin + (i * cellWidth), y: currentY - headerHeight },
          thickness: 0.5,
          color: rgb(1, 1, 1),
          opacity: 0.3,
        });
      }
    }
    
    return currentY - headerHeight;
  };
  
  // Check if we have space for at least header + 2 rows
  const estimatedHeaderHeight = calculateRowHeight(tableData[0]);
  if (yPosition - (estimatedHeaderHeight + minRowHeight * 2) < bottomMargin) {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    yPosition = pageHeight - margin;
  }
  
  // Draw header
  yPosition = drawHeader(page, yPosition);
  
  // Data rows with enhanced styling and multi-line support
  for (let rowIndex = 1; rowIndex < tableData.length; rowIndex++) {
    const row = tableData[rowIndex];
    const rowHeight = calculateRowHeight(row);
    
    // Check if we need a new page
    if (yPosition - rowHeight < bottomMargin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
      // Redraw header on new page
      yPosition = drawHeader(page, yPosition);
    }
    
    const bgColor = rowIndex % 2 === 1 ? colors.white : colors.lightGray;
    
    // Row background
    page.drawRectangle({
      x: margin,
      y: yPosition - rowHeight,
      width: contentWidth,
      height: rowHeight,
      color: bgColor,
    });
    
    // Subtle border lines
    page.drawLine({
      start: { x: margin, y: yPosition - rowHeight },
      end: { x: margin + contentWidth, y: yPosition - rowHeight },
      thickness: 0.5,
      color: colors.tableBorder,
    });
    
    // Cell content with multi-line support
    for (let i = 0; i < row.cells.length; i++) {
      const lines = wrapCellText(row.cells[i], cellWidth - cellPadding * 2);
      let cellY = yPosition - cellPadding - 10;
      
      for (const line of lines) {
        page.drawText(line, {
          x: margin + (i * cellWidth) + cellPadding,
          y: cellY,
          size: fontSize,
          font: helvetica,
          color: colors.text,
        });
        cellY -= lineHeight;
      }
      
      // Column separator (subtle)
      if (i > 0) {
        page.drawLine({
          start: { x: margin + (i * cellWidth), y: yPosition },
          end: { x: margin + (i * cellWidth), y: yPosition - rowHeight },
          thickness: 0.3,
          color: colors.tableBorder,
        });
      }
    }
    
    yPosition -= rowHeight;
  }
  
  // Bottom border of table
  page.drawRectangle({
    x: margin,
    y: yPosition,
    width: contentWidth,
    height: 1,
    color: colors.primary,
  });
  
  return { page, yPosition: yPosition - 20 };
}

function wrapText(text: string, maxWidth: number, fontSize: number, font: any): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      // If current line has content, push it and start new line
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word itself is too long, need to break it
        const chars = word.split('');
        let brokenWord = '';
        for (const char of chars) {
          const testBroken = brokenWord + char;
          const brokenWidth = font.widthOfTextAtSize(testBroken, fontSize);
          if (brokenWidth <= maxWidth) {
            brokenWord = testBroken;
          } else {
            if (brokenWord) lines.push(brokenWord);
            brokenWord = char;
          }
        }
        if (brokenWord) currentLine = brokenWord;
      }
    }
  }
  
  if (currentLine) lines.push(currentLine);
  
  return lines.length > 0 ? lines : [text.substring(0, Math.floor(maxWidth / (fontSize * 0.5)))];
}

function estimateContentHeight(item: ParsedContent): number {
  switch (item.type) {
    case 'heading':
      return 40; // Increased for larger headings with accent bars
    case 'bullet':
    case 'number':
      // Estimate based on content length with better line height
      return Math.ceil(item.content.length / 75) * 16 + 10;
    case 'table':
      // Header (28) + data rows (24 each) + spacing (20) + accent lines (2)
      const tableRows = item.tableData?.length || 0;
      return tableRows === 0 ? 0 : 28 + ((tableRows - 1) * 24) + 22;
    case 'paragraph':
    default:
      // Better estimation with new larger text and spacing
      return Math.ceil(item.content.length / 85) * 16 + 12;
  }
}

export function parseSectionsFromMarkdown(markdown: string): ProposalSection[] {
  const sections: ProposalSection[] = [];
  const parts = markdown.split(/(?=^## )/gm);
  
  parts.forEach(part => {
    const lines = part.trim().split('\n');
    if (lines.length > 0) {
      const title = stripMarkdown(lines[0].replace(/^##\s*/, '')).trim();
      const content = lines.slice(1).join('\n').trim();
      
      if (title && content) {
        sections.push({ title, content });
      }
    }
  });
  
  return sections;
}
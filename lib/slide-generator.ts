
import pptxgen from 'pptxgenjs';
import { getContactInfo } from './cdm-suite-knowledge';

export interface SlideContent {
  title: string;
  bulletPoints: string[];
}

export interface SlideDeckData {
  title: string;
  solicitationNumber: string;
  companyName: string;
  slides: SlideContent[];
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

/**
 * Intelligent text wrapping for PowerPoint bullets
 * Ensures no text cutoff and proper line breaks
 */
function wrapBulletText(text: string, maxCharsPerLine: number = 70): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Single word is longer than max, truncate it
        lines.push(word.substring(0, maxCharsPerLine - 3) + '...');
        currentLine = '';
      }
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [''];
}

export async function generateSlideDeck(data: SlideDeckData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const pptx = new pptxgen();
      
      // Set presentation properties
      pptx.author = data.companyName;
      pptx.company = data.companyName;
      pptx.title = data.title;
      pptx.subject = `Proposal for ${data.solicitationNumber}`;
      pptx.layout = 'LAYOUT_WIDE';

      // Brand colors for CDM Suite
      const colors = {
        primary: '1D2B53',      // Dark blue
        accent: 'ED8522',       // Orange
        secondary: '4A90E2',    // Light blue
        white: 'FFFFFF',
        lightGray: 'F5F5F5',
        darkGray: '333333',
        mediumGray: '666666'
      };

      // Slide 1: Title Slide - Elegant and Bold
      const titleSlide = pptx.addSlide();
      titleSlide.background = { color: colors.white };
      
      // Large accent bar on left
      titleSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 0.4,
        h: 7.5,
        fill: { color: colors.accent }
      });
      
      // Secondary accent bar
      titleSlide.addShape(pptx.ShapeType.rect, {
        x: 0.4,
        y: 0,
        w: 0.1,
        h: 7.5,
        fill: { color: colors.primary }
      });

      // Company Name - Top (strip markdown)
      const cleanCompanyName = stripMarkdown(data.companyName).toUpperCase();
      titleSlide.addText(cleanCompanyName, {
        x: 1.5,
        y: 1.2,
        w: 11,
        h: 0.6,
        fontSize: 28,
        bold: true,
        color: colors.primary,
        fontFace: 'Arial'
      });

      // Proposal Title - Center, Large with proper wrapping (strip markdown)
      const cleanTitle = stripMarkdown(data.title);
      const titleWords = cleanTitle.split(' ');
      const titleLines: string[] = [];
      let currentTitleLine = '';
      
      // Smart title wrapping - max 2 lines, 45 chars per line
      for (const word of titleWords) {
        const testLine = currentTitleLine ? `${currentTitleLine} ${word}` : word;
        if (testLine.length > 45 && currentTitleLine.length > 0) {
          titleLines.push(currentTitleLine);
          currentTitleLine = word;
          if (titleLines.length >= 2) break; // Max 2 lines
        } else {
          currentTitleLine = testLine;
        }
      }
      if (currentTitleLine && titleLines.length < 2) {
        titleLines.push(currentTitleLine);
      }
      
      const titleText = titleLines.join('\n');
      
      titleSlide.addText(titleText, {
        x: 1.5,
        y: 2.5,
        w: 11,
        h: 1.8,
        fontSize: 40,
        bold: true,
        color: colors.darkGray,
        fontFace: 'Arial',
        valign: 'top'
      });

      // Solicitation Box (strip markdown)
      const cleanSolNumber = stripMarkdown(data.solicitationNumber);
      
      titleSlide.addShape(pptx.ShapeType.rect, {
        x: 1.5,
        y: 5.0,
        w: 6,
        h: 1.2,
        fill: { color: colors.lightGray },
        line: { color: colors.primary, width: 2 }
      });

      titleSlide.addText('Solicitation Number', {
        x: 1.7,
        y: 5.15,
        w: 5.6,
        h: 0.3,
        fontSize: 12,
        color: colors.mediumGray,
        fontFace: 'Arial'
      });

      titleSlide.addText(cleanSolNumber, {
        x: 1.7,
        y: 5.55,
        w: 5.6,
        h: 0.5,
        fontSize: 20,
        bold: true,
        color: colors.primary,
        fontFace: 'Arial'
      });

      // Contact Information
      const contactInfo = getContactInfo();
      
      titleSlide.addText(`Contact: ${contactInfo.email} | ${contactInfo.phone}`, {
        x: 1.5,
        y: 6.8,
        w: 11,
        h: 0.4,
        fontSize: 11,
        color: colors.mediumGray,
        fontFace: 'Arial',
        align: 'center'
      });
      
      // Bottom brand line
      titleSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 7.4,
        w: 13.33,
        h: 0.1,
        fill: { color: colors.accent }
      });

      // Content slides (max 3 more slides = 4 total)
      const contentSlides = data.slides.slice(0, 3);
      
      contentSlides.forEach((slideContent, index) => {
        const slide = pptx.addSlide();
        slide.background = { color: colors.white };
        
        // Top accent bar
        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 13.33,
          h: 0.15,
          fill: { color: colors.accent }
        });

        // Left accent element
        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 0.15,
          h: 7.5,
          fill: { color: colors.primary }
        });

        // Title with underline - strip markdown and truncate if needed
        const cleanSlideTitle = stripMarkdown(slideContent.title);
        const wrappedTitle = cleanSlideTitle.length > 60 
          ? cleanSlideTitle.substring(0, 57) + '...'
          : cleanSlideTitle;
        
        slide.addText(wrappedTitle, {
          x: 0.6,
          y: 0.6,
          w: 12,
          h: 0.7,
          fontSize: 30,
          bold: true,
          color: colors.primary,
          fontFace: 'Arial'
        });

        // Underline accent
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.6,
          y: 1.4,
          w: 2.5,
          h: 0.08,
          fill: { color: colors.accent }
        });

        // Bullet points with intelligent wrapping and overflow protection
        // Footer starts at 6.8, so we need to stay well above that
        const MAX_CONTENT_Y = 6.2; // Extra safe margin before footer (0.6 inches above footer)
        const START_Y = 2.0;
        const LINE_HEIGHT = 0.28; // Slightly tighter line height
        const BULLET_SPACING = 0.35; // Spacing between bullets
        const MAX_LINES_PER_BULLET = 2; // Limit to 2 lines per bullet for cleaner slides
        
        let currentY = START_Y;
        let bulletsAdded = 0;
        const maxBullets = slideContent.bulletPoints.length;
        
        for (let i = 0; i < maxBullets && bulletsAdded < 6; i++) {
          const point = slideContent.bulletPoints[i];
          
          // Strip markdown from bullet text
          const cleanPoint = stripMarkdown(point);
          
          // Truncate long bullets to fit 2 lines (approximately 100 chars)
          const truncatedPoint = cleanPoint.length > 100 
            ? cleanPoint.substring(0, 97) + '...'
            : cleanPoint;
          
          // Wrap text for proper display - 70 chars per line for better readability
          const wrappedLines = wrapBulletText(truncatedPoint, 70);
          
          // Calculate height based on number of lines (max 2 lines)
          const lineCount = Math.min(wrappedLines.length, MAX_LINES_PER_BULLET);
          const totalHeight = lineCount * LINE_HEIGHT;
          
          // Check if this bullet will fit before the footer
          const nextY = currentY + totalHeight + BULLET_SPACING;
          if (nextY > MAX_CONTENT_Y) {
            console.log(`Slide ${index + 1}: Stopping at bullet ${bulletsAdded + 1} to prevent overflow (nextY: ${nextY.toFixed(2)}, MAX: ${MAX_CONTENT_Y})`);
            break; // Stop adding bullets if they would overflow
          }
          
          // Custom bullet circle - positioned at first line
          slide.addShape(pptx.ShapeType.ellipse, {
            x: 0.7,
            y: currentY + 0.06,
            w: 0.12,
            h: 0.12,
            fill: { color: colors.accent }
          });

          // Bullet text - properly wrapped with line limit
          const displayText = wrappedLines.slice(0, MAX_LINES_PER_BULLET).join('\n');
          slide.addText(displayText, {
            x: 1.0,
            y: currentY,
            w: 11.8, // Use more width for better text display
            h: totalHeight + 0.08,
            fontSize: 14, // Slightly smaller font for better fit
            color: colors.darkGray,
            fontFace: 'Arial',
            valign: 'top',
            wrap: true,
            paraSpaceAfter: 0 // No extra paragraph spacing
          });
          
          // Move to next bullet position with proper spacing
          currentY += totalHeight + BULLET_SPACING;
          bulletsAdded++;
          
          // Log position for debugging
          console.log(`Slide ${index + 1}, Bullet ${bulletsAdded}: Y=${currentY.toFixed(2)}, Lines=${lineCount}`);
        }

        // Footer section - positioned to avoid content overlap
        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 6.8,
          w: 13.33,
          h: 0.7,
          fill: { color: colors.lightGray }
        });

        // Footer text - Company name (strip markdown)
        const cleanFooterCompany = stripMarkdown(data.companyName);
        slide.addText(cleanFooterCompany, {
          x: 0.6,
          y: 6.95,
          w: 6,
          h: 0.4,
          fontSize: 11,
          bold: true,
          color: colors.primary,
          fontFace: 'Arial',
          valign: 'middle'
        });

        // Footer text - Solicitation and page number (strip markdown)
        const cleanFooterSol = stripMarkdown(data.solicitationNumber);
        slide.addText(`${cleanFooterSol} | Slide ${index + 2}`, {
          x: 7,
          y: 6.95,
          w: 5.7,
          h: 0.4,
          fontSize: 10,
          color: colors.mediumGray,
          align: 'right',
          fontFace: 'Arial',
          valign: 'middle'
        });
      });

      // Generate buffer
      pptx.write({ outputType: 'nodebuffer' })
        .then((buffer) => {
          resolve(buffer as Buffer);
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

export function parseSlidesFromMarkdown(markdown: string): SlideContent[] {
  const slides: SlideContent[] = [];
  
  // Split by ## headers
  const sections = markdown.split(/(?=^## )/gm);
  
  sections.forEach(section => {
    const lines = section.trim().split('\n');
    if (lines.length > 0) {
      // First line is title - strip markdown and make concise
      let title = stripMarkdown(lines[0].replace(/^##\s*/, '')).trim();
      // Limit title length for better display
      if (title.length > 60) {
        title = title.substring(0, 57) + '...';
      }
      
      // Extract bullet points - prioritize concise, impactful points
      const bulletPoints: string[] = [];
      lines.slice(1).forEach(line => {
        const trimmed = line.trim();
        
        // Skip horizontal rules
        if (trimmed.match(/^[-_*]{3,}$/)) {
          return;
        }
        
        if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
          let point = stripMarkdown(trimmed.replace(/^[-*•]\s*/, '')).trim();
          // Keep bullets concise - max 150 chars for readability
          if (point.length > 150) {
            point = point.substring(0, 147) + '...';
          }
          if (point) {
            bulletPoints.push(point);
          }
        } else if (trimmed && bulletPoints.length === 0 && !trimmed.startsWith('#')) {
          // Use non-bullet text as first bullet point
          let point = stripMarkdown(trimmed);
          if (point.length > 150) {
            point = point.substring(0, 147) + '...';
          }
          if (point) {
            bulletPoints.push(point);
          }
        }
      });
      
      // Only add slides with meaningful content
      if (title && bulletPoints.length > 0) {
        slides.push({ 
          title, 
          bulletPoints: bulletPoints.slice(0, 5) // Max 5 bullets per slide for elegance
        });
      }
    }
  });
  
  // Return max 3 content slides (+ 1 title slide = 4 total)
  return slides.slice(0, 3);
}


import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';

/**
 * Strip all markdown formatting from text
 * Comprehensive removal of markdown syntax
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
 * Generate a Word document from proposal content with enhanced formatting
 */
export async function generateWordDocument(
  proposalContent: string,
  bidTitle: string,
  solicitationNumber: string,
  envelopeType: 1 | 2
): Promise<Buffer> {
  const envelopeTitle = envelopeType === 1 ? 'Technical Proposal' : 'Cost Proposal';
  
  // Strip markdown and parse content into sections
  const cleanContent = stripMarkdown(proposalContent);
  const sections = parseMarkdownContent(cleanContent);
  
  // Create document sections
  const docSections: Paragraph[] = [];

  // Title page with professional formatting
  docSections.push(
    new Paragraph({
      text: stripMarkdown(bidTitle),
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: envelopeTitle,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: `Solicitation: ${stripMarkdown(solicitationNumber)}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'Prepared by CDM Suite LLC',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Confidential & Proprietary',
          italics: true,
          size: 22, // 11pt
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
    // Page break after title page
    new Paragraph({
      text: '',
      pageBreakBefore: true,
    })
  );

  // Content sections with enhanced formatting
  sections.forEach((section, sectionIndex) => {
    // Section header with consistent styling
    docSections.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 240 },
      })
    );

    // Section content with improved paragraph handling
    section.paragraphs.forEach((para) => {
      if (para.isBullet) {
        docSections.push(
          new Paragraph({
            text: para.text,
            bullet: { level: 0 },
            spacing: { after: 100 },
          })
        );
      } else if (para.isSubHeading) {
        docSections.push(
          new Paragraph({
            text: para.text,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          })
        );
      } else if (para.text.length > 0) {
        // Regular paragraph with proper spacing
        docSections.push(
          new Paragraph({
            text: para.text,
            spacing: { after: 140, line: 360 }, // 1.5 line spacing
          })
        );
      }
    });
    
    // Add extra space between major sections
    if (sectionIndex < sections.length - 1) {
      docSections.push(
        new Paragraph({
          text: '',
          spacing: { after: 200 },
        })
      );
    }
  });

  // Create document with professional styling
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch
              right: 1440,  // 1 inch
              bottom: 1440, // 1 inch
              left: 1440,   // 1 inch
            },
          },
        },
        children: docSections,
      },
    ],
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

interface ParsedSection {
  title: string;
  paragraphs: Array<{
    text: string;
    isBullet: boolean;
    isSubHeading: boolean;
  }>;
}

function parseMarkdownContent(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = content.split('\n');
  
  let currentSection: ParsedSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) continue;

    // Main heading (##)
    if (trimmed.startsWith('## ')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: trimmed.replace(/^##\s*/, ''),
        paragraphs: [],
      };
    }
    // Sub-heading (###)
    else if (trimmed.startsWith('### ')) {
      if (currentSection) {
        currentSection.paragraphs.push({
          text: trimmed.replace(/^###\s*/, ''),
          isBullet: false,
          isSubHeading: true,
        });
      }
    }
    // Bullet point
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (currentSection) {
        currentSection.paragraphs.push({
          text: trimmed.replace(/^[-*]\s*/, ''),
          isBullet: true,
          isSubHeading: false,
        });
      }
    }
    // Regular paragraph
    else if (currentSection && trimmed.length > 0 && !trimmed.startsWith('#')) {
      currentSection.paragraphs.push({
        text: trimmed,
        isBullet: false,
        isSubHeading: false,
      });
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

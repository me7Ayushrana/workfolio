import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table as DocxTable, 
  TableRow as DocxTableRow, 
  TableCell as DocxTableCell, 
  ExternalHyperlink, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle,
  WidthType
} from 'docx';

// Helper to convert HTML Hex color or RGB/RGBA string to Docx Hex string (AARRGGBB or RRGGBB)
const cleanColor = (colorStr: string): string => {
  if (!colorStr) return '000000';
  if (colorStr.startsWith('#')) {
    return colorStr.replace('#', '');
  }
  // Convert rgb(r, g, b) to hex
  const rgbMatch = colorStr.match(/\d+/g);
  if (rgbMatch && rgbMatch.length >= 3) {
    const r = parseInt(rgbMatch[0]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    return `${r}${g}${b}`;
  }
  return '000000';
};

// Map font sizes in px/pt to Docx half-points (e.g. 12pt = 24 half-points)
const cleanFontSize = (fontSizeStr: string): number => {
  if (!fontSizeStr) return 24; // 12pt default
  const val = parseInt(fontSizeStr);
  if (isNaN(val)) return 24;
  
  if (fontSizeStr.endsWith('px')) {
    // 16px is ~12pt
    return Math.round(val * 0.75 * 2);
  }
  // Assume pt
  return Math.round(val * 2);
};

// Map text highlights to valid Word Highlight colors
const getDocxHighlight = (color: string | undefined): any => {
  if (!color) return undefined;
  const c = color.toLowerCase();
  if (c.includes('yellow')) return 'yellow';
  if (c.includes('green')) return 'green';
  if (c.includes('blue')) return 'blue';
  if (c.includes('pink') || c.includes('magenta')) return 'magenta';
  if (c.includes('cyan')) return 'cyan';
  if (c.includes('red')) return 'red';
  return 'yellow'; // default fallback for highlights
};

interface InlineStyle {
  bold?: boolean;
  italics?: boolean;
  underline?: boolean;
  strike?: boolean;
  subScript?: boolean;
  superScript?: boolean;
  color?: string;
  highlight?: string;
  font?: string;
  size?: number;
}

export const exportToDocx = async (htmlContent: string, docTitle: string = 'Untitled Document'): Promise<Blob> => {
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(htmlContent, 'text/html');
  const body = parsedDoc.body;

  const docChildren: any[] = [];

  const parseInlineNodes = (parentNode: Node, currentStyle: InlineStyle = {}): any[] => {
    const runs: any[] = [];
    
    parentNode.childNodes.forEach((node) => {
      const style = { ...currentStyle };
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();
        
        // Add styling based on tag
        if (tagName === 'strong' || tagName === 'b') style.bold = true;
        if (tagName === 'em' || tagName === 'i') style.italics = true;
        if (tagName === 'u') style.underline = true;
        if (tagName === 's' || tagName === 'strike' || tagName === 'del') style.strike = true;
        if (tagName === 'sub') style.subScript = true;
        if (tagName === 'sup') style.superScript = true;
        
        // Read style attributes
        if (el.style.color) style.color = cleanColor(el.style.color);
        if (el.style.backgroundColor) style.highlight = el.style.backgroundColor;
        if (el.style.fontFamily) style.font = el.style.fontFamily.replace(/['"]/g, '');
        if (el.style.fontSize) style.size = cleanFontSize(el.style.fontSize);

        if (tagName === 'a') {
          const href = el.getAttribute('href') || '';
          const linkChildren = parseInlineNodes(el, style);
          runs.push(
            new ExternalHyperlink({
              children: linkChildren.length > 0 ? linkChildren : [new TextRun({ text: el.textContent || href })],
              link: href,
            })
          );
        } else if (tagName === 'br') {
          runs.push(new TextRun({ text: '', break: 1 }));
        } else {
          // Recurse down
          runs.push(...parseInlineNodes(el, style));
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          runs.push(
            new TextRun({
              text: text,
              bold: style.bold,
              italics: style.italics,
              underline: style.underline ? {} : undefined,
              strike: style.strike,
              subScript: style.subScript,
              superScript: style.superScript,
              color: style.color,
              highlight: getDocxHighlight(style.highlight),
              font: style.font || 'Calibri',
              size: style.size || 24, // 12pt default
            })
          );
        }
      }
    });
    
    return runs;
  };

  const getAlignment = (alignmentStr: string): any => {
    if (alignmentStr === 'center') return AlignmentType.CENTER;
    if (alignmentStr === 'right') return AlignmentType.RIGHT;
    if (alignmentStr === 'justify') return AlignmentType.BOTH;
    return AlignmentType.LEFT;
  };

  const processBlockNode = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    
    const el = node as HTMLElement;
    const tagName = el.tagName.toLowerCase();
    
    const align = getAlignment(el.style.textAlign || '');
    
    // 1. Headings
    if (/^h[1-6]$/.test(tagName)) {
      const level = parseInt(tagName.charAt(1));
      let headingLvl: any = HeadingLevel.HEADING_1;
      if (level === 2) headingLvl = HeadingLevel.HEADING_2;
      if (level === 3) headingLvl = HeadingLevel.HEADING_3;
      if (level === 4) headingLvl = HeadingLevel.HEADING_4;
      if (level === 5) headingLvl = HeadingLevel.HEADING_5;
      if (level === 6) headingLvl = HeadingLevel.HEADING_6;
      
      const runs = parseInlineNodes(el);
      docChildren.push(
        new Paragraph({
          children: runs,
          heading: headingLvl,
          alignment: align,
          spacing: { before: 180, after: 120 },
        })
      );
    } 
    // 2. Paragraphs / Notes
    else if (tagName === 'p' || tagName === 'div' || tagName === 'blockquote') {
      const runs = parseInlineNodes(el);
      docChildren.push(
        new Paragraph({
          children: runs,
          alignment: align,
          spacing: tagName === 'blockquote' ? { before: 120, after: 120 } : { after: 120 },
          indent: tagName === 'blockquote' ? { left: 720 } : undefined,
        })
      );
    } 
    // 3. Lists (Unordered / Ordered)
    else if (tagName === 'ul' || tagName === 'ol') {
      const isOrdered = tagName === 'ol';
      el.querySelectorAll('li').forEach((li) => {
        const runs = parseInlineNodes(li);
        docChildren.push(
          new Paragraph({
            children: runs,
            bullet: isOrdered ? undefined : { level: 0 },
            numbering: isOrdered ? { reference: 'ordered-list', level: 0 } : undefined,
            spacing: { after: 60 },
          })
        );
      });
    }
    // 4. Tables
    else if (tagName === 'table') {
      const rows: DocxTableRow[] = [];
      el.querySelectorAll('tr').forEach((tr) => {
        const cells: DocxTableCell[] = [];
        tr.querySelectorAll('td, th').forEach((td) => {
          const cellRuns = parseInlineNodes(td);
          const cellColor = (td as HTMLElement).style.backgroundColor ? cleanColor((td as HTMLElement).style.backgroundColor) : undefined;
          
          cells.push(
            new DocxTableCell({
              children: [
                new Paragraph({
                  children: cellRuns,
                  spacing: { after: 60 },
                }),
              ],
              shading: cellColor ? { fill: cellColor } : undefined,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 8, color: 'D3D3D3' },
                bottom: { style: BorderStyle.SINGLE, size: 8, color: 'D3D3D3' },
                left: { style: BorderStyle.SINGLE, size: 8, color: 'D3D3D3' },
                right: { style: BorderStyle.SINGLE, size: 8, color: 'D3D3D3' },
              },
            })
          );
        });
        rows.push(new DocxTableRow({ children: cells }));
      });
      docChildren.push(new DocxTable({ rows: rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    }
    // 5. Code Block / Pre
    else if (tagName === 'pre') {
      const runs = parseInlineNodes(el);
      docChildren.push(
        new Paragraph({
          children: runs,
          spacing: { before: 120, after: 120 },
          shading: { fill: 'F5F5F5' },
          indent: { left: 360, right: 360 },
        })
      );
    }
    // 6. Horizontal Rule / Page Break
    else if (tagName === 'hr') {
      // Check if it's a page break
      if (el.classList.contains('page-break') || el.style.pageBreakAfter === 'always') {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: '' })],
            pageBreakBefore: true,
          })
        );
      }
    }
    // 7. General Block-level Fallback
    else {
      const runs = parseInlineNodes(el);
      if (runs.length > 0) {
        docChildren.push(new Paragraph({ children: runs }));
      }
    }
  };

  // Traverse the body element block by block
  body.childNodes.forEach((node) => {
    processBlockNode(node);
  });

  // If document contains no content, add a blank paragraph
  if (docChildren.length === 0) {
    docChildren.push(new Paragraph({ children: [new TextRun({ text: 'Hello from WordDeck.' })] }));
  }

  const doc = new Document({
    title: docTitle,
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  return Packer.toBlob(doc);
};

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import type { ReportSection } from '../components/AuditReport';

// --- Helper parsers for markdown-like content ---

const parseMarkdownTable = (content: string) => {
  const lines = content.split('\n').filter(line => line.trim().startsWith('|'));
  if (lines.length < 2) return { head: [], body: [] }; // Header and separator line

  const headerLine = lines[0];
  const headerCells = headerLine.split('|').map(cell => cell.trim()).slice(1, -1);
  
  const bodyRows = lines.slice(2);
  const body = bodyRows.map(row => 
    row.split('|').map(cell => cell.trim()).slice(1, -1)
  );

  return { head: [headerCells], body };
};

const isTable = (content: string) => content.includes('|') && content.includes('---');

// --- PDF Export Logic ---

export const exportToPdf = async (sections: ReportSection[]): Promise<void> => {
  const doc = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
  const margin = 40;
  let cursorY = margin;

  sections.forEach((section, index) => {
    if (index > 0) {
        cursorY += 20; // Space between sections
    }

    // Add Section Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(section.title, margin, cursorY);
    cursorY += 20;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    if (isTable(section.content)) {
      const { head, body } = parseMarkdownTable(section.content);
      autoTable(doc, {
        head,
        body,
        startY: cursorY,
        margin: { left: margin },
        theme: 'striped',
        headStyles: { fillColor: [75, 85, 99] }, // gray-600
        styles: { cellPadding: 3, fontSize: 8 },
      });
      cursorY = (doc as any).lastAutoTable.finalY + 10;
    } else {
      const lines = section.content.split('\n');
      lines.forEach(line => {
        if (cursorY > doc.internal.pageSize.height - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(line, margin, cursorY, { maxWidth: doc.internal.pageSize.width - margin * 2 });
        cursorY += 12; // Line height
      });
    }
  });

  doc.save('thumbnail-audit-report.pdf');
};


// --- DOCX Export Logic ---

const createDocxChildren = (sections: ReportSection[]) => {
  const children: (Paragraph | Table)[] = [];

  sections.forEach(section => {
    // Section Title
    children.push(new Paragraph({
      text: section.title,
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 },
    }));

    if (isTable(section.content)) {
      const { head, body } = parseMarkdownTable(section.content);
      const headerRow = new TableRow({
        children: head[0].map(text => new TableCell({
          children: [new Paragraph({ text, alignment: 'center' })],
          shading: { fill: "4A5568" }, // gray-700
        })),
      });

      const bodyRows = body.map(row => new TableRow({
        children: row.map(text => new TableCell({ children: [new Paragraph(text)] })),
      }));

      const table = new Table({
        rows: [headerRow, ...bodyRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
      });
      children.push(table);

    } else {
      const lines = section.content.split('\n');
      lines.forEach(line => {
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            children.push(new Paragraph({ text: line.trim().substring(2), bullet: { level: 0 } }));
        } else if (line.match(/^\d+\.\s/)) {
            children.push(new Paragraph({ text: line.replace(/^\d+\.\s/, ''), numbering: { reference: 'default-numbering', level: 0 } }));
        } else if (line.trim()) {
            children.push(new Paragraph(line));
        }
      });
    }
    children.push(new Paragraph("")); // Spacer
  });

  return children;
};

export const exportToDocx = async (sections: ReportSection[]): Promise<void> => {
    const docChildren = createDocxChildren(sections);

    const doc = new Document({
        numbering: {
            config: [{
                reference: "default-numbering",
                levels: [{
                    level: 0,
                    format: "decimal",
                    text: "%1.",
                    alignment: 'left',
                }],
            }],
        },
        sections: [{
            children: docChildren,
        }],
        styles: {
            paragraphStyles: [
                {
                    id: "Heading2",
                    name: "Heading 2",
                    basedOn: "Normal",
                    next: "Normal",
                    run: {
                        size: 32, // 16pt
                        bold: true,
                        color: "4299E1", // blue-400
                    },
                },
            ],
        },
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thumbnail-audit-report.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
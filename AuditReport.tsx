import React, { useRef, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, FileDocx } from './icons';
import { exportToPdf, exportToDocx } from '../services/exportService';

interface AuditReportProps {
  report: string;
}

export interface ReportSection {
  title: string;
  content: string;
}

// This parser assumes the report is structured with sections separated by a line of hyphens.
const parseReport = (markdown: string): ReportSection[] => {
  if (!markdown) return [];

  // Split the report by a line of 3 or more hyphens to handle the new template format.
  const sectionBlocks = markdown.split(/\n-{3,}\n/).map(s => s.trim()).filter(Boolean);

  return sectionBlocks.map(block => {
    // For each block, find the first line to use as the title.
    const firstNewlineIndex = block.indexOf('\n');
    
    if (firstNewlineIndex === -1) {
      // If the block is a single line, treat it as the title.
      return { title: block, content: '' };
    }

    const title = block.substring(0, firstNewlineIndex).trim();
    const content = block.substring(firstNewlineIndex + 1).trim();

    return { title, content };
  }).filter(section => section.title || section.content);
};

export const AuditReport: React.FC<AuditReportProps> = ({ report }) => {
  const reportContentRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const parsedSections = useMemo(() => parseReport(report), [report]);

  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await exportToPdf(parsedSections);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    if (isExportingDocx) return;
    setIsExportingDocx(true);
    try {
      await exportToDocx(parsedSections);
    } catch (error) {
      console.error("Failed to export DOCX:", error);
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <section className="bg-gray-800/50 p-6 sm:p-8 rounded-2xl border border-gray-700 shadow-lg mt-12">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
          AI Audit Report
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf || isExportingDocx}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg shadow-md transition-all duration-300 ease-in-out hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
            aria-label="Export report as PDF"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExportingPdf ? 'Exporting...' : 'Export as PDF'}
          </button>
          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx || isExportingPdf}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg shadow-md transition-all duration-300 ease-in-out hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            aria-label="Export report as DOCX"
          >
            <FileDocx className="h-4 w-4 mr-2" />
            {isExportingDocx ? 'Exporting...' : 'Export as DOCX'}
          </button>
        </div>
      </div>

      <div ref={reportContentRef} className="bg-gray-800 rounded-lg p-6 sm:p-8">
        {parsedSections.map((section, index) => (
          <div key={index} className="mb-10 last:mb-0">
            <h3 className="text-xl font-semibold text-indigo-300 border-b-2 border-gray-700 pb-2 mb-4">
              {section.title}
            </h3>
            {section.content && (
              <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-table:w-full prose-headings:text-indigo-300 prose-strong:text-gray-100 prose-blockquote:border-l-indigo-400 prose-a:text-indigo-400 hover:prose-a:text-indigo-300">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
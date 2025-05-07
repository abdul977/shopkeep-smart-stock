import { toast } from "sonner";

/**
 * Exports HTML content as a PDF by opening a new window with print dialog
 * @param content HTML content to export
 * @param title Title for the PDF document
 * @param styles Optional CSS styles to apply
 */
export const exportToPdf = (
  content: string,
  title: string,
  styles?: string
): void => {
  try {
    // Create a new window with just the content
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast.error("Failed to create PDF - popup blocked");
      return;
    }
    
    // Default styles if none provided
    const defaultStyles = `
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }
      .content {
        padding: 15px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1rem;
      }
      th, td {
        padding: 0.5rem;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      th {
        font-weight: bold;
        background-color: #f8f9fa;
      }
      .text-right {
        text-align: right;
      }
      .text-center {
        text-align: center;
      }
      .font-bold {
        font-weight: bold;
      }
      .text-gray-500 {
        color: #6b7280;
      }
      @media print {
        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      }
    `;
    
    // Add necessary styles to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            ${styles || defaultStyles}
          </style>
        </head>
        <body>
          <div class="content">
            ${content}
          </div>
          <script>
            // Auto-print when loaded
            window.onload = function() {
              setTimeout(() => {
                window.print();
                // Don't close the window to allow the user to save as PDF
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Notify user about how to save as PDF
    toast.success("Use your browser's 'Save as PDF' option in the print dialog", {
      duration: 5000
    });
    
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    toast.error("Failed to export as PDF");
  }
};

/**
 * Exports a table as a PDF
 * @param tableRef Reference to the table element
 * @param title Title for the PDF document
 */
export const exportTableToPdf = (
  tableRef: React.RefObject<HTMLTableElement>,
  title: string
): void => {
  if (!tableRef.current) {
    toast.error("No table content to export");
    return;
  }
  
  const tableHtml = tableRef.current.outerHTML;
  exportToPdf(tableHtml, title);
};

/**
 * Exports a report as a PDF
 * @param reportTitle Title of the report
 * @param headerContent Header content HTML
 * @param tableContent Table content HTML
 * @param footerContent Optional footer content HTML
 */
export const exportReportToPdf = (
  reportTitle: string,
  headerContent: string,
  tableContent: string,
  footerContent?: string
): void => {
  const content = `
    <div class="report">
      <div class="report-header">
        ${headerContent}
      </div>
      <div class="report-body">
        ${tableContent}
      </div>
      ${footerContent ? `<div class="report-footer">${footerContent}</div>` : ''}
    </div>
  `;
  
  const styles = `
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .content {
      padding: 15px;
      background: white;
    }
    .report-header {
      margin-bottom: 20px;
    }
    .report-header h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .report-footer {
      margin-top: 20px;
      font-size: 12px;
      color: #6b7280;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }
    th, td {
      padding: 0.5rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      font-weight: bold;
      background-color: #f8f9fa;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .font-bold {
      font-weight: bold;
    }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  `;
  
  exportToPdf(content, reportTitle, styles);
};

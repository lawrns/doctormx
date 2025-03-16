import { useState } from 'react';
import { Download, Send, Printer, Copy, Share2, Mail, QrCode, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportDataItem {
  label: string;
  value: string | string[] | number | boolean | null | undefined;
  formatType?: 'text' | 'list' | 'tag' | 'date';
  tagColor?: string;
  icon?: React.ReactNode;
}

interface ExportData {
  title: string;
  subtitle?: string;
  date: Date;
  sections: {
    title: string;
    items: ExportDataItem[];
  }[];
  logoUrl?: string;
  siteUrl?: string;
  disclaimer?: string;
}

interface ResultsExportProps {
  data: ExportData;
  elementToExport?: React.RefObject<HTMLElement>;
  onClose?: () => void;
}

const ResultsExport: React.FC<ResultsExportProps> = ({ 
  data, 
  elementToExport,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'share'>('export');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'html' | 'csv' | 'print'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  
  const handleExport = async () => {
    setIsGenerating(true);
    
    try {
      switch (exportFormat) {
        case 'pdf':
          await exportToPdf();
          break;
        case 'html':
          exportToHtml();
          break;
        case 'csv':
          exportToCsv();
          break;
        case 'print':
          window.print();
          break;
      }
    } catch (error) {
      console.error('Error during export:', error);
      alert('Ocurrió un error al exportar los resultados. Por favor, inténtelo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPdf = async () => {
    if (!elementToExport?.current) {
      // If no specific element is provided, create one from the data
      const tempDiv = document.createElement('div');
      tempDiv.className = 'results-for-export';
      tempDiv.innerHTML = generateHtmlContent();
      document.body.appendChild(tempDiv);
      
      try {
        const canvas = await html2canvas(tempDiv, { 
          scale: 2,
          logging: false,
          useCORS: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgWidth = 210;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${data.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      } finally {
        document.body.removeChild(tempDiv);
      }
    } else {
      // Export the provided element
      const element = elementToExport.current;
      const canvas = await html2canvas(element, { 
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${data.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  const exportToHtml = () => {
    const htmlContent = generateHtmlContent();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCsv = () => {
    let csvContent = `"${data.title}"\n`;
    csvContent += `"Fecha","${data.date.toLocaleDateString()}"\n\n`;
    
    data.sections.forEach(section => {
      csvContent += `"${section.title}"\n`;
      section.items.forEach(item => {
        let value = '';
        if (Array.isArray(item.value)) {
          value = item.value.join(', ');
        } else if (item.value !== null && item.value !== undefined) {
          value = String(item.value);
        }
        csvContent += `"${item.label}","${value}"\n`;
      });
      csvContent += '\n';
    });
    
    if (data.disclaimer) {
      csvContent += `"Aviso importante: ${data.disclaimer}"\n`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateHtmlContent = () => {
    const styles = `
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
      .container { max-width: 800px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 30px; }
      .header h1 { margin-bottom: 10px; color: #2563eb; }
      .header p { color: #666; }
      .section { margin-bottom: 30px; }
      .section h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; color: #1f2937; }
      .item { margin-bottom: 15px; }
      .item-label { font-weight: bold; color: #4b5563; }
      .item-value { }
      .tag { display: inline-block; padding: 2px 8px; border-radius: 10px; margin-right: 5px; margin-bottom: 5px; font-size: 0.9em; }
      .tag-blue { background-color: #dbeafe; color: #1e40af; }
      .tag-green { background-color: #d1fae5; color: #065f46; }
      .tag-red { background-color: #fee2e2; color: #b91c1c; }
      .tag-amber { background-color: #fef3c7; color: #92400e; }
      .tag-purple { background-color: #ede9fe; color: #5b21b6; }
      .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 0.8em; color: #6b7280; }
      .date { text-align: right; color: #6b7280; margin-bottom: 30px; }
    `;
    
    let html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${data.title}</h1>
            ${data.subtitle ? `<p>${data.subtitle}</p>` : ''}
          </div>
          
          <div class="date">
            Fecha: ${data.date.toLocaleDateString()}
          </div>
    `;
    
    data.sections.forEach(section => {
      html += `
        <div class="section">
          <h2>${section.title}</h2>
      `;
      
      section.items.forEach(item => {
        html += `
          <div class="item">
            <div class="item-label">${item.label}</div>
            <div class="item-value">
        `;
        
        if (Array.isArray(item.value) && item.formatType === 'list') {
          html += '<ul>';
          item.value.forEach(val => {
            html += `<li>${val}</li>`;
          });
          html += '</ul>';
        } else if (Array.isArray(item.value) && item.formatType === 'tag') {
          item.value.forEach(val => {
            const tagColor = item.tagColor || 'blue';
            html += `<span class="tag tag-${tagColor}">${val}</span>`;
          });
        } else if (Array.isArray(item.value)) {
          html += item.value.join(', ');
        } else if (item.value instanceof Date) {
          html += item.value.toLocaleDateString();
        } else if (item.value !== null && item.value !== undefined) {
          html += item.value;
        } else {
          html += 'No disponible';
        }
        
        html += `
            </div>
          </div>
        `;
      });
      
      html += `
        </div>
      `;
    });
    
    if (data.disclaimer) {
      html += `
        <div class="footer">
          <strong>Aviso importante:</strong> ${data.disclaimer}
        </div>
      `;
    }
    
    html += `
          </div>
        </body>
        </html>
    `;
    
    return html;
  };

  const copyResultsAsText = () => {
    let textContent = `${data.title}\n`;
    textContent += `Fecha: ${data.date.toLocaleDateString()}\n\n`;
    
    data.sections.forEach(section => {
      textContent += `=== ${section.title} ===\n`;
      section.items.forEach(item => {
        let value = '';
        if (Array.isArray(item.value)) {
          value = item.value.join(', ');
        } else if (item.value !== null && item.value !== undefined) {
          value = String(item.value);
        } else {
          value = 'No disponible';
        }
        textContent += `${item.label}: ${value}\n`;
      });
      textContent += '\n';
    });
    
    if (data.disclaimer) {
      textContent += `AVISO IMPORTANTE: ${data.disclaimer}\n`;
    }
    
    navigator.clipboard.writeText(textContent).then(() => {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }).catch(err => {
      console.error('Error al copiar al portapapeles:', err);
    });
  };

  const handleShareByEmail = () => {
    if (!shareEmail) return;
    
    // In a real app, this would send an API request to share the results
    // For this demo, we'll just create a mailto link
    const subject = encodeURIComponent(`Resultados: ${data.title}`);
    let body = encodeURIComponent(`Aquí están mis resultados de la evaluación de síntomas:\n\n`);
    
    data.sections.forEach(section => {
      body += encodeURIComponent(`${section.title}:\n`);
      section.items.forEach(item => {
        let value = '';
        if (Array.isArray(item.value)) {
          value = item.value.join(', ');
        } else if (item.value !== null && item.value !== undefined) {
          value = String(item.value);
        } else {
          value = 'No disponible';
        }
        body += encodeURIComponent(`${item.label}: ${value}\n`);
      });
      body += encodeURIComponent('\n');
    });
    
    const mailtoLink = `mailto:${shareEmail}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  const generateShareUrl = () => {
    // In a real app, this would create a shareable URL
    // For this demo, we'll just encode data in a URL parameter
    const compressedData = btoa(JSON.stringify({
      t: data.title,
      d: data.date.toISOString(),
      s: data.sections.map(section => ({
        t: section.title,
        i: section.items.map(item => ({
          l: item.label,
          v: item.value
        }))
      }))
    }));
    
    return `${window.location.origin}/shared-results?data=${compressedData}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">Exportar y Compartir Resultados</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Download size={16} className="inline-block mr-2" />
            Exportar
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'share'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Share2 size={16} className="inline-block mr-2" />
            Compartir
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        {activeTab === 'export' && (
          <div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato de exportación
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                    exportFormat === 'pdf'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span className="mt-2 text-sm font-medium">PDF</span>
                </button>
                
                <button
                  onClick={() => setExportFormat('html')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                    exportFormat === 'html'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  <span className="mt-2 text-sm font-medium">HTML</span>
                </button>
                
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                    exportFormat === 'csv'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v18"></path>
                    <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
                    <path d="M20 3v18"></path>
                    <path d="M2 8h20"></path>
                  </svg>
                  <span className="mt-2 text-sm font-medium">CSV</span>
                </button>
                
                <button
                  onClick={() => setExportFormat('print')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                    exportFormat === 'print'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Printer size={24} />
                  <span className="mt-2 text-sm font-medium">Imprimir</span>
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenido a exportar
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
                <h4 className="font-medium text-gray-900 mb-2">{data.title}</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Fecha: {data.date.toLocaleDateString()}
                </p>
                
                <div className="text-sm text-gray-600">
                  {data.sections.map((section, idx) => (
                    <div key={idx} className="mb-2">
                      <p className="font-medium">{section.title}</p>
                      <p className="text-gray-500">{section.items.length} elementos</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-gray-500 flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>
                  Los resultados se exportarán en el formato seleccionado con todos los detalles de la evaluación.
                </span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copiar al portapapeles
              </label>
              <button
                onClick={copyResultsAsText}
                className="flex items-center justify-center px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {showCopySuccess ? (
                  <>
                    <Check size={16} className="mr-2 text-green-600" />
                    Copiado con éxito
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-2" />
                    Copiar resultados como texto
                  </>
                )}
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button
                onClick={handleExport}
                disabled={isGenerating}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generando...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    {exportFormat === 'print' ? 'Imprimir resultados' : `Exportar como ${exportFormat.toUpperCase()}`}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'share' && (
          <div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compartir por correo electrónico
              </label>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Correo del destinatario"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleShareByEmail}
                  disabled={!shareEmail}
                  className={`px-4 py-2 rounded-r-md ${
                    shareEmail
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Mail size={20} />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Se enviará un correo con los detalles de la evaluación.
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enlace para compartir
              </label>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={generateShareUrl()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm bg-gray-50"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateShareUrl());
                    setShowCopySuccess(true);
                    setTimeout(() => setShowCopySuccess(false), 2000);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  {showCopySuccess ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Este enlace permite a otros ver tus resultados.
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código QR
              </label>
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex justify-center">
                <div className="w-40 h-40 bg-gray-100 rounded flex items-center justify-center">
                  <QrCode size={100} className="text-gray-400" />
                  <span className="sr-only">Código QR para compartir resultados</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                Escanea este código QR para acceder a los resultados desde otro dispositivo.
              </p>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="text-sm text-gray-500 flex items-start mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 mt-0.5 flex-shrink-0">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>
                  Los resultados compartidos estarán disponibles durante 30 días. No incluyen tu información personal sensible.
                </span>
              </div>
              
              <button
                onClick={() => setActiveTab('export')}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Send size={16} className="mr-2" />
                Enviar y compartir resultados
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsExport;
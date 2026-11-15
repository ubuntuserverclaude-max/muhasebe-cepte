import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface InvoicePrintData {
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  companyName: string;
  companyTaxNumber?: string;
  companyAddress?: string;
  clientName: string;
  clientTaxNumber?: string;
  clientAddress?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    amount: number;
  }[];
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
}

export async function generateAndShareInvoicePDF(data: InvoicePrintData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 30px; font-size: 14px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
            .company-info h1 { font-size: 22px; color: #0f172a; margin: 0 0 5px 0; }
            .invoice-details { text-align: right; }
            .invoice-details h2 { font-size: 20px; color: #2563eb; margin: 0 0 5px 0; }
            .parties { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 8px; }
            .party h3 { font-size: 13px; color: #64748b; text-transform: uppercase; margin: 0 0 5px 0; }
            .party p { margin: 2px 0; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: left; padding: 10px; border-bottom: 1px solid #cbd5e1; font-size: 12px; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .text-right { text-align: right; }
            .summary { width: 300px; margin-left: auto; background: #f8fafc; padding: 15px; border-radius: 8px; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .summary-row.total { font-weight: bold; font-size: 16px; color: #0f172a; border-top: 2px solid #cbd5e1; padding-top: 8px; margin-top: 8px; }
            .notes { margin-top: 40px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-info">
                <h1>${data.companyName}</h1>
                <p>Vergi No: ${data.companyTaxNumber || '-'}</p>
                <p>${data.companyAddress || ''}</p>
            </div>
            <div class="invoice-details">
                <h2>FATURA</h2>
                <p><strong>Fatura No:</strong> ${data.invoiceNumber}</p>
                <p><strong>Tarih:</strong> ${data.date}</p>
                ${data.dueDate ? `<p><strong>Vade Tarihi:</strong> ${data.dueDate}</p>` : ''}
            </div>
        </div>

        <div class="parties">
            <div class="party">
                <h3>Sayın / Müşteri:</h3>
                <p><strong>${data.clientName}</strong></p>
                <p>Vergi No: ${data.clientTaxNumber || '-'}</p>
                <p>${data.clientAddress || ''}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Hizmet / Ürün Açıklaması</th>
                    <th class="text-right">Miktar</th>
                    <th class="text-right">Birim Fiyat</th>
                    <th class="text-right">KDV %</th>
                    <th class="text-right">Toplam</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">${item.unitPrice.toLocaleString('tr-TR')} ₺</td>
                        <td class="text-right">%${item.taxRate}</td>
                        <td class="text-right">${item.amount.toLocaleString('tr-TR')} ₺</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="summary">
            <div class="summary-row">
                <span>Ara Toplam:</span>
                <span>${data.subtotal.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div class="summary-row">
                <span>KDV Toplam:</span>
                <span>${data.taxAmount.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div class="summary-row total">
                <span>Genel Toplam:</span>
                <span>${data.total.toLocaleString('tr-TR')} ₺</span>
            </div>
        </div>

        ${data.notes ? `
            <div class="notes">
                <strong>Notlar:</strong>
                <p>${data.notes}</p>
            </div>
        ` : ''}
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
    return uri;
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    throw error;
  }
}

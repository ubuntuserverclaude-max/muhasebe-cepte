import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface StatementItem {
  date: string;
  description: string;
  type: 'debt' | 'credit'; // Borç / Alacak
  amount: number;
  balance: number;
}

export interface StatementData {
  companyName: string;
  companyTaxNumber?: string;
  companyAddress?: string;
  contactName: string;
  contactTaxNumber?: string;
  contactAddress?: string;
  startDate?: string;
  endDate?: string;
  items: StatementItem[];
  totalDebt: number;
  totalCredit: number;
  netBalance: number;
}

export async function generateAndShareStatementPDF(data: StatementData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 30px; font-size: 14px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
            .company-info h1 { font-size: 20px; color: #0f172a; margin: 0 0 5px 0; }
            .statement-details { text-align: right; }
            .statement-details h2 { font-size: 18px; color: #2563eb; margin: 0 0 5px 0; }
            .parties { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 8px; }
            .party h3 { font-size: 13px; color: #64748b; text-transform: uppercase; margin: 0 0 5px 0; }
            .party p { margin: 2px 0; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: left; padding: 10px; border-bottom: 1px solid #cbd5e1; font-size: 12px; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .text-right { text-align: right; }
            .summary { width: 320px; margin-left: auto; background: #f8fafc; padding: 15px; border-radius: 8px; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .summary-row.total { font-weight: bold; font-size: 16px; color: #0f172a; border-top: 2px solid #cbd5e1; padding-top: 8px; margin-top: 8px; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-info">
                <h1>${data.companyName}</h1>
                <p>Vergi No: ${data.companyTaxNumber || '-'}</p>
                <p>${data.companyAddress || ''}</p>
            </div>
            <div class="statement-details">
                <h2>CARİ HESAP EKSTRESİ</h2>
                ${data.startDate && data.endDate ? `<p><strong>Dönem:</strong> ${data.startDate} - ${data.endDate}</p>` : ''}
                <p><strong>Rapor Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
            </div>
        </div>

        <div class="parties">
            <div class="party">
                <h3>Cari Bilgileri:</h3>
                <p><strong>${data.contactName}</strong></p>
                <p>Vergi No: ${data.contactTaxNumber || '-'}</p>
                <p>${data.contactAddress || ''}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Tarih</th>
                    <th>Açıklama</th>
                    <th class="text-right">Borç</th>
                    <th class="text-right">Alacak</th>
                    <th class="text-right">Bakiye</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.length === 0 ? `
                    <tr>
                        <td colspan="5" style="text-align: center; color: #64748b;">Bu dönemde cari hareket bulunmamaktadır.</td>
                    </tr>
                ` : data.items.map(item => `
                    <tr>
                        <td>${item.date}</td>
                        <td>${item.description}</td>
                        <td class="text-right" style="color: #dc2626;">${item.type === 'debt' ? item.amount.toLocaleString('tr-TR') + ' ₺' : '-'}</td>
                        <td class="text-right" style="color: #16a34a;">${item.type === 'credit' ? item.amount.toLocaleString('tr-TR') + ' ₺' : '-'}</td>
                        <td class="text-right" style="font-weight: 600;">${item.balance.toLocaleString('tr-TR')} ₺</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="summary">
            <div class="summary-row">
                <span>Toplam Borç:</span>
                <span style="color: #dc2626; font-weight: 600;">${data.totalDebt.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div class="summary-row">
                <span>Toplam Alacak:</span>
                <span style="color: #16a34a; font-weight: 600;">${data.totalCredit.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div class="summary-row total">
                <span>Net Bakiye:</span>
                <span>${data.netBalance.toLocaleString('tr-TR')} ₺</span>
            </div>
        </div>

        <div class="footer">
            <p>Bu ekstre Muhasebe Cepte üzerinden elektronik olarak üretilmiştir.</p>
        </div>
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
    console.error('Cari Ekstre PDF hatası:', error);
    throw error;
  }
}

export const printInvoice = (invoiceData, restaurant, invoiceType) => {
  const printWindow = window.open('', 'Print Invoice', 'height=600,width=400');
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${invoiceData.orderNumber}</title>
      <style>
        body { 
          font-family: 'Courier New', monospace; 
          max-width: 80mm; 
          margin: 0 auto; 
          padding: 10px;
          font-size: 12px;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .dashed { border-top: 2px dashed #999; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; border-bottom: 1px solid #999; padding: 5px 0; }
        td { padding: 3px 0; }
        .right { text-align: right; }
        .total { font-size: 14px; font-weight: bold; }
        @media print {
          body { margin: 0; padding: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="center">
        <h1>${restaurant?.name || "Restaurant"}</h1>
        ${restaurant?.address ? `<p>${restaurant.address}</p>` : ''}
        ${restaurant?.phone ? `<p>Tel: ${restaurant.phone}</p>` : ''}
        ${invoiceType === 'vat' && restaurant?.taxId ? `<p>Tax ID: ${restaurant.taxId}</p>` : ''}
      </div>
      <div class="dashed"></div>
      <div class="center">
        <h2>${invoiceType === 'vat' ? 'VAT INVOICE' : invoiceType === 'temporary' ? 'TEMPORARY RECEIPT' : 'INVOICE'}</h2>
        <p>No: ${invoiceData.orderNumber || `ORD-${Date.now()}`}</p>
        <p>${invoiceData.date ? new Date(invoiceData.date).toLocaleString('en-US') : new Date().toLocaleString('en-US')}</p>
      </div>

      ${invoiceData.customerInfo?.name || invoiceData.customerInfo?.phone ? `
        <div>
          <p>Customer: ${invoiceData.customerInfo.name || 'Walk-in'}</p>
          ${invoiceData.customerInfo.phone ? `<p>Phone: ${invoiceData.customerInfo.phone}</p>` : ''}
        </div>
      ` : ''}

      <div class="dashed"></div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th class="center">Qty</th>
            <th class="right">Price</th>
            <th class="right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceData.items?.map(item => {
            const itemTotal = (Number(item.price ?? 0) + Number(item.modifierTotal ?? 0)) * Number(item.quantity ?? 0);
            return `
              <tr>
                <td>${item.name}${item.notes ? `<br><i style="font-size:10px">Notes: ${item.notes}</i>` : ''}</td>
                <td class="center">${item.quantity}</td>
                <td class="right">$${Number(item.price ?? 0).toFixed(2)}</td>
                <td class="right">$${itemTotal.toFixed(2)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="dashed"></div>

      <table>
        <tr>
          <td>Subtotal:</td>
          <td class="right">$${Number(invoiceData.subtotal ?? 0).toFixed(2)}</td>
        </tr>

        ${invoiceData.discount > 0 ? `
          <tr style="color: green;">
            <td>Discount:</td>
            <td class="right">-$${Number(invoiceData.discount ?? 0).toFixed(2)}</td>
          </tr>
        ` : ''}

        ${invoiceData.taxAmount > 0 ? `
          <tr>
            <td>Tax ${invoiceData.taxRate ? `(${(invoiceData.taxRate * 100).toFixed(0)}%)` : ''}:</td>
            <td class="right">$${Number(invoiceData.taxAmount ?? 0).toFixed(2)}</td>
          </tr>
        ` : ''}

        <tr class="total">
          <td>TOTAL:</td>
          <td class="right">$${Number(invoiceData.total ?? 0).toFixed(2)}</td>
        </tr>
      </table>

      <div class="dashed"></div>
      <div class="center">
        <p class="bold">THANK YOU!</p>
        <p>Please come again!</p>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

export const printKitchenOrder = (orderData) => {
  const printWindow = window.open('', 'Kitchen Order', 'height=600,width=400');
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Kitchen Order - ${orderData.tableName || 'Order'}</title>
      <style>
        body { 
          font-family: 'Courier New', monospace; 
          max-width: 80mm; 
          margin: 0 auto; 
          padding: 10px;
          font-size: 14px;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .large { font-size: 18px; }
        .dashed { border-top: 2px dashed #999; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 5px 0; }
        .item-name { font-weight: bold; font-size: 16px; }
        .modifier { padding-left: 20px; font-size: 12px; }
        .notes { padding-left: 20px; font-style: italic; font-size: 12px; background: #f0f0f0; padding: 5px; margin: 5px 0; }
        @media print {
          body { margin: 0; padding: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="center bold large">
        🍳 KITCHEN ORDER
      </div>
      <div class="dashed"></div>
      <div class="bold">
        <p>Table: ${orderData.tableName || 'N/A'}</p>
        ${orderData.restaurantName ? `<p>Restaurant: ${orderData.restaurantName}</p>` : ''}
        <p>Time: ${new Date().toLocaleTimeString('en-US')}</p>
      </div>
      <div class="dashed"></div>

      <table>
        <tbody>
          ${orderData.items?.map(item => `
            <tr>
              <td class="item-name">${item.quantity}x ${item.name}</td>
            </tr>
            ${item.selectedModifiers && item.selectedModifiers.length > 0 ? 
              item.selectedModifiers.map(mod => `
                <tr>
                  <td class="modifier">+ ${mod.name}</td>
                </tr>
              `).join('') 
            : ''}
            ${item.notes ? `
              <tr>
                <td class="notes">📝 ${item.notes}</td>
              </tr>
            ` : ''}
            <tr><td style="padding-bottom: 10px;"></td></tr>
          `).join('')}
        </tbody>
      </table>

      <div class="dashed"></div>

      <div class="center">
        <p>Total items: ${
          orderData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
        }</p>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

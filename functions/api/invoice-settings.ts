// In-memory invoice settings (demo)
function getSettingsStore() {
  const g: any = globalThis as any;
  if (!g.__INVOICE_SETTINGS__) {
    g.__INVOICE_SETTINGS__ = {
      id: 1,
      companyName: 'OCUS Job Hunter',
      companyAddress: '',
      companyPhone: '',
      companyEmail: '',
      companyWebsite: '',
      taxNumber: '',
      invoicePrefix: 'INV',
      receiptPrefix: 'REC',
      invoiceNotes: '',
      termsAndConditions: '',
      footerText: 'Thank you for your business!'
        ,
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      updatedAt: new Date().toISOString(),
    };
  }
  return g.__INVOICE_SETTINGS__ as any;
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const onRequestGet = async () => {
  const settings = getSettingsStore();
  // Return only fields used by UI
  const ui = {
    id: settings.id,
    companyName: settings.companyName,
    companyAddress: settings.companyAddress,
    companyPhone: settings.companyPhone,
    companyEmail: settings.companyEmail,
    companyWebsite: settings.companyWebsite,
    taxNumber: settings.taxNumber,
    invoicePrefix: settings.invoicePrefix,
    receiptPrefix: settings.receiptPrefix,
    invoiceNotes: settings.invoiceNotes,
    termsAndConditions: settings.termsAndConditions,
    footerText: settings.footerText,
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
  };
  return json(ui);
};

export const onRequestPut = async ({ request }: any) => {
  try {
    const body = await request.json().catch(() => ({}));
    const store = getSettingsStore();

    const allowedKeys = [
      'companyName',
      'companyAddress',
      'companyPhone',
      'companyEmail',
      'companyWebsite',
      'taxNumber',
      'invoicePrefix',
      'receiptPrefix',
      'invoiceNotes',
      'termsAndConditions',
      'footerText',
      'primaryColor',
      'secondaryColor',
    ];

    for (const k of allowedKeys) {
      if (k in body) store[k] = body[k];
    }
    store.updatedAt = new Date().toISOString();

    return json({ ...store });
  } catch (e) {
    return json({ success: false, message: 'Failed to update settings' }, 500);
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

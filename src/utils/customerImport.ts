import readXlsxFile from 'read-excel-file/browser';
import { CustomerImportRow } from '../services/api';

type CellValue = string | number | boolean | Date | null | undefined;

const DEFAULT_FIELDS: Array<keyof CustomerImportRow | null> = [
  'name',
  'email',
  'phone',
  'plan',
  'order_id',
  'complaint',
  'resolution',
  'issue_category',
  'priority',
  'sentiment',
  'interaction_date',
];

const HEADER_ALIASES: Record<string, keyof CustomerImportRow> = {
  name: 'name',
  customer: 'name',
  customername: 'name',
  fullname: 'name',
  client: 'name',
  email: 'email',
  mail: 'email',
  customeremail: 'email',
  phone: 'phone',
  mobile: 'phone',
  contact: 'phone',
  plan: 'plan',
  tier: 'plan',
  subscription: 'plan',
  order: 'order_id',
  orderid: 'order_id',
  ticket: 'order_id',
  ticketid: 'order_id',
  complaint: 'complaint',
  complain: 'complaint',
  issue: 'complaint',
  problem: 'complaint',
  query: 'complaint',
  message: 'complaint',
  previouscomplaint: 'complaint',
  resolution: 'resolution',
  response: 'resolution',
  resolved: 'resolution',
  previousresolution: 'resolution',
  category: 'issue_category',
  issuecategory: 'issue_category',
  type: 'issue_category',
  priority: 'priority',
  severity: 'priority',
  urgency: 'priority',
  sentiment: 'sentiment',
  mood: 'sentiment',
  repeat: 'repeat_issue_flag',
  repeatissue: 'repeat_issue_flag',
  repeatissueflag: 'repeat_issue_flag',
  date: 'interaction_date',
  interactiondate: 'interaction_date',
  lastinteractiondate: 'interaction_date',
  createdat: 'interaction_date',
  avatar: 'avatar_url',
  avatarurl: 'avatar_url',
};

function normalizeHeader(value: CellValue) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function cellToText(value: CellValue) {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? '').trim();
}

function toBoolean(value: CellValue) {
  const text = cellToText(value).toLowerCase();
  return ['true', 'yes', 'y', '1', 'repeat', 'repeated'].includes(text);
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(field.trim());
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function getFieldMap(headerRow: CellValue[]) {
  const fields = headerRow.map((cell) => HEADER_ALIASES[normalizeHeader(cell)] || null);
  const recognized = fields.filter(Boolean).length;
  return {
    hasHeader: recognized >= 2 || fields.includes('complaint') || fields.includes('email'),
    fields,
  };
}

function normalizePlan(value: CellValue) {
  const text = cellToText(value).toLowerCase();
  if (text.includes('enterprise') || text === 'vip') return 'Enterprise';
  if (text.includes('growth') || text === 'pro' || text === 'business') return 'Growth';
  return cellToText(value) ? 'Starter' : undefined;
}

function normalizePriority(value: CellValue) {
  const text = cellToText(value).toLowerCase();
  if (['urgent', 'critical', 'p0', 'blocker'].includes(text)) return 'urgent';
  if (['high', 'p1'].includes(text)) return 'high';
  if (['low', 'p3'].includes(text)) return 'low';
  return cellToText(value) ? 'medium' : undefined;
}

function assignTextField(output: CustomerImportRow, field: keyof CustomerImportRow, value: string) {
  switch (field) {
    case 'name':
      output.name = value;
      break;
    case 'email':
      output.email = value;
      break;
    case 'phone':
      output.phone = value;
      break;
    case 'order_id':
      output.order_id = value;
      break;
    case 'avatar_url':
      output.avatar_url = value;
      break;
    case 'complaint':
      output.complaint = value;
      break;
    case 'resolution':
      output.resolution = value;
      break;
    case 'issue_category':
      output.issue_category = value;
      break;
    case 'sentiment':
      output.sentiment = value;
      break;
    case 'interaction_date':
      output.interaction_date = value;
      break;
    default:
      break;
  }
}

export async function parseCustomerImportFile(file: File): Promise<CustomerImportRow[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let table: CellValue[][];

  if (extension === 'csv') {
    table = parseCsv(await file.text());
  } else if (extension === 'xlsx') {
    table = (await readXlsxFile(file)) as CellValue[][];
  } else {
    throw new Error('Upload a .xlsx or .csv file with customer complaint rows.');
  }

  const nonEmptyRows = table.filter((row) => row.some((cell) => cellToText(cell)));
  if (nonEmptyRows.length === 0) {
    throw new Error('The uploaded file is empty.');
  }

  const { hasHeader, fields: detectedFields } = getFieldMap(nonEmptyRows[0]);
  const fields = hasHeader ? detectedFields : DEFAULT_FIELDS;
  const dataRows = hasHeader ? nonEmptyRows.slice(1) : nonEmptyRows;
  const rowOffset = hasHeader ? 2 : 1;

  const parsed = dataRows.map((row, index) => {
    const output: CustomerImportRow = { row_index: index + rowOffset };

    fields.forEach((field, columnIndex) => {
      if (!field) return;
      const value = row[columnIndex];
      if (field === 'repeat_issue_flag') {
        output.repeat_issue_flag = toBoolean(value);
      } else if (field === 'plan') {
        output.plan = normalizePlan(value);
      } else if (field === 'priority') {
        output.priority = normalizePriority(value);
      } else {
        const text = cellToText(value);
        if (text) assignTextField(output, field, text);
      }
    });

    return output;
  });

  return parsed
    .filter((row) => row.name || row.email || row.complaint)
    .slice(0, 500);
}

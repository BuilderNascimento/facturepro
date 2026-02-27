import fs from 'fs';
import path from 'path';
import type { Client, Service, Invoice, InvoiceItem } from '@/lib/types/database';
import type { Property } from '@/lib/types/database';

interface DemoStore {
  clients: Client[];
  services: Service[];
  invoices: (Invoice & { clients: Client | null })[];
  invoice_items: InvoiceItem[];
  properties: Property[];
  invoice_sequence: Record<number, number>;
}

const STORE_PATH = path.join(process.cwd(), '.demo-store.json');

function loadStore(): DemoStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
  } catch {}
  return {
    clients: [],
    services: [],
    invoices: [],
    invoice_items: [],
    properties: [],
    invoice_sequence: {},
  };
}

function saveStore(store: DemoStore): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

// ── Clients ──────────────────────────────────────────────
export function storeGetClients(): Client[] {
  return loadStore().clients;
}

export function storeGetClient(id: string): Client | null {
  return loadStore().clients.find((c) => c.id === id) ?? null;
}

export function storeCreateClient(data: Omit<Client, 'id' | 'created_at'>): Client {
  const store = loadStore();
  const client: Client = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  store.clients.push(client);
  saveStore(store);
  return client;
}

export function storeUpdateClient(id: string, data: Partial<Omit<Client, 'id' | 'created_at'>>): Client | null {
  const store = loadStore();
  const idx = store.clients.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  store.clients[idx] = { ...store.clients[idx], ...data };
  saveStore(store);
  return store.clients[idx];
}

export function storeDeleteClient(id: string): boolean {
  const store = loadStore();
  const idx = store.clients.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  store.clients.splice(idx, 1);
  saveStore(store);
  return true;
}

// ── Services ─────────────────────────────────────────────
export function storeGetServices(): Service[] {
  return loadStore().services;
}

export function storeGetService(id: string): Service | null {
  return loadStore().services.find((s) => s.id === id) ?? null;
}

export function storeCreateService(data: Omit<Service, 'id' | 'created_at'>): Service {
  const store = loadStore();
  const service: Service = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  store.services.push(service);
  saveStore(store);
  return service;
}

export function storeUpdateService(id: string, data: Partial<Omit<Service, 'id' | 'created_at'>>): Service | null {
  const store = loadStore();
  const idx = store.services.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  store.services[idx] = { ...store.services[idx], ...data };
  saveStore(store);
  return store.services[idx];
}

export function storeDeleteService(id: string): boolean {
  const store = loadStore();
  const idx = store.services.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  store.services.splice(idx, 1);
  saveStore(store);
  return true;
}

// ── Properties ───────────────────────────────────────────
export function storeGetProperties(): (Property & { clients: Client | null })[] {
  const store = loadStore();
  return store.properties.map((p) => ({
    ...p,
    clients: store.clients.find((c) => c.id === p.client_id) ?? null,
  }));
}

export function storeGetProperty(id: string): (Property & { clients: Client | null }) | null {
  const store = loadStore();
  const prop = store.properties.find((p) => p.id === id);
  if (!prop) return null;
  return { ...prop, clients: store.clients.find((c) => c.id === prop.client_id) ?? null };
}

export function storeGetPropertiesByClient(clientId: string): Property[] {
  return loadStore().properties.filter((p) => p.client_id === clientId);
}

export function storeCreateProperty(data: Omit<Property, 'id' | 'created_at'>): Property {
  const store = loadStore();
  const property: Property = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  store.properties.push(property);
  saveStore(store);
  return property;
}

export function storeUpdateProperty(id: string, data: Partial<Omit<Property, 'id' | 'created_at'>>): Property | null {
  const store = loadStore();
  const idx = store.properties.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  store.properties[idx] = { ...store.properties[idx], ...data };
  saveStore(store);
  return store.properties[idx];
}

export function storeDeleteProperty(id: string): boolean {
  const store = loadStore();
  const idx = store.properties.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  store.properties.splice(idx, 1);
  saveStore(store);
  return true;
}

// ── Invoices ─────────────────────────────────────────────
export function storeGetInvoices(): (Invoice & { clients: Client | null })[] {
  const store = loadStore();
  return store.invoices
    .filter((inv) => !inv.deleted_at)
    .map((inv) => ({
      ...inv,
      clients: store.clients.find((c) => c.id === inv.client_id) ?? null,
    }));
}

export function storeGetInvoice(id: string): (Invoice & { clients: Client | null; invoice_items: InvoiceItem[] }) | null {
  const store = loadStore();
  const invoice = store.invoices.find((inv) => inv.id === id && !inv.deleted_at);
  if (!invoice) return null;
  return {
    ...invoice,
    clients: store.clients.find((c) => c.id === invoice.client_id) ?? null,
    invoice_items: store.invoice_items.filter((item) => item.invoice_id === id),
  };
}

export function storeGetNextInvoiceNumber(): string {
  const store = loadStore();
  const year = new Date().getFullYear();
  const current = store.invoice_sequence[year] ?? 0;
  const next = current + 1;
  store.invoice_sequence[year] = next;
  saveStore(store);
  return `${year}-${String(next).padStart(4, '0')}`;
}

export function storeCreateInvoice(
  invoiceData: Omit<Invoice, 'id' | 'created_at' | 'deleted_at' | 'pdf_url'>,
  items: Omit<InvoiceItem, 'id' | 'invoice_id'>[],
): Invoice {
  const store = loadStore();
  const id = crypto.randomUUID();
  const invoice: Invoice = {
    ...invoiceData,
    id,
    created_at: new Date().toISOString(),
    deleted_at: null,
    pdf_url: null,
  };
  const invoiceItems: InvoiceItem[] = items.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
    invoice_id: id,
  }));
  store.invoices.push({ ...invoice, clients: null });
  store.invoice_items.push(...invoiceItems);
  saveStore(store);
  return invoice;
}

export function storeUpdateInvoice(
  id: string,
  invoiceData: Partial<Omit<Invoice, 'id' | 'created_at' | 'deleted_at'>>,
  items?: Omit<InvoiceItem, 'id' | 'invoice_id'>[],
): Invoice | null {
  const store = loadStore();
  const idx = store.invoices.findIndex((inv) => inv.id === id);
  if (idx === -1) return null;
  store.invoices[idx] = { ...store.invoices[idx], ...invoiceData };
  if (items) {
    store.invoice_items = store.invoice_items.filter((item) => item.invoice_id !== id);
    store.invoice_items.push(
      ...items.map((item) => ({ ...item, id: crypto.randomUUID(), invoice_id: id })),
    );
  }
  saveStore(store);
  return store.invoices[idx];
}

export function storeSoftDeleteInvoice(id: string): boolean {
  const store = loadStore();
  const idx = store.invoices.findIndex((inv) => inv.id === id);
  if (idx === -1) return false;
  store.invoices[idx].deleted_at = new Date().toISOString();
  saveStore(store);
  return true;
}

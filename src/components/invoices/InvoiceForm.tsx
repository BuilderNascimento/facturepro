'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { Plus, Trash2, CalendarDays, Sparkles, Car, Clock, Package, Building2, X, HardHat, Info, Plane } from 'lucide-react';
import { CaveTasksSection, emptyCaveTasks, type CaveTaskState } from '@/components/invoices/CaveTasksSection';
import { ExtraPersonnelSection } from '@/components/invoices/ExtraPersonnelSection';
import {
  buildApartmentDeplacementDescription,
  buildCaveDescription,
  buildMenageSejourDescription,
  FR,
  TARIF,
} from '@/lib/invoice-french-services';
import { formatDateLabel } from '@/lib/invoice-form-utils';
import {
  buildExtraPersonnelDescription,
  type ExtraPersonnelEntryInput,
} from '@/lib/extra-personnel';
import { invoiceSchema } from '@/lib/validations/schemas';
import { getNormalCleaningLabel, isVeryStayClient, isVeryStayInvoiceContext } from '@/lib/cleaning-labels';
import { formatPropertyOptionLabel, getVeryStayPropertyVisual } from '@/lib/verystay-property-visuals';
import { VeryStayColorLegend, VeryStayPropertyPicker } from '@/components/invoices/VeryStayPropertyPicker';

interface Client { id: string; company_name: string; email: string | null; }
interface Property {
  id: string;
  client_id: string;
  name: string;
  normal_price: number;
  extra_price: number;
  clients?: { company_name: string } | null;
}

interface CleaningEntry { date: string; }
interface StayDuringEntry { date: string; description: string; hours: number; amountTtc: number; }
interface ApartmentDisplacementEntry { enabled: boolean; date: string; description: string; }
interface DisplacementEntry { description: string; amount: number; }
interface ExtraHourEntry { description: string; hours: number; rate: number; }
interface OtherItem { description: string; quantity: number; unit_price: number; }
interface WorkDayEntry { date: string; description: string; hours: number; rate: number; }

interface ApartmentBlock {
  key: string;
  propertyId: string;
  normalDates: CleaningEntry[];
  extraDates: CleaningEntry[];
  stayCleanings: StayDuringEntry[];
  apartmentDisplacements: ApartmentDisplacementEntry[];
}

function emptyApartmentBlock(): ApartmentBlock {
  return {
    key: newKey(),
    propertyId: '',
    normalDates: [],
    extraDates: [],
    stayCleanings: [],
    apartmentDisplacements: [{ enabled: false, date: '', description: '' }],
  };
}

interface InvoiceFormProps {
  invoice?: {
    id: string;
    invoice_number: string;
    client_id: string;
    issue_date: string;
    due_date: string;
    status: string;
    tva_rate?: number;
    description?: string | null;
    items: { service_id: string | null; description: string; quantity: number; unit_price: number }[];
  };
  clients?: Client[];
  properties?: Property[];
  nextNumber?: string;
}

const INPUT = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm';
const LABEL = 'block text-sm font-medium text-slate-700 mb-1';

function SectionHeader({ icon, title, color, tooltip }: { icon: React.ReactNode; title: string; color: string; tooltip?: string }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-t-lg ${color}`}>
      {icon}
      <h3 className="font-semibold text-sm">{title}</h3>
      {tooltip && (
        <span className="ml-auto text-xs text-slate-500 italic hidden sm:block">{tooltip}</span>
      )}
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-1.5 text-xs text-slate-500 mt-1.5">
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
      {text}
    </p>
  );
}

let blockCounter = 0;
let personnelCounter = 0;
function newKey() { return `block-${++blockCounter}`; }
function newPersonnelKey() { return `personnel-${++personnelCounter}`; }

type Mode = 'property' | 'client' | 'obras';

export function InvoiceForm({ invoice, clients = [], properties = [], nextNumber: initialNextNumber }: InvoiceFormProps) {
  const router = useRouter();
  const [nextNumber, setNextNumber] = useState(initialNextNumber ?? '');

  // When editing an existing invoice, default to 'client' mode to avoid empty block validation
  const [mode, setMode] = useState<Mode>(invoice ? 'client' : 'property');

  const [clientId, setClientId] = useState(invoice?.client_id ?? '');
  const [apartmentBlocks, setApartmentBlocks] = useState<ApartmentBlock[]>([emptyApartmentBlock()]);
  const [caveTasks, setCaveTasks] = useState<CaveTaskState>(emptyCaveTasks());
  const [directClientId, setDirectClientId] = useState(invoice?.client_id ?? '');

  const [issueDate, setIssueDate] = useState(invoice?.issue_date ?? format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(invoice?.due_date ?? format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [status, setStatus] = useState(invoice?.status ?? 'draft');
  const [tvaRate, setTvaRate] = useState<number>(invoice?.tva_rate ?? 0);
  const [invoiceDescription, setInvoiceDescription] = useState<string>(invoice?.description ?? '');

  const [displacements, setDisplacements] = useState<DisplacementEntry[]>([]);
  const [extraHours, setExtraHours] = useState<ExtraHourEntry[]>([]);
  const [otherItems, setOtherItems] = useState<OtherItem[]>([]);
  const [workDays, setWorkDays] = useState<WorkDayEntry[]>([{ date: '', description: '', hours: 8, rate: 0 }]);
  const [extraPersonnel, setExtraPersonnel] = useState<ExtraPersonnelEntryInput[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoice?.items?.length) {
      setOtherItems(
        invoice.items.map((i) => ({ description: i.description, quantity: i.quantity, unit_price: i.unit_price }))
      );
    }
  }, [invoice]);

  useEffect(() => {
    if (!invoice && !initialNextNumber) {
      fetch('/api/invoices/next-number', { method: 'POST' })
        .then((r) => r.json())
        .then((d) => d.invoice_number && setNextNumber(d.invoice_number))
        .catch(() => {});
    }
  }, [invoice, initialNextNumber]);

  const clientApartments = properties.filter((p) => p.client_id === clientId);
  const selectedClient = clients.find((c) => c.id === clientId);
  const isVeryStay = isVeryStayInvoiceContext(selectedClient?.company_name, clientApartments);
  const billingClientId = mode === 'property' ? clientId : directClientId;
  const billingProperties = properties.filter((p) => p.client_id === billingClientId);

  function addApartmentBlock() {
    setApartmentBlocks((prev) => [...prev, emptyApartmentBlock()]);
  }
  function removeApartmentBlock(key: string) {
    setApartmentBlocks((prev) => prev.filter((b) => b.key !== key));
  }
  function updateBlockProperty(key: string, propertyId: string) {
    setApartmentBlocks((prev) => prev.map((b) => b.key === key ? { ...b, propertyId } : b));
  }
  function addNormalDate(key: string) {
    setApartmentBlocks((prev) => prev.map((b) => b.key === key ? { ...b, normalDates: [...b.normalDates, { date: '' }] } : b));
  }
  function removeNormalDate(key: string, i: number) {
    setApartmentBlocks((prev) => prev.map((b) => b.key === key ? { ...b, normalDates: b.normalDates.filter((_, idx) => idx !== i) } : b));
  }
  function updateNormalDate(key: string, i: number, date: string) {
    setApartmentBlocks((prev) => prev.map((b) => {
      if (b.key !== key) return b;
      const nd = [...b.normalDates]; nd[i] = { date }; return { ...b, normalDates: nd };
    }));
  }
  function addExtraDate(key: string) {
    setApartmentBlocks((prev) => prev.map((b) => b.key === key ? { ...b, extraDates: [...b.extraDates, { date: '' }] } : b));
  }
  function removeExtraDate(key: string, i: number) {
    setApartmentBlocks((prev) => prev.map((b) => b.key === key ? { ...b, extraDates: b.extraDates.filter((_, idx) => idx !== i) } : b));
  }
  function updateExtraDate(key: string, i: number, date: string) {
    setApartmentBlocks((prev) => prev.map((b) => {
      if (b.key !== key) return b;
      const ed = [...b.extraDates]; ed[i] = { date }; return { ...b, extraDates: ed };
    }));
  }

  function addStayCleaning(key: string) {
    setApartmentBlocks((prev) =>
      prev.map((b) =>
        b.key === key
          ? { ...b, stayCleanings: [...b.stayCleanings, { date: '', description: '', hours: 2, amountTtc: 0 }] }
          : b
      )
    );
  }
  function removeStayCleaning(key: string, i: number) {
    setApartmentBlocks((prev) =>
      prev.map((b) =>
        b.key === key ? { ...b, stayCleanings: b.stayCleanings.filter((_, idx) => idx !== i) } : b
      )
    );
  }
  function updateStayCleaning(
    key: string,
    i: number,
    field: keyof StayDuringEntry,
    value: string | number
  ) {
    setApartmentBlocks((prev) =>
      prev.map((b) => {
        if (b.key !== key) return b;
        const list = [...b.stayCleanings];
        list[i] = { ...list[i], [field]: value };
        return { ...b, stayCleanings: list };
      })
    );
  }

  function addApartmentDisplacement(key: string) {
    setApartmentBlocks((prev) =>
      prev.map((b) =>
        b.key === key
          ? {
              ...b,
              apartmentDisplacements: [
                ...b.apartmentDisplacements,
                { enabled: false, date: '', description: '' },
              ],
            }
          : b
      )
    );
  }
  function removeApartmentDisplacement(key: string, i: number) {
    setApartmentBlocks((prev) =>
      prev.map((b) => {
        if (b.key !== key) return b;
        const next = b.apartmentDisplacements.filter((_, idx) => idx !== i);
        return {
          ...b,
          apartmentDisplacements: next.length
            ? next
            : [{ enabled: false, date: '', description: '' }],
        };
      })
    );
  }
  function updateApartmentDisplacement(
    key: string,
    i: number,
    field: keyof ApartmentDisplacementEntry,
    value: string | number | boolean
  ) {
    setApartmentBlocks((prev) =>
      prev.map((b) => {
        if (b.key !== key) return b;
        const list = [...b.apartmentDisplacements];
        list[i] = { ...list[i], [field]: value };
        return { ...b, apartmentDisplacements: list };
      })
    );
  }

  function addDisplacement() { setDisplacements((p) => [...p, { description: '', amount: 0 }]); }
  function removeDisplacement(i: number) { setDisplacements((p) => p.filter((_, idx) => idx !== i)); }
  function updateDisplacement(i: number, field: keyof DisplacementEntry, value: string | number) {
    setDisplacements((p) => { const n = [...p]; n[i] = { ...n[i], [field]: value }; return n; });
  }

  function addExtraHour() { setExtraHours((p) => [...p, { description: '', hours: 1, rate: 0 }]); }
  function removeExtraHour(i: number) { setExtraHours((p) => p.filter((_, idx) => idx !== i)); }
  function updateExtraHour(i: number, field: keyof ExtraHourEntry, value: string | number) {
    setExtraHours((p) => { const n = [...p]; n[i] = { ...n[i], [field]: value }; return n; });
  }

  function addOtherItem() { setOtherItems((p) => [...p, { description: '', quantity: 1, unit_price: 0 }]); }
  function removeOtherItem(i: number) { setOtherItems((p) => p.filter((_, idx) => idx !== i)); }
  function updateOtherItem(i: number, field: keyof OtherItem, value: string | number) {
    setOtherItems((p) => { const n = [...p]; n[i] = { ...n[i], [field]: value }; return n; });
  }

  function addWorkDay() { setWorkDays((p) => [...p, { date: '', description: '', hours: 8, rate: 0 }]); }
  function removeWorkDay(i: number) { setWorkDays((p) => p.filter((_, idx) => idx !== i)); }
  function updateWorkDay(i: number, field: keyof WorkDayEntry, value: string | number) {
    setWorkDays((p) => { const n = [...p]; n[i] = { ...n[i], [field]: value }; return n; });
  }

  function addExtraPersonnelEntry() {
    setExtraPersonnel((p) => [
      ...p,
      {
        key: newPersonnelKey(),
        assignments: [{ propertyId: '', propertyName: '', hours: 0 }],
        amountTtc: 0,
      },
    ]);
  }
  function removeExtraPersonnelEntry(key: string) {
    setExtraPersonnel((p) => p.filter((e) => e.key !== key));
  }
  function updateExtraPersonnelAmount(key: string, amountTtc: number) {
    setExtraPersonnel((p) => p.map((e) => (e.key === key ? { ...e, amountTtc } : e)));
  }
  function addPersonnelAssignment(entryKey: string) {
    setExtraPersonnel((p) =>
      p.map((e) =>
        e.key === entryKey
          ? {
              ...e,
              assignments: [...e.assignments, { propertyId: '', propertyName: '', hours: 0 }],
            }
          : e
      )
    );
  }
  function removePersonnelAssignment(entryKey: string, index: number) {
    setExtraPersonnel((p) =>
      p.map((e) => {
        if (e.key !== entryKey) return e;
        const next = e.assignments.filter((_, i) => i !== index);
        return {
          ...e,
          assignments: next.length ? next : [{ propertyId: '', propertyName: '', hours: 0 }],
        };
      })
    );
  }
  function updatePersonnelAssignment(
    entryKey: string,
    index: number,
    field: 'propertyId' | 'hours',
    value: string | number
  ) {
    setExtraPersonnel((p) =>
      p.map((e) => {
        if (e.key !== entryKey) return e;
        const assignments = [...e.assignments];
        const row = { ...assignments[index] };
        if (field === 'propertyId') {
          const prop = properties.find((pr) => pr.id === value);
          row.propertyId = String(value);
          row.propertyName = prop?.name ?? '';
        } else {
          row.hours = Number(value) || 0;
        }
        assignments[index] = row;
        return { ...e, assignments };
      })
    );
  }

  function buildItems() {
    const items: { service_id: null; description: string; quantity: number; unit_price: number }[] = [];

    if (mode === 'property') {
      for (const block of apartmentBlocks) {
        const prop = properties.find((p) => p.id === block.propertyId);
        const aptName = prop?.name ?? '';
        const normalPrice = Number(prop?.normal_price ?? 0);
        const extraPrice = Number(prop?.extra_price ?? 0);
        const propClient = prop ? clients.find((c) => c.id === prop.client_id) : selectedClient;
        const clientLabelName = propClient?.company_name ?? selectedClient?.company_name;
        const validNormal = block.normalDates.filter((d) => d.date);
        if (validNormal.length > 0) {
          const dateList = validNormal.map((d) => formatDateLabel(d.date)).join(', ');
          const lineLabel = getNormalCleaningLabel(clientLabelName);
          items.push({
            service_id: null,
            description: aptName ? `${lineLabel} — ${aptName} — ${dateList}` : `${lineLabel} — ${dateList}`,
            quantity: validNormal.length,
            unit_price: normalPrice,
          });
        }
        const validExtra = block.extraDates.filter((d) => d.date);
        if (validExtra.length > 0) {
          const dateList = validExtra.map((d) => formatDateLabel(d.date)).join(', ');
          const extraLabel = isVeryStayClient(clientLabelName)
            ? 'Ménage extra'
            : 'Nettoyage extra';
          items.push({
            service_id: null,
            description: aptName ? `${extraLabel} — ${aptName} — ${dateList}` : `${extraLabel} — ${dateList}`,
            quantity: validExtra.length,
            unit_price: extraPrice,
          });
        }

        block.stayCleanings.forEach((s) => {
          if (!s.date || !aptName) return;
          const amount = Number(s.amountTtc) || 0;
          if (amount <= 0) return;
          items.push({
            service_id: null,
            description: buildMenageSejourDescription(
              aptName,
              formatDateLabel(s.date),
              s.description,
              Number(s.hours) || 0,
              amount
            ),
            quantity: 1,
            unit_price: amount,
          });
        });

        block.apartmentDisplacements.forEach((d) => {
          if (!d.enabled || !d.date || !aptName) return;
          items.push({
            service_id: null,
            description: buildApartmentDeplacementDescription(
              aptName,
              formatDateLabel(d.date),
              d.description
            ),
            quantity: 1,
            unit_price: TARIF.deplacementTtc,
          });
        });
      }
    }

    if (caveTasks.rambuteau.enabled && caveTasks.rambuteau.date) {
      items.push({
        service_id: null,
        description: buildCaveDescription(FR.caveRambuteau, formatDateLabel(caveTasks.rambuteau.date)),
        quantity: 1,
        unit_price: TARIF.caveTtc,
      });
    }
    if (caveTasks.papin.enabled && caveTasks.papin.date) {
      items.push({
        service_id: null,
        description: buildCaveDescription(FR.cavePapin, formatDateLabel(caveTasks.papin.date)),
        quantity: 1,
        unit_price: TARIF.caveTtc,
      });
    }

    if (mode === 'obras') {
      workDays.forEach((day) => {
        if (day.date || day.description || day.rate > 0) {
          const dateLabel = day.date ? formatDateLabel(day.date) : '';
          items.push({
            service_id: null,
            description: [
              'Prestation de services',
              day.description || null,
              dateLabel || null,
            ].filter(Boolean).join(' — '),
            quantity: day.hours || 1,
            unit_price: day.rate,
          });
        }
      });
    }

    displacements.forEach((d) => {
      if (d.description || d.amount > 0) {
        items.push({
          service_id: null,
          description: `Déplacement${d.description ? ' — ' + d.description : ''}`,
          quantity: 1,
          unit_price: d.amount,
        });
      }
    });

    extraHours.forEach((h) => {
      if (h.hours > 0 || h.description) {
        items.push({
          service_id: null,
          description: `Heures supplémentaires${h.description ? ' — ' + h.description : ''}`,
          quantity: h.hours || 1,
          unit_price: h.rate,
        });
      }
    });

    otherItems.forEach((o) => {
      if (o.description.trim()) {
        items.push({ service_id: null, description: o.description, quantity: o.quantity, unit_price: o.unit_price });
      }
    });

    extraPersonnel.forEach((entry, index) => {
      const valid = entry.assignments.filter((a) => a.propertyName && a.hours > 0);
      const amount = Number(entry.amountTtc) || 0;
      if (valid.length === 0 && amount <= 0) return;
      items.push({
        service_id: null,
        description: buildExtraPersonnelDescription(index, valid, amount),
        quantity: 1,
        unit_price: amount,
      });
    });

    return items;
  }

  const totalHt = (() => {
    let t = 0;
    if (mode === 'property') {
      for (const block of apartmentBlocks) {
        const prop = properties.find((p) => p.id === block.propertyId);
        t += block.normalDates.filter((d) => d.date).length * Number(prop?.normal_price ?? 0);
        t += block.extraDates.filter((d) => d.date).length * Number(prop?.extra_price ?? 0);
        block.stayCleanings.forEach((s) => { if (s.date) t += Number(s.amountTtc) || 0; });
        block.apartmentDisplacements.forEach((d) => {
          if (d.enabled && d.date) t += TARIF.deplacementTtc;
        });
      }
    }
    if (caveTasks.rambuteau.enabled && caveTasks.rambuteau.date) t += TARIF.caveTtc;
    if (caveTasks.papin.enabled && caveTasks.papin.date) t += TARIF.caveTtc;
    if (mode === 'obras') {
      workDays.forEach((d) => { t += d.hours * d.rate; });
    }
    displacements.forEach((d) => { t += d.amount; });
    extraHours.forEach((h) => { t += h.hours * h.rate; });
    otherItems.forEach((o) => { t += o.quantity * o.unit_price; });
    extraPersonnel.forEach((e) => { t += Number(e.amountTtc) || 0; });
    return t;
  })();

  const totalTva = Math.round(totalHt * tvaRate) / 100;
  const totalTtc = totalHt + totalTva;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const items = buildItems();
    if (!items.length) {
      setError('Adicione pelo menos um item (limpeza, diária, deslocamento ou outro).');
      return;
    }

    const usedClientId = mode === 'property' ? clientId : directClientId;
    if (!usedClientId) {
      setError('Selecione um cliente.');
      return;
    }

    // Only validate blocks when in property mode (not when editing)
    if (mode === 'property' && apartmentBlocks.some((b) => !b.propertyId && (b.normalDates.length > 0 || b.extraDates.length > 0))) {
      setError('Selecione um local para cada bloco com datas, ou remova os blocos vazios.');
      return;
    }

    const raw = {
      client_id: usedClientId,
      issue_date: issueDate,
      due_date: dueDate,
      status,
      tva_rate: tvaRate,
      description: invoiceDescription,
      items,
    };
    const parsed = invoiceSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Dados inválidos');
      return;
    }

    setLoading(true);
    const url = invoice ? `/api/invoices/${invoice.id}` : '/api/invoices';
    const res = await fetch(url, {
      method: invoice ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) { setError(data.error ?? 'Erro no servidor'); return; }
    if (data.id) router.push(`/invoices/${data.id}`);
    else { router.push('/invoices'); router.refresh(); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</p>}

      {/* ── Cabeçalho ── */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Preencha os campos abaixo para criar a sua fatura. Todos os campos com <strong>*</strong> são obrigatórios.</span>
        </div>

        {invoice && (
          <p className="text-slate-600 text-sm">
            <span className="font-medium">N° fatura:</span>{' '}
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{invoice.invoice_number}</span>
          </p>
        )}
        {!invoice && nextNumber && (
          <p className="text-slate-600 text-sm">
            <span className="font-medium">N° fatura:</span>{' '}
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{nextNumber}</span>
          </p>
        )}

        {/* Seletor de modo */}
        {!invoice && (
          <div>
            <label className={LABEL}>Tipo de trabalho *</label>
            <Tip text="Escolha o tipo que melhor descreve o seu serviço. Pode sempre usar 'Livre' para qualquer outro caso." />
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => setMode('property')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${mode === 'property' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <Building2 className="w-4 h-4" /> Limpeza de imóveis
              </button>
              <button
                type="button"
                onClick={() => setMode('obras')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${mode === 'obras' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <HardHat className="w-4 h-4" /> Obras / Diárias
              </button>
              <button
                type="button"
                onClick={() => setMode('client')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${mode === 'client' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <Package className="w-4 h-4" /> Livre / Outros serviços
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seleção cliente */}
          {mode === 'property' ? (
            <div className="md:col-span-2">
              <label className={LABEL}>Cliente *</label>
              <Tip text="Selecione o cliente. Os locais de trabalho registados aparecerão abaixo." />
              <select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setApartmentBlocks([emptyApartmentBlock()]);
                  setCaveTasks(emptyCaveTasks());
                }}
                required={mode === 'property'}
                className={`${INPUT} mt-2`}
              >
                <option value="">Selecionar cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className={invoice ? '' : 'md:col-span-2'}>
              <label className={LABEL}>Cliente *</label>
              <select
                value={directClientId}
                onChange={(e) => setDirectClientId(e.target.value)}
                required
                className={INPUT}
              >
                <option value="">Selecionar cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={LABEL}>Estado</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={INPUT}>
              <option value="draft">Rascunho</option>
              <option value="sent">Enviada</option>
              <option value="paid">Paga</option>
              <option value="overdue">Em atraso</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>TVA</label>
            <Tip text="Maioria dos auto-empreendedores usa 'Sem TVA'. Escolha uma % apenas se tiver TVA ativa." />
            <select value={tvaRate} onChange={(e) => setTvaRate(Number(e.target.value))} className={`${INPUT} mt-2`}>
              <option value={0}>Sem TVA (art. 293B)</option>
              <option value={5.5}>5,5%</option>
              <option value={10}>10%</option>
              <option value={20}>20%</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Data de emissão *</label>
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Data de vencimento *</label>
            <Tip text="Data limite para o cliente efetuar o pagamento." />
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className={`${INPUT} mt-2`} />
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL}>Descrição</label>
          <Tip text="Campo livre para qualquer informação que deve aparecer na fatura (ex.: tipo de serviço, notas, observações)." />
          <textarea
            value={invoiceDescription}
            onChange={(e) => setInvoiceDescription(e.target.value)}
            rows={4}
            placeholder="Escreva aqui qualquer informação adicional…"
            className={`${INPUT} mt-2`}
          />
        </div>
      </div>

      {/* ── Blocos de imóveis (modo limpeza) ── */}
      {mode === 'property' && isVeryStay && clientId && clientApartments.length > 0 && (
        <>
          <VeryStayColorLegend properties={clientApartments} />
        </>
      )}

      {mode === 'property' && (
        <>
          {apartmentBlocks.map((block, blockIndex) => {
            const prop = properties.find((p) => p.id === block.propertyId);
            const visual = prop ? getVeryStayPropertyVisual(prop.name) : null;
            const normalPrice = Number(prop?.normal_price ?? 0);
            const extraPrice = Number(prop?.extra_price ?? 0);
            const validNormal = block.normalDates.filter((d) => d.date);
            const validExtra = block.extraDates.filter((d) => d.date);
            const blockBorder = isVeryStay && visual ? visual.headerBorder : 'border-primary-200';
            const blockHeaderBg = isVeryStay && visual ? visual.headerBg : 'bg-primary-50';
            const blockHeaderText = isVeryStay && visual ? visual.headerText : 'text-primary-800';
            return (
              <div key={block.key} className={`bg-white rounded-xl border-2 ${blockBorder} shadow-sm overflow-hidden`}>
                <div className={`flex items-center justify-between px-4 py-3 ${blockHeaderBg} border-b ${blockBorder}`}>
                  <div className="flex items-center gap-2">
                    {isVeryStay && visual ? (
                      <span className="text-lg leading-none" aria-hidden>{visual.emoji}</span>
                    ) : (
                      <Building2 className="w-4 h-4 text-primary-700" />
                    )}
                    <span className={`font-semibold text-sm ${blockHeaderText}`}>
                      Local {blockIndex + 1}{prop ? ` — ${prop.name}` : ''}
                    </span>
                  </div>
                  {apartmentBlocks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeApartmentBlock(block.key)}
                      className="p-1 text-red-400 hover:bg-red-50 rounded transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <label className={LABEL}>Local de trabalho *</label>
                    {!clientId ? (
                      <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                        Selecione primeiro o cliente acima.
                      </p>
                    ) : clientApartments.length === 0 ? (
                      <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                        Nenhum local cadastrado para este cliente.{' '}
                        <Link href="/properties/new" className="underline font-medium">Criar local</Link>.
                      </p>
                    ) : isVeryStay ? (
                      <VeryStayPropertyPicker
                        properties={clientApartments}
                        value={block.propertyId}
                        onChange={(id) => updateBlockProperty(block.key, id)}
                      />
                    ) : (
                      <select
                        value={block.propertyId}
                        onChange={(e) => updateBlockProperty(block.key, e.target.value)}
                        className={INPUT}
                      >
                        <option value="">Selecionar local</option>
                        {clientApartments.map((p) => (
                          <option key={p.id} value={p.id}>
                            {isVeryStay ? formatPropertyOptionLabel(p.name) : p.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {prop && (
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600 bg-slate-50 rounded-lg p-3">
                        <span>Valor normal: <strong>{normalPrice.toFixed(2)} €</strong></span>
                        <span>Valor extra: <strong>{extraPrice.toFixed(2)} €</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Limpezas normais */}
                  <div className={`rounded-lg border overflow-hidden ${isVeryStay && visual ? visual.normalBorder : 'border-blue-100'}`}>
                    <div className={`flex items-center gap-2 px-3 py-2 border-b flex-wrap ${isVeryStay && visual ? `${visual.normalBg} ${visual.normalBorder}` : 'bg-blue-50 border-blue-100'}`}>
                      {isVeryStay && visual ? (
                        <span className="text-base leading-none" aria-hidden>{visual.emoji}</span>
                      ) : (
                        <CalendarDays className="w-3.5 h-3.5 text-blue-700" />
                      )}
                      <span className={`text-xs font-semibold ${isVeryStay && visual ? visual.normalHeaderText : 'text-blue-800'}`}>
                        {isVeryStay ? 'Ménage classique' : 'Limpezas normais'}
                      </span>
                      <span className={`text-xs ml-1 ${isVeryStay && visual ? visual.normalHeaderText : 'text-blue-600'} opacity-80`}>
                        — clique em &quot;Adicionar data&quot; para cada dia trabalhado
                      </span>
                      {validNormal.length > 0 && prop && (
                        <span className="ml-auto text-xs text-blue-700 font-medium">
                          {validNormal.length} × {normalPrice.toFixed(2)} € = <strong>{(validNormal.length * normalPrice).toFixed(2)} €</strong>
                        </span>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      {block.normalDates.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="date"
                            value={entry.date}
                            onChange={(e) => updateNormalDate(block.key, i, e.target.value)}
                            className={`${INPUT} flex-1`}
                          />
                          {entry.date && (
                            <span className="text-xs text-slate-500 bg-blue-50 px-2 py-1 rounded whitespace-nowrap">
                              {formatDateLabel(entry.date)}
                            </span>
                          )}
                          <button type="button" onClick={() => removeNormalDate(block.key, i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addNormalDate(block.key)} className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Adicionar data de limpeza
                      </button>
                    </div>
                  </div>

                  {/* Limpezas extra */}
                  <div className={`rounded-lg border overflow-hidden ${isVeryStay && visual ? visual.extraBorder : 'border-emerald-100'}`}>
                    <div className={`flex items-center gap-2 px-3 py-2 border-b flex-wrap ${isVeryStay && visual ? `${visual.extraBg} ${visual.extraBorder}` : 'bg-emerald-50 border-emerald-100'}`}>
                      {isVeryStay && visual ? (
                        <span className="text-base leading-none" aria-hidden>{visual.emojiExtra}</span>
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      )}
                      <span className={`text-xs font-semibold ${isVeryStay && visual ? visual.extraHeaderText : 'text-emerald-800'}`}>
                        {isVeryStay ? 'Ménage extra' : 'Limpezas extra'}
                      </span>
                      <span className={`text-xs ml-1 ${isVeryStay && visual ? visual.extraHeaderText : 'text-emerald-600'} opacity-80`}>
                        — limpeza mais profunda com valor diferenciado
                      </span>
                      {validExtra.length > 0 && prop && (
                        <span className="ml-auto text-xs text-emerald-700 font-medium">
                          {validExtra.length} × {extraPrice.toFixed(2)} € = <strong>{(validExtra.length * extraPrice).toFixed(2)} €</strong>
                        </span>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      {block.extraDates.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="date"
                            value={entry.date}
                            onChange={(e) => updateExtraDate(block.key, i, e.target.value)}
                            className={`${INPUT} flex-1`}
                          />
                          {entry.date && (
                            <span className="text-xs text-slate-500 bg-emerald-50 px-2 py-1 rounded whitespace-nowrap">
                              {formatDateLabel(entry.date)}
                            </span>
                          )}
                          <button type="button" onClick={() => removeExtraDate(block.key, i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addExtraDate(block.key)} className="text-emerald-600 hover:underline text-xs flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Ajouter une date (extra)
                      </button>
                    </div>
                  </div>

                  {/* Ménage pendant le séjour */}
                  <div className="rounded-lg border border-sky-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-sky-50 border-b border-sky-100 flex-wrap">
                      <Plane className="w-3.5 h-3.5 text-sky-700" />
                      <span className="text-xs font-semibold text-sky-900">{FR.menageSejour}</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {block.stayCleanings.length === 0 && (
                        <p className="text-xs text-slate-400 italic">Aucune intervention pendant le séjour.</p>
                      )}
                      {block.stayCleanings.map((entry, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 items-end border border-sky-50 rounded-lg p-2 bg-white">
                          <div className="col-span-3">
                            <label className="block text-xs text-slate-500 mb-0.5">Date</label>
                            <input
                              type="date"
                              value={entry.date}
                              onChange={(e) => updateStayCleaning(block.key, i, 'date', e.target.value)}
                              className={INPUT}
                            />
                          </div>
                          <div className="col-span-4">
                            <label className="block text-xs text-slate-500 mb-0.5">Description</label>
                            <input
                              value={entry.description}
                              onChange={(e) => updateStayCleaning(block.key, i, 'description', e.target.value)}
                              placeholder="Ex: urgence chauffage…"
                              className={INPUT}
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-slate-500 mb-0.5">Heures</label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={entry.hours}
                              onChange={(e) =>
                                updateStayCleaning(block.key, i, 'hours', parseFloat(e.target.value) || 0)
                              }
                              className={INPUT}
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-slate-500 mb-0.5">Montant TTC (€)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={entry.amountTtc || ''}
                              onChange={(e) =>
                                updateStayCleaning(block.key, i, 'amountTtc', parseFloat(e.target.value) || 0)
                              }
                              className={INPUT}
                            />
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeStayCleaning(block.key, i)}
                              className="p-1.5 text-red-400 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addStayCleaning(block.key)}
                        disabled={!prop}
                        className="text-sky-700 hover:underline text-xs flex items-center gap-1 disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ajouter {FR.menageSejour.toLowerCase()}
                      </button>
                    </div>
                  </div>

                  {/* Déplacement (forfait 20 € · 1 h) */}
                  <div className="rounded-lg border border-amber-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-b border-amber-100 flex-wrap">
                      <Car className="w-3.5 h-3.5 text-amber-800" />
                      <span className="text-xs font-semibold text-amber-900">{FR.deplacement}</span>
                      <span className="text-xs text-amber-700">
                        — {TARIF.deplacementHeures} h · {TARIF.deplacementTtc.toFixed(2)} € TTC (forfait)
                      </span>
                    </div>
                    <div className="p-3 space-y-2">
                      {block.apartmentDisplacements.map((entry, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-amber-100 bg-white p-2 space-y-2"
                        >
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={entry.enabled}
                              onChange={(e) =>
                                updateApartmentDisplacement(block.key, i, 'enabled', e.target.checked)
                              }
                              className="rounded border-amber-400 text-primary-600"
                            />
                            <span className="text-xs font-medium text-amber-900">
                              Déplacement effectué
                            </span>
                            {entry.enabled && (
                              <span className="text-xs text-amber-600 ml-auto">
                                {TARIF.deplacementTtc.toFixed(2)} € TTC
                              </span>
                            )}
                          </label>
                          {entry.enabled && (
                            <div className="grid grid-cols-12 gap-2 items-end">
                              <div className="col-span-4">
                                <label className="block text-xs text-slate-500 mb-0.5">Date</label>
                                <input
                                  type="date"
                                  value={entry.date}
                                  onChange={(e) =>
                                    updateApartmentDisplacement(block.key, i, 'date', e.target.value)
                                  }
                                  className={INPUT}
                                />
                              </div>
                              <div className="col-span-7">
                                <label className="block text-xs text-slate-500 mb-0.5">Motif</label>
                                <input
                                  value={entry.description}
                                  onChange={(e) =>
                                    updateApartmentDisplacement(block.key, i, 'description', e.target.value)
                                  }
                                  placeholder="Ex: livraison, urgence…"
                                  className={INPUT}
                                />
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => removeApartmentDisplacement(block.key, i)}
                                  disabled={block.apartmentDisplacements.length === 1}
                                  className="p-1.5 text-red-400 hover:bg-red-50 rounded disabled:opacity-30"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addApartmentDisplacement(block.key)}
                        disabled={!prop}
                        className="text-amber-800 hover:underline text-xs flex items-center gap-1 disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ajouter un autre déplacement
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {clientId && (
            <button
              type="button"
              onClick={addApartmentBlock}
              className="w-full py-3 border-2 border-dashed border-primary-300 rounded-xl text-primary-600 hover:border-primary-500 hover:bg-primary-50 transition text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar outro local
            </button>
          )}
        </>
      )}

      {/* ── Obras / Diárias ── */}
      {mode === 'obras' && (
        <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
          <SectionHeader
            icon={<HardHat className="w-4 h-4 text-orange-700" />}
            title="Diárias de trabalho"
            color="bg-orange-50 border-b border-orange-100"
            tooltip="Cada linha = um dia ou período de trabalho"
          />
          <div className="p-4 space-y-1">
            <p className="text-xs text-slate-500 mb-3">
              <Info className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              Adicione uma linha por dia trabalhado. Coloque a data, o que foi feito, as horas e o valor daquele dia.
            </p>
            {workDays.map((day, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end border border-slate-100 rounded-lg p-3 bg-slate-50">
                <div className="col-span-3">
                  <label className="block text-xs text-slate-500 mb-0.5">Data</label>
                  <input
                    type="date"
                    value={day.date}
                    onChange={(e) => updateWorkDay(i, 'date', e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-xs text-slate-500 mb-0.5">O que foi feito</label>
                  <input
                    value={day.description}
                    onChange={(e) => updateWorkDay(i, 'description', e.target.value)}
                    placeholder="Ex: Pintura sala, demolição…"
                    className={INPUT}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-0.5">Horas</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={day.hours}
                    onChange={(e) => updateWorkDay(i, 'hours', parseFloat(e.target.value) || 0)}
                    className={INPUT}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-0.5">Valor do dia (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={day.rate}
                    onChange={(e) => updateWorkDay(i, 'rate', parseFloat(e.target.value) || 0)}
                    className={INPUT}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeWorkDay(i)}
                    disabled={workDays.length === 1}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {day.hours > 0 && day.rate > 0 && (
                  <div className="col-span-12 text-right text-xs text-orange-700 font-medium -mt-1">
                    Subtotal: {(day.hours * day.rate).toFixed(2)} €
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={addWorkDay} className="text-orange-700 hover:underline text-sm flex items-center gap-1 mt-2">
              <Plus className="w-4 h-4" /> Adicionar dia de trabalho
            </button>
          </div>
        </div>
      )}

      {mode === 'property' && billingClientId && (
        <CaveTasksSection caves={caveTasks} onChange={setCaveTasks} />
      )}

      {billingClientId && (
        <ExtraPersonnelSection
          properties={billingProperties}
          entries={extraPersonnel}
          isVeryStay={isVeryStayInvoiceContext(
            clients.find((c) => c.id === billingClientId)?.company_name,
            billingProperties
          )}
          onAddEntry={addExtraPersonnelEntry}
          onRemoveEntry={removeExtraPersonnelEntry}
          onUpdateAmount={updateExtraPersonnelAmount}
          onAddAssignment={addPersonnelAssignment}
          onRemoveAssignment={removePersonnelAssignment}
          onUpdateAssignment={updatePersonnelAssignment}
        />
      )}

      {/* ── Deslocamentos ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <SectionHeader
          icon={<Car className="w-4 h-4 text-amber-700" />}
          title="Deslocamentos"
          color="bg-amber-50 border-b border-amber-100"
          tooltip="Km percorridos ou transporte pago para chegar ao local"
        />
        <div className="p-4 space-y-3">
          {displacements.length === 0 && (
            <p className="text-xs text-slate-400 italic">Nenhum deslocamento. Clique abaixo para adicionar se aplicável.</p>
          )}
          {displacements.map((d, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-7">
                <label className="block text-xs text-slate-500 mb-0.5">Descrição</label>
                <input
                  value={d.description}
                  onChange={(e) => updateDisplacement(i, 'description', e.target.value)}
                  placeholder="Ex: Deslocamento 25 km ida/volta"
                  className={INPUT}
                />
              </div>
              <div className="col-span-4">
                <label className="block text-xs text-slate-500 mb-0.5">Valor (€)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={d.amount}
                  onChange={(e) => updateDisplacement(i, 'amount', parseFloat(e.target.value) || 0)}
                  className={INPUT}
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button type="button" onClick={() => removeDisplacement(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addDisplacement} className="text-amber-700 hover:underline text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Adicionar deslocamento
          </button>
        </div>
      </div>

      {/* ── Horas extras ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <SectionHeader
          icon={<Clock className="w-4 h-4 text-violet-700" />}
          title="Horas extras"
          color="bg-violet-50 border-b border-violet-100"
          tooltip="Trabalho adicional cobrado por hora (ex: limpeza forno, coifa…)"
        />
        <div className="p-4 space-y-3">
          {extraHours.length === 0 && (
            <p className="text-xs text-slate-400 italic">Nenhuma hora extra. Clique abaixo para adicionar se aplicável.</p>
          )}
          {extraHours.map((h, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <label className="block text-xs text-slate-500 mb-0.5">Descrição</label>
                <input
                  value={h.description}
                  onChange={(e) => updateExtraHour(i, 'description', e.target.value)}
                  placeholder="Ex: Limpeza de coifa, forno…"
                  className={INPUT}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-slate-500 mb-0.5">Horas (h)</label>
                <input
                  type="number" step="0.25" min="0.25"
                  value={h.hours}
                  onChange={(e) => updateExtraHour(i, 'hours', parseFloat(e.target.value) || 0)}
                  className={INPUT}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-slate-500 mb-0.5">Tarifa /h (€)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={h.rate}
                  onChange={(e) => updateExtraHour(i, 'rate', parseFloat(e.target.value) || 0)}
                  className={INPUT}
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button type="button" onClick={() => removeExtraHour(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addExtraHour} className="text-violet-600 hover:underline text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Adicionar horas extras
          </button>
        </div>
      </div>

      {/* ── Outros itens ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <SectionHeader
          icon={<Package className="w-4 h-4 text-slate-600" />}
          title="Outros itens"
          color="bg-slate-50 border-b border-slate-200"
          tooltip="Materiais comprados, serviços pontuais ou qualquer outro item livre"
        />
        <div className="p-4 space-y-3">
          {otherItems.length === 0 && (
            <p className="text-xs text-slate-400 italic">Nenhum item. Clique abaixo para adicionar materiais ou serviços livres.</p>
          )}
          {otherItems.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-6">
                <label className="block text-xs text-slate-500 mb-0.5">Descrição *</label>
                <input
                  value={item.description}
                  onChange={(e) => updateOtherItem(i, 'description', e.target.value)}
                  placeholder="Ex: Produtos de limpeza, tinta…"
                  className={INPUT}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-0.5">Qtd</label>
                <input
                  type="number" step="0.01" min="0.01"
                  value={item.quantity}
                  onChange={(e) => updateOtherItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                  className={INPUT}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-slate-500 mb-0.5">Preço unit. (€)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={item.unit_price}
                  onChange={(e) => updateOtherItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
                  className={INPUT}
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button type="button" onClick={() => removeOtherItem(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addOtherItem} className="text-slate-600 hover:underline text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Adicionar item livre
          </button>
        </div>
      </div>

      {/* ── Total ── */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl px-6 py-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-slate-600 text-sm">Total HT</span>
          <span className="font-semibold text-slate-800">{totalHt.toFixed(2)} €</span>
        </div>
        {tvaRate > 0 ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-sm">TVA ({tvaRate}%)</span>
              <span className="font-semibold text-slate-800">{totalTva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-primary-200">
              <span className="font-bold text-slate-700">Total TTC</span>
              <span className="text-2xl font-bold text-primary-700">{totalTtc.toFixed(2)} €</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-center pt-2 border-t border-primary-200">
            <span className="font-bold text-slate-700">Total</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary-700">{totalHt.toFixed(2)} €</span>
              <p className="text-xs text-slate-500 mt-0.5">TVA não aplicável (art. 293B CGI)</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Ações ── */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium text-sm"
        >
          {loading ? 'Salvando...' : invoice ? 'Atualizar fatura' : 'Criar fatura'}
        </button>
        <Link href="/invoices" className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm">
          Cancelar
        </Link>
      </div>
    </form>
  );
}

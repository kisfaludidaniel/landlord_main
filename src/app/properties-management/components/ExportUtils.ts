import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface PropertyExportData {
  id: string;
  name: string;
  address: string;
  type: string;
  description?: string;
  created_at: string;
  landlord_id: string;
  meta: any;
  // Computed fields for export
  alapterulet?: number;
  szobaszam?: number;
  berleti_dij?: number;
  occupancy_rate?: number;
}

export interface UnitExportData {
  id: string;
  name: string;
  property_name: string;
  building_name?: string;
  unit_type: string;
  meta: any;
  created_at: string;
  // Computed fields
  alapterulet?: number;
  berleti_dij?: number;
  is_occupied?: boolean;
  tenant_name?: string;
}

export interface TenantInviteExportData {
  id: string;
  unit_name: string;
  property_name: string;
  email: string;
  status: string;
  invited_at: string;
  expires_at: string;
  responded_at?: string;
  invited_by_name: string;
}

// Property export functions
export const exportPropertiesToCSV = (properties: PropertyExportData[]) => {
  const exportData = properties.map(formatPropertyForExport);
  const csv = Papa.unparse(exportData, {
    header: true,
    encoding: 'utf-8'
  });
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `ingatlanok_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportPropertiesToXLSX = (properties: PropertyExportData[]) => {
  const exportData = properties.map(formatPropertyForExport);
  
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  
  // Set column widths
  const colWidths = [
    { wch: 25 }, // Név
    { wch: 40 }, // Cím  
    { wch: 15 }, // Típus
    { wch: 12 }, // Alapterület
    { wch: 10 }, // Szobaszám
    { wch: 15 }, // Bérleti díj
    { wch: 12 }, // Foglaltság
    { wch: 15 }, // Létrehozva
  ];
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Ingatlanok');
  XLSX.writeFile(wb, `ingatlanok_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Unit export functions  
export const exportUnitsToCSV = (units: UnitExportData[]) => {
  const exportData = units.map(formatUnitForExport);
  const csv = Papa.unparse(exportData, {
    header: true,
    encoding: 'utf-8'
  });
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `egysegek_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportUnitsToXLSX = (units: UnitExportData[]) => {
  const exportData = units.map(formatUnitForExport);
  
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  
  const colWidths = [
    { wch: 15 }, // Egység név
    { wch: 25 }, // Ingatlan
    { wch: 20 }, // Épület
    { wch: 15 }, // Típus
    { wch: 12 }, // Alapterület
    { wch: 15 }, // Bérleti díj
    { wch: 10 }, // Foglalt
    { wch: 20 }, // Bérlő
    { wch: 15 }, // Létrehozva
  ];
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Egységek');
  XLSX.writeFile(wb, `egysegek_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Tenant invite export functions
export const exportTenantInvitesToCSV = (invites: TenantInviteExportData[]) => {
  const exportData = invites.map(formatTenantInviteForExport);
  const csv = Papa.unparse(exportData, {
    header: true,
    encoding: 'utf-8'
  });
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `meghivasok_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportTenantInvitesToXLSX = (invites: TenantInviteExportData[]) => {
  const exportData = invites.map(formatTenantInviteForExport);
  
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  
  const colWidths = [
    { wch: 15 }, // Egység
    { wch: 25 }, // Ingatlan
    { wch: 30 }, // Email
    { wch: 12 }, // Státusz
    { wch: 15 }, // Meghívva
    { wch: 15 }, // Lejár
    { wch: 15 }, // Válaszolt
    { wch: 20 }, // Meghívó
  ];
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Meghívások');
  XLSX.writeFile(wb, `meghivasok_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Formatting functions
const formatPropertyForExport = (property: PropertyExportData) => {
  const meta = property.meta || {};
  
  return {
    'Név': property.name,
    'Cím': property.address,
    'Típus': getPropertyTypeLabel(property.type),
    'Alapterület (m²)': meta.alapterulet || meta.hasznos_alapterulet || '',
    'Szobaszám': meta.szobaszam || '',
    'Bérleti díj (HUF)': meta.berleti_dij || '',
    'Foglaltság (%)': property.occupancy_rate ? `${property.occupancy_rate}%` : '',
    'Leírás': property.description || '',
    'Létrehozva': new Date(property.created_at).toLocaleDateString('hu-HU'),
    'Építés éve': meta.epites_eve || '',
    'Emelet': meta.emelet || '',
    'Lift': meta.lift ? 'Igen' : 'Nem',
    'Klíma': meta.klima ? 'Igen' : 'Nem',
    'Parkolás': meta.parkolas || '',
    'Telek (m²)': meta.telek || '',
    'Garázs (db)': meta.garazs_db || '',
    'Fűtés': meta.futes_tipusa || '',
    'Funkció': meta.funkcio || '',
    'Utcafront': meta.utcafront ? 'Igen' : 'Nem',
    'Munkaállomások': meta.munkaallomások_max || '',
    'Tárgyalók': meta.targyalok_db || '',
    'Belmagasság (m)': meta.belmagassag || '',
    'Ipari áram': meta.ipari_aram ? 'Igen' : 'Nem',
    'Rakodókapuk': meta.rakodokapuk_db || '',
  };
};

const formatUnitForExport = (unit: UnitExportData) => {
  const meta = unit.meta || {};
  
  return {
    'Egység neve': unit.name,
    'Ingatlan': unit.property_name,
    'Épület': unit.building_name || '',
    'Típus': getUnitTypeLabel(unit.unit_type),
    'Alapterület (m²)': meta.alapterulet || '',
    'Bérleti díj (HUF)': meta.berleti_dij || '',
    'Foglalt': unit.is_occupied ? 'Igen' : 'Nem',
    'Bérlő': unit.tenant_name || '',
    'Szobaszám': meta.szobaszam || '',
    'Fürdőszoba': meta.furdoszoba_szam || '',
    'Erkély': meta.erkely ? 'Igen' : 'Nem',
    'Létrehozva': new Date(unit.created_at).toLocaleDateString('hu-HU'),
  };
};

const formatTenantInviteForExport = (invite: TenantInviteExportData) => {
  return {
    'Egység': invite.unit_name,
    'Ingatlan': invite.property_name,
    'Email': invite.email,
    'Státusz': getInviteStatusLabel(invite.status),
    'Meghívva': new Date(invite.invited_at).toLocaleDateString('hu-HU'),
    'Lejár': new Date(invite.expires_at).toLocaleDateString('hu-HU'),
    'Válaszolt': invite.responded_at ? new Date(invite.responded_at).toLocaleDateString('hu-HU') : '',
    'Meghívó': invite.invited_by_name,
  };
};

// Helper functions for Hungarian labels
const getPropertyTypeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    'lakas': 'Lakás',
    'haz': 'Ház', 
    'kereskedelmi': 'Kereskedelmi',
    'iroda': 'Iroda',
    'raktar': 'Raktár',
    'tarsashaz': 'Társasház',
    'egyeb': 'Egyéb'
  };
  return labels[type] || type;
};

const getUnitTypeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    'lakas': 'Lakás',
    'uzlet': 'Üzlet',
    'iroda': 'Iroda', 
    'raktar': 'Raktár',
    'egyeb': 'Egyéb'
  };
  return labels[type] || type;
};

const getInviteStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    'pending': 'Függőben',
    'accepted': 'Elfogadva',
    'declined': 'Elutasítva', 
    'expired': 'Lejárt'
  };
  return labels[status] || status;
};

// Combined export for multiple data types
export const exportAllDataToXLSX = (data: {
  properties: PropertyExportData[];
  units: UnitExportData[];
  invites: TenantInviteExportData[];
}) => {
  const wb = XLSX.utils.book_new();

  // Properties sheet
  if (data.properties.length > 0) {
    const propertiesData = data.properties.map(formatPropertyForExport);
    const wsProperties = XLSX.utils.json_to_sheet(propertiesData);
    XLSX.utils.book_append_sheet(wb, wsProperties, 'Ingatlanok');
  }

  // Units sheet
  if (data.units.length > 0) {
    const unitsData = data.units.map(formatUnitForExport);
    const wsUnits = XLSX.utils.json_to_sheet(unitsData);
    XLSX.utils.book_append_sheet(wb, wsUnits, 'Egységek');
  }

  // Invites sheet
  if (data.invites.length > 0) {
    const invitesData = data.invites.map(formatTenantInviteForExport);
    const wsInvites = XLSX.utils.json_to_sheet(invitesData);
    XLSX.utils.book_append_sheet(wb, wsInvites, 'Meghívások');
  }

  XLSX.writeFile(wb, `ingatlan_adatok_${new Date().toISOString().split('T')[0]}.xlsx`);
};
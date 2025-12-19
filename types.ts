export type CountryCode = 'US' | 'ID' | 'GB' | 'JP' | 'CN' | 'IN';

export interface GeneratedCard {
  id: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
  scheme: 'Mastercard' | 'Visa' | 'Amex' | 'JCB' | 'UnionPay' | 'RuPay' | 'Unknown';
  address: {
    street: string;
    street2?: string;
    rt_rw?: string;     // RT/RW for Indonesia
    village?: string;   // Kelurahan/Desa
    district?: string;  // Kecamatan
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
}

export interface GeneratorConfig {
  bin: string;
  quantity: number;
}
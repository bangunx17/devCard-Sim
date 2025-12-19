import { GeneratedCard, CountryCode } from '../types';
import { fakerEN_US, fakerID_ID, fakerEN_GB, fakerJA, fakerZH_CN, fakerEN_IN } from '@faker-js/faker';

// Map codes to Faker instances
const getFaker = (code: CountryCode) => {
  switch (code) {
    case 'ID': return fakerID_ID;
    case 'GB': return fakerEN_GB;
    case 'JP': return fakerJA;
    case 'CN': return fakerZH_CN;
    case 'IN': return fakerEN_IN;
    case 'US': 
    default: return fakerEN_US;
  }
};

const getCountryName = (code: CountryCode) => {
    switch (code) {
        case 'ID': return 'Indonesia';
        case 'GB': return 'United Kingdom';
        case 'JP': return 'Japan';
        case 'CN': return 'China';
        case 'IN': return 'India';
        default: return 'United States';
    }
}

// Robust Luhn Generator for any length
const calculateCheckDigit = (payload: string): number => {
  const digits = payload.split('').map(Number);
  let sum = 0;
  let shouldDouble = true; // We start doubling from the rightmost digit of the payload

  // Iterate from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (10 - (sum % 10)) % 10;
};

export const getScheme = (number: string): GeneratedCard['scheme'] => {
    const n = number;
    if (n.startsWith('4')) return 'Visa';
    if (parseInt(n.slice(0, 2)) >= 51 && parseInt(n.slice(0, 2)) <= 55) return 'Mastercard';
    if (parseInt(n.slice(0, 4)) >= 2221 && parseInt(n.slice(0, 4)) <= 2720) return 'Mastercard';
    if (n.startsWith('34') || n.startsWith('37')) return 'Amex';
    if (parseInt(n.slice(0, 4)) >= 3528 && parseInt(n.slice(0, 4)) <= 3589) return 'JCB';
    if (n.startsWith('62')) return 'UnionPay';
    if (n.startsWith('60') || n.startsWith('65') || n.startsWith('81') || n.startsWith('82') || n.startsWith('508')) return 'RuPay';
    return 'Unknown';
}

// Main generator function
export const generateCards = (bin: string, count: number, countryCode: CountryCode = 'US'): GeneratedCard[] => {
  const cards: GeneratedCard[] = [];
  const cleanBin = bin.replace(/\D/g, '');
  const selectedFaker = getFaker(countryCode);
  const countryName = getCountryName(countryCode);

  // Determine target length based on BIN
  let targetLength = 16;
  if (cleanBin.startsWith('34') || cleanBin.startsWith('37')) {
    targetLength = 15; // Amex
  }

  for (let i = 0; i < count; i++) {
    // targetLength - bin length - 1 (check digit)
    const lengthNeeded = targetLength - cleanBin.length - 1;
    
    let randomPart = '';
    if (lengthNeeded > 0) {
      for (let j = 0; j < lengthNeeded; j++) {
        randomPart += Math.floor(Math.random() * 10).toString();
      }
    }

    // If BIN is longer than target (user typing error), truncate
    const candidate = (cleanBin + randomPart).slice(0, targetLength - 1);
    
    const checkDigit = calculateCheckDigit(candidate);
    const fullNumber = candidate + checkDigit;

    // Generate Expiry
    const month = Math.floor(Math.random() * 12) + 1;
    const year = Math.floor(Math.random() * 10) + 26; // 2026-2035
    
    // Generate CVV (4 digits for Amex, 3 for others)
    const isAmex = fullNumber.startsWith('34') || fullNumber.startsWith('37');
    const cvvMin = isAmex ? 1000 : 100;
    const cvvMax = isAmex ? 9000 : 900;
    const cvv = Math.floor(Math.random() * cvvMax) + cvvMin;

    const scheme = getScheme(fullNumber);
    
    // Generate Identity using Localized Faker
    const sex = Math.random() > 0.5 ? 'male' : 'female';
    const firstName = selectedFaker.person.firstName(sex);
    const lastName = selectedFaker.person.lastName();
    const holderName = countryCode === 'CN' || countryCode === 'JP' 
        ? `${lastName} ${firstName}`.toUpperCase() 
        : `${firstName} ${lastName}`.toUpperCase();

    // Generate Detailed Address
    let street = selectedFaker.location.streetAddress(false); 
    let street2: string | undefined = undefined;
    let rt_rw: string | undefined = undefined;
    let village: string | undefined = undefined;
    let district: string | undefined = undefined;
    let state = selectedFaker.location.state();
    
    if (countryCode === 'US') {
       if (Math.random() > 0.3) {
           street2 = (Math.random() > 0.5 ? 'Apt ' : 'Suite ') + selectedFaker.number.int({min: 1, max: 999});
       }
    } else if (countryCode === 'GB') {
        if (Math.random() > 0.3) {
            street2 = (Math.random() > 0.5 ? 'Flat ' : 'Unit ') + selectedFaker.number.int({min: 1, max: 100}) + (Math.random() > 0.8 ? selectedFaker.string.alpha().toUpperCase() : '');
        }
    } else if (countryCode === 'ID') {
       // Detailed Indonesian Address
       const cityPart = selectedFaker.location.city().replace('Kota ', '').replace('Kabupaten ', '');
       const firstNamePart = selectedFaker.person.firstName();
       village = `Kel. ${firstNamePart}`;
       district = `Kec. ${cityPart} ${['Utara', 'Selatan', 'Barat', 'Timur', 'Pusat'][Math.floor(Math.random()*5)]}`;
       
       const rt = Math.floor(Math.random() * 12) + 1;
       const rw = Math.floor(Math.random() * 12) + 1;
       rt_rw = `RT. ${rt.toString().padStart(3, '0')} / RW. ${rw.toString().padStart(3, '0')}`;
    }

    const city = selectedFaker.location.city();
    const zipCode = selectedFaker.location.zipCode();
    
    // Generate Phone
    const phone = selectedFaker.phone.number();

    cards.push({
      id: crypto.randomUUID(),
      number: fullNumber,
      expiryMonth: month.toString().padStart(2, '0'),
      expiryYear: year.toString(),
      cvv: cvv.toString(),
      holderName,
      scheme,
      address: {
        street,
        street2,
        rt_rw,
        village,
        district,
        city,
        state,
        zipCode,
        country: countryName
      },
      phone
    });
  }

  return cards;
};
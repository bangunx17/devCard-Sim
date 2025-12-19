import { GeneratedCard, CountryCode } from '../types';
import { fakerEN_US, fakerID_ID, fakerEN_GB, fakerJA, fakerZH_CN, fakerEN_IN } from '@faker-js/faker';

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

const calculateCheckDigit = (payload: string): number => {
  const digits = payload.split('').map(Number);
  let sum = 0;
  let shouldDouble = true;

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
    const firstTwo = parseInt(n.slice(0, 2));
    const firstFour = parseInt(n.slice(0, 4));
    if (firstTwo >= 51 && firstTwo <= 55) return 'Mastercard';
    if (firstFour >= 2221 && firstFour <= 2720) return 'Mastercard';
    if (n.startsWith('34') || n.startsWith('37')) return 'Amex';
    if (firstFour >= 3528 && firstFour <= 3589) return 'JCB';
    if (n.startsWith('62')) return 'UnionPay';
    if (n.startsWith('60') || n.startsWith('65') || n.startsWith('81') || n.startsWith('82') || n.startsWith('508')) return 'RuPay';
    return 'Unknown';
}

export const generateCards = (bin: string, count: number, countryCode: CountryCode = 'US'): GeneratedCard[] => {
  const cards: GeneratedCard[] = [];
  const cleanBin = bin.replace(/\D/g, '');
  const selectedFaker = getFaker(countryCode);
  const countryName = getCountryName(countryCode);

  let targetLength = 16;
  if (cleanBin.startsWith('34') || cleanBin.startsWith('37')) {
    targetLength = 15;
  }

  for (let i = 0; i < count; i++) {
    const lengthNeeded = targetLength - cleanBin.length - 1;
    let randomPart = '';
    if (lengthNeeded > 0) {
      for (let j = 0; j < lengthNeeded; j++) {
        randomPart += Math.floor(Math.random() * 10).toString();
      }
    }

    const candidate = (cleanBin + randomPart).slice(0, targetLength - 1);
    const checkDigit = calculateCheckDigit(candidate);
    const fullNumber = candidate + checkDigit;

    const month = Math.floor(Math.random() * 12) + 1;
    const year = Math.floor(Math.random() * 10) + 26;
    
    const isAmex = fullNumber.startsWith('34') || fullNumber.startsWith('37');
    const cvv = Math.floor(Math.random() * (isAmex ? 9000 : 900)) + (isAmex ? 1000 : 100);

    const scheme = getScheme(fullNumber);
    
    const sex = Math.random() > 0.5 ? 'male' : 'female';
    const firstName = selectedFaker.person.firstName(sex);
    const lastName = selectedFaker.person.lastName();
    const holderName = countryCode === 'CN' || countryCode === 'JP' 
        ? `${lastName} ${firstName}`.toUpperCase() 
        : `${firstName} ${lastName}`.toUpperCase();

    let street = selectedFaker.location.streetAddress(); 
    let street2: string | undefined = undefined;
    let rt_rw: string | undefined = undefined;
    let village: string | undefined = undefined;
    let district: string | undefined = undefined;
    let province: string | undefined = undefined;
    let state = selectedFaker.location.state();
    
    if (countryCode === 'ID') {
       const cityPart = selectedFaker.location.city().replace('Kota ', '').replace('Kabupaten ', '');
       village = `Kelurahan ${selectedFaker.person.firstName()} Tengsin`;
       district = `Kecamatan ${cityPart}`;
       
       const rt = Math.floor(Math.random() * 12) + 1;
       const rw = Math.floor(Math.random() * 12) + 1;
       rt_rw = `RT ${rt.toString().padStart(3, '0')} / RW ${rw.toString().padStart(3, '0')}`;
       province = `Provinsi ${['DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Bali', 'Banten'][Math.floor(Math.random()*6)]}`;
    }

    const city = selectedFaker.location.city();
    const zipCode = selectedFaker.location.zipCode();
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
        province,
        zipCode,
        country: countryName
      },
      phone
    });
  }

  return cards;
};
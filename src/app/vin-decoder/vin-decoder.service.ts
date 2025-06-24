
import { Injectable } from '@angular/core';

export interface VinDecodingResult {
  wmi: string;
  region: string;
  country: string;
  manufacturer: string;
  vds: string;
  vehicleAttributes: VehicleAttributes;
  checkDigit: string;
  isValidCheckDigit: boolean;
  modelYear: string;
  year: string;
  plantCode: string;
  sequentialNumber: string;
  errors?: string[];
}

export interface VehicleAttributes {
  bodyType: string;
  engine: string;
  transmission: string;
  restraintSystem: string;
  series: string;
}

@Injectable({
  providedIn: 'root'
})
export class VinDecoderService {
  private readonly VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

  // Region codes using Map for better performance
  private readonly regionCodes = new Map([
    ['A', 'Africa'], ['B', 'Africa'], ['C', 'Africa'], ['D', 'Africa'],
    ['E', 'Europe'], ['F', 'Europe'], ['G', 'Europe'], ['H', 'Europe'],
    ['J', 'Asia'], ['K', 'Asia'], ['L', 'Asia'], ['M', 'Asia'],
    ['N', 'Oceania'], ['P', 'Oceania'], ['R', 'Oceania'],
    ['S', 'South America'], ['T', 'South America'],
    ['U', 'Europe'], ['V', 'Europe'], ['W', 'Europe'], ['X', 'Europe'], ['Y', 'Europe'], ['Z', 'Europe'],
    ['1', 'North America'], ['2', 'North America'], ['3', 'North America'],
    ['4', 'North America'], ['5', 'North America'],
    ['6', 'Oceania'], ['7', 'Oceania'],
    ['8', 'South America'], ['9', 'South America'], ['0', 'Oceania']
  ]);

  // Model year codes
  private readonly yearCodes = new Map([
    ['A', '2010'], ['B', '2011'], ['C', '2012'], ['D', '2013'], ['E', '2014'],
    ['F', '2015'], ['G', '2016'], ['H', '2017'], ['J', '2018'], ['K', '2019'],
    ['L', '2020'], ['M', '2021'], ['N', '2022'], ['P', '2023'], ['R', '2024'],
    ['S', '2025'], ['T', '2026'], ['V', '2027'], ['W', '2028'], ['X', '2029'],
    ['Y', '2030'], ['1', '2001'], ['2', '2002'], ['3', '2003'], ['4', '2004'],
    ['5', '2005'], ['6', '2006'], ['7', '2007'], ['8', '2008'], ['9', '2009'],
    ['0', '2000']
  ]);

  // Common manufacturer codes
  private readonly manufacturerCodes = new Map([
    ['1C', 'Chrysler'], ['1FA', 'Ford'], ['1FB', 'Ford'], ['1FD', 'Ford'],
    ['1FM', 'Ford'], ['1FT', 'Ford'], ['1G', 'General Motors'], ['1GC', 'Chevrolet'],
    ['1GT', 'GMC'], ['1H', 'Honda'], ['1J4', 'Jeep'], ['1J', 'Jeep'],
    ['1L', 'Lincoln'], ['1M', 'Mercury'], ['1N', 'Nissan'], ['1VW', 'Volkswagen'],
    ['2G', 'General Motors Canada'], ['2HG', 'Honda Canada'], ['2T', 'Toyota Canada'],
    ['3G', 'General Motors Mexico'], ['3H', 'Honda Mexico'], ['3N', 'Nissan Mexico'],
    ['4F', 'Mazda'], ['4T', 'Toyota'], ['5N1', 'Nissan USA'], ['5NP', 'Hyundai'],
    ['5T', 'Toyota USA'], ['5YJ', 'Tesla'], ['JF', 'Fuji Heavy Industries (Subaru)'],
    ['JH', 'Honda'], ['JM', 'Mazda'], ['JN', 'Nissan'], ['JS', 'Suzuki'],
    ['JT', 'Toyota'], ['KM', 'Hyundai'], ['KN', 'Kia'], ['KPA', 'Ssangyong'],
    ['SAL', 'Land Rover'], ['SAJ', 'Jaguar'], ['TRU', 'Audi Hungary'],
    ['VF1', 'Renault'], ['VF3', 'Peugeot'], ['VF7', 'Citroën'],
    ['WAU', 'Audi'], ['WBA', 'BMW'], ['WBS', 'BMW M'], ['WDB', 'Mercedes-Benz'],
    ['WDD', 'Mercedes-Benz'], ['WME', 'Smart'], ['WP0', 'Porsche'],
    ['WVG', 'Volkswagen'], ['WVW', 'Volkswagen'], ['YV1', 'Volvo'],
    ['ZFA', 'Fiat'], ['ZFF', 'Ferrari'], ['ZHW', 'Lamborghini'], ['ZLA', 'Lancia']
  ]);

  validateVin(vin: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!vin || vin.trim().length === 0) {
      errors.push('VIN cannot be empty');
      return { isValid: false, errors };
    }

    const trimmedVin = vin.trim().toUpperCase();

    if (trimmedVin.length !== 17) {
      errors.push('VIN must be exactly 17 characters long');
    }

    if (!this.VIN_PATTERN.test(trimmedVin)) {
      errors.push('VIN contains invalid characters. Only A-Z (except I, O, Q) and 0-9 are allowed');
    }

    // Check for prohibited characters
    const prohibitedChars = ['I', 'O', 'Q'];
    const foundProhibited = prohibitedChars.filter(char => trimmedVin.includes(char));
    if (foundProhibited.length > 0) {
      errors.push(`VIN cannot contain the following characters: ${foundProhibited.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  decodeVin(vin: string): VinDecodingResult | null {
    const validation = this.validateVin(vin);

    if (!validation.isValid) {
      return {
        ...this.getEmptyResult(),
        errors: validation.errors
      };
    }

    try {
      return this.performDecoding(vin.trim().toUpperCase());
    } catch (error) {
      return {
        ...this.getEmptyResult(),
        errors: [`Decoding error: ${error}`]
      };
    }
  }

  private performDecoding(vin: string): VinDecodingResult {
    // Extract VIN components
    const wmi = vin.substring(0, 3);
    const vds = vin.substring(3, 8);
    const checkDigit = vin.charAt(8);
    const modelYear = vin.charAt(9);
    const plantCode = vin.charAt(10);
    const sequentialNumber = vin.substring(11);

    // Determine region
    const regionCode = vin.charAt(0);
    const region = this.regionCodes.get(regionCode) || 'Unknown';

    // Determine country
    const country = this.getCountryFromWMI(wmi);

    // Determine manufacturer
    const manufacturer = this.getManufacturerFromWMI(wmi);

    // Determine model year
    const year = this.yearCodes.get(modelYear) || 'Unknown';

    // Decode vehicle attributes based on region
    const vehicleAttributes = this.decodeVehicleAttributes(region, vds);

    // Validate check digit
    const isValidCheckDigit = this.validateCheckDigit(vin);

    return {
      wmi,
      region,
      country,
      manufacturer,
      vds,
      vehicleAttributes,
      checkDigit,
      isValidCheckDigit,
      modelYear,
      year,
      plantCode,
      sequentialNumber
    };
  }

  private getEmptyResult(): Omit<VinDecodingResult, 'errors'> {
    return {
      wmi: '',
      region: '',
      country: '',
      manufacturer: '',
      vds: '',
      vehicleAttributes: {
        bodyType: '',
        engine: '',
        transmission: '',
        restraintSystem: '',
        series: ''
      },
      checkDigit: '',
      isValidCheckDigit: false,
      modelYear: '',
      year: '',
      plantCode: '',
      sequentialNumber: ''
    };
  }

  private getManufacturerFromWMI(wmi: string): string {
    // Try exact match first
    if (this.manufacturerCodes.has(wmi)) {
      return this.manufacturerCodes.get(wmi)!;
    }

    // Try 2-character match
    const twoChar = wmi.substring(0, 2);
    if (this.manufacturerCodes.has(twoChar)) {
      return this.manufacturerCodes.get(twoChar)!;
    }

    // Try partial matches
    for (const [code, name] of this.manufacturerCodes.entries()) {
      if (wmi.startsWith(code)) {
        return name;
      }
    }

    return 'Unknown';
  }

  private getCountryFromWMI(wmi: string): string {
    const firstChar = wmi.charAt(0);
    const secondChar = wmi.charAt(1);

    // North America
    if (['1', '4', '5'].includes(firstChar)) {
      return 'United States';
    } else if (firstChar === '2') {
      return 'Canada';
    } else if (firstChar === '3') {
      return 'Mexico';
    }

    // Asia
    else if (firstChar === 'J') {
      return 'Japan';
    } else if (firstChar === 'K') {
      return 'Korea (South)';
    } else if (firstChar === 'L') {
      return 'China';
    } else if (firstChar === 'M') {
      if (secondChar === 'A') return 'India';
      if (['P', 'R'].includes(secondChar)) return 'Thailand';
      if (secondChar === 'N') return 'Turkey';
      return 'Asia';
    }

    // Europe
    else if (firstChar === 'S') {
      if (['A', 'C', 'D', 'F', 'H'].includes(secondChar)) return 'United Kingdom';
      if (secondChar === 'U') return 'Poland';
      return 'Europe';
    } else if (firstChar === 'T') {
      if (secondChar === 'M') return 'Czech Republic';
      if (secondChar === 'R') return 'Hungary';
      return 'Europe';
    } else if (firstChar === 'V') {
      if (secondChar === 'F') return 'France';
      if (secondChar === 'S') return 'Spain';
      return 'Europe';
    } else if (firstChar === 'W') {
      return 'Germany';
    } else if (firstChar === 'X') {
      if (secondChar === 'T') return 'Russia';
      return 'Europe';
    } else if (firstChar === 'Y') {
      if (['S', 'V'].includes(secondChar)) return 'Sweden';
      return 'Europe';
    } else if (firstChar === 'Z') {
      return 'Italy';
    }

    // South America
    else if (['8', '9'].includes(firstChar)) {
      if (secondChar === 'A') return 'Argentina';
      if (secondChar === 'B') return 'Brazil';
      if (secondChar === 'U') return 'Uruguay';
      return 'South America';
    }

    // Africa
    else if (firstChar === 'A') {
      return 'South Africa';
    }

    // Oceania
    else if (['6', '7', '0', 'N', 'P', 'R'].includes(firstChar)) {
      return 'Australia';
    }

    return 'Unknown';
  }

  private decodeVehicleAttributes(region: string, vds: string): VehicleAttributes {
    const attributes: VehicleAttributes = {
      bodyType: 'Unknown',
      engine: 'Unknown',
      transmission: 'Unknown',
      restraintSystem: 'Unknown',
      series: 'Unknown'
    };

    switch (region) {
      case 'North America':
        attributes.bodyType = this.getNorthAmericanBodyType(vds.charAt(0));
        attributes.engine = this.getNorthAmericanEngine(vds.charAt(1));
        attributes.transmission = this.getNorthAmericanTransmission(vds.charAt(2));
        attributes.series = vds.substring(0, 2);
        break;

      case 'Europe':
        attributes.series = vds.substring(0, 2);
        attributes.bodyType = this.getEuropeanBodyType(vds.charAt(2));
        attributes.engine = `Engine Code ${vds.charAt(3)}`;
        break;

      case 'Asia':
        attributes.series = vds.substring(0, 2);
        attributes.bodyType = this.getAsianBodyType(vds.charAt(2));
        attributes.engine = `Engine Type ${vds.charAt(3)}`;
        break;

      default:
        attributes.series = vds.substring(0, 2);
        attributes.bodyType = 'See manufacturer specifications';
        attributes.engine = 'See manufacturer specifications';
        break;
    }

    return attributes;
  }

  private getNorthAmericanBodyType(code: string): string {
    const bodyTypes: Record<string, string> = {
      '1': 'Sedan', '2': 'Coupe', '3': 'Convertible', '4': 'Hatchback',
      '5': 'Wagon', '6': 'SUV', '7': 'Pickup', '8': 'Van', '9': 'Truck'
    };
    return bodyTypes[code] || 'Unknown';
  }

  private getNorthAmericanEngine(code: string): string {
    if (code >= '1' && code <= '9') {
      return `Engine Type ${code}`;
    }
    return 'Unknown';
  }

  private getNorthAmericanTransmission(code: string): string {
    const transmissions: Record<string, string> = {
      'A': 'Automatic', 'M': 'Manual', 'C': 'CVT', 'D': 'Dual Clutch'
    };
    return transmissions[code] || 'Unknown';
  }

  private getEuropeanBodyType(code: string): string {
    const bodyTypes: Record<string, string> = {
      'A': 'Sedan', 'B': 'Hatchback', 'C': 'Estate/Wagon',
      'D': 'Coupe', 'E': 'Convertible', 'F': 'SUV/Crossover', 'G': 'MPV/Minivan'
    };
    return bodyTypes[code] || 'Unknown';
  }

  private getAsianBodyType(code: string): string {
    const bodyTypes: Record<string, string> = {
      '1': 'Sedan', '2': 'Hatchback', '3': 'Wagon', '4': 'Coupe',
      '5': 'Convertible', '6': 'SUV', '7': 'Minivan', '8': 'Pickup'
    };
    return bodyTypes[code] || 'Unknown';
  }

  private validateCheckDigit(vin: string): boolean {
    const transliteration: Record<string, number> = {
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
      'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
      'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
      '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
    };

    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

    const sum = vin
      .split('')
      .reduce((acc, char, index) => {
        if (index === 8) return acc; // Skip check digit position
        return acc + (transliteration[char] || 0) * weights[index];
      }, 0);

    const remainder = sum % 11;
    const expectedCheckDigit = remainder === 10 ? 'X' : remainder.toString();

    return expectedCheckDigit === vin.charAt(8);
  }
}

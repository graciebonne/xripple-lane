import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowLeft, Lock, Eye, EyeOff, Globe } from 'lucide-react';

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const COUNTRIES = [
  { value: 'US', label: 'United States', flag: '🇺🇸' },
  { value: 'CA', label: 'Canada', flag: '🇨🇦' },
  { value: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'AU', label: 'Australia', flag: '🇦🇺' },
  { value: 'DE', label: 'Germany', flag: '🇩🇪' },
  { value: 'FR', label: 'France', flag: '🇫🇷' },
  { value: 'JP', label: 'Japan', flag: '🇯🇵' },
  { value: 'SG', label: 'Singapore', flag: '🇸🇬' },
  { value: 'CH', label: 'Switzerland', flag: '🇨🇭' },
  { value: 'NL', label: 'Netherlands', flag: '🇳🇱' },
  { value: 'SE', label: 'Sweden', flag: '🇸🇪' },
  { value: 'NO', label: 'Norway', flag: '🇳🇴' },
  { value: 'DK', label: 'Denmark', flag: '🇩🇰' },
  { value: 'IE', label: 'Ireland', flag: '🇮🇪' },
  { value: 'NZ', label: 'New Zealand', flag: '🇳🇿' },
];

export interface AddressData {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  ssn: string;
}

interface AddressFormProps {
  onSubmit: (data: AddressData) => void;
  onBack: () => void;
  initialData?: AddressData;
}

export function AddressForm({ onSubmit, onBack, initialData }: AddressFormProps) {
  const [data, setData] = useState<AddressData>(initialData || {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    ssn: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSSN, setShowSSN] = useState(false);

  const isUS = data.country === 'US';

  const formatPostalCode = (value: string) => {
    if (isUS) {
      return value.replace(/\D/g, '').slice(0, 5);
    }
    return value.slice(0, 10);
  };

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  };

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    setData({ ...data, ssn: formatted });
  };

  const handleCountryChange = (value: string) => {
    setData({ 
      ...data, 
      country: value, 
      state: '', 
      postalCode: '',
      ssn: value === 'US' ? data.ssn : '' 
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!data.city.trim()) newErrors.city = 'City is required';
    if (!data.country) newErrors.country = 'Country is required';
    
    if (isUS) {
      if (!data.state) newErrors.state = 'State is required';
      if (data.postalCode.length !== 5) newErrors.postalCode = 'Valid ZIP code is required';
      if (data.ssn.replace(/\D/g, '').length !== 9) newErrors.ssn = 'Valid SSN is required';
    } else {
      if (!data.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(data);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Residential Address</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Please enter your current residential address
        </p>
      </div>

      {/* Country Selection */}
      <div className="space-y-2">
        <Label htmlFor="country" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Country
        </Label>
        <Select 
          value={data.country} 
          onValueChange={handleCountryChange}
        >
          <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {COUNTRIES.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country && (
          <p className="text-xs text-destructive">{errors.country}</p>
        )}
      </div>

      {/* SSN for US users - shown right after country selection */}
      <AnimatePresence mode="wait">
        {isUS && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <Label htmlFor="ssn" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Social Security Number
            </Label>
            <div className="relative">
              <Input
                id="ssn"
                type={showSSN ? 'text' : 'password'}
                placeholder="XXX-XX-XXXX"
                value={data.ssn}
                onChange={handleSSNChange}
                className={`pr-10 ${errors.ssn ? 'border-destructive' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowSSN(!showSSN)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showSSN ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.ssn && (
              <p className="text-xs text-destructive">{errors.ssn}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Your SSN is encrypted and securely stored. Required for US residents.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <Label htmlFor="address1">Street Address</Label>
        <Input
          id="address1"
          placeholder="123 Main Street"
          value={data.addressLine1}
          onChange={(e) => setData({ ...data, addressLine1: e.target.value })}
          className={errors.addressLine1 ? 'border-destructive' : ''}
        />
        {errors.addressLine1 && (
          <p className="text-xs text-destructive">{errors.addressLine1}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address2">Apartment, Suite, etc. (optional)</Label>
        <Input
          id="address2"
          placeholder="Apt 4B"
          value={data.addressLine2}
          onChange={(e) => setData({ ...data, addressLine2: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="New York"
            value={data.city}
            onChange={(e) => setData({ ...data, city: e.target.value })}
            className={errors.city ? 'border-destructive' : ''}
          />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city}</p>
          )}
        </div>

        {isUS ? (
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select 
              value={data.state} 
              onValueChange={(value) => setData({ ...data, state: value })}
            >
              <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {US_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && (
              <p className="text-xs text-destructive">{errors.state}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="state">State / Province / Region</Label>
            <Input
              id="state"
              placeholder="Enter state or province"
              value={data.state}
              onChange={(e) => setData({ ...data, state: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="postal">{isUS ? 'ZIP Code' : 'Postal Code'}</Label>
        <Input
          id="postal"
          placeholder={isUS ? '10001' : 'Enter postal code'}
          value={data.postalCode}
          onChange={(e) => setData({ ...data, postalCode: formatPostalCode(e.target.value) })}
          className={`max-w-[200px] ${errors.postalCode ? 'border-destructive' : ''}`}
          maxLength={isUS ? 5 : 10}
        />
        {errors.postalCode && (
          <p className="text-xs text-destructive">{errors.postalCode}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          Continue
        </Button>
      </div>
    </motion.div>
  );
}

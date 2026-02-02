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
  { value: 'AF', label: 'Afghanistan', flag: '🇦🇫' },
  { value: 'AL', label: 'Albania', flag: '🇦🇱' },
  { value: 'DZ', label: 'Algeria', flag: '🇩🇿' },
  { value: 'AS', label: 'American Samoa', flag: '🇦🇸' },
  { value: 'AD', label: 'Andorra', flag: '🇦🇩' },
  { value: 'AO', label: 'Angola', flag: '🇦🇴' },
  { value: 'AI', label: 'Anguilla', flag: '🇦🇮' },
  { value: 'AQ', label: 'Antarctica', flag: '🇦🇶' },
  { value: 'AG', label: 'Antigua and Barbuda', flag: '🇦🇬' },
  { value: 'AR', label: 'Argentina', flag: '🇦🇷' },
  { value: 'AM', label: 'Armenia', flag: '🇦🇲' },
  { value: 'AW', label: 'Aruba', flag: '🇦🇼' },
  { value: 'AU', label: 'Australia', flag: '🇦🇺' },
  { value: 'AT', label: 'Austria', flag: '🇦🇹' },
  { value: 'AZ', label: 'Azerbaijan', flag: '🇦🇿' },
  { value: 'BS', label: 'Bahamas', flag: '🇧🇸' },
  { value: 'BH', label: 'Bahrain', flag: '🇧🇭' },
  { value: 'BD', label: 'Bangladesh', flag: '🇧🇩' },
  { value: 'BB', label: 'Barbados', flag: '🇧🇧' },
  { value: 'BY', label: 'Belarus', flag: '🇧🇾' },
  { value: 'BE', label: 'Belgium', flag: '🇧🇪' },
  { value: 'BZ', label: 'Belize', flag: '🇧🇿' },
  { value: 'BJ', label: 'Benin', flag: '🇧🇯' },
  { value: 'BM', label: 'Bermuda', flag: '🇧🇲' },
  { value: 'BT', label: 'Bhutan', flag: '🇧🇹' },
  { value: 'BO', label: 'Bolivia', flag: '🇧🇴' },
  { value: 'BA', label: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { value: 'BW', label: 'Botswana', flag: '🇧🇼' },
  { value: 'BR', label: 'Brazil', flag: '🇧🇷' },
  { value: 'IO', label: 'British Indian Ocean Territory', flag: '🇮🇴' },
  { value: 'BN', label: 'Brunei', flag: '🇧🇳' },
  { value: 'BG', label: 'Bulgaria', flag: '🇧🇬' },
  { value: 'BF', label: 'Burkina Faso', flag: '🇧🇫' },
  { value: 'BI', label: 'Burundi', flag: '🇧🇮' },
  { value: 'KH', label: 'Cambodia', flag: '🇰🇭' },
  { value: 'CM', label: 'Cameroon', flag: '🇨🇲' },
  { value: 'CA', label: 'Canada', flag: '🇨🇦' },
  { value: 'CV', label: 'Cape Verde', flag: '🇨🇻' },
  { value: 'KY', label: 'Cayman Islands', flag: '🇰🇾' },
  { value: 'CF', label: 'Central African Republic', flag: '🇨🇫' },
  { value: 'TD', label: 'Chad', flag: '🇹🇩' },
  { value: 'CL', label: 'Chile', flag: '🇨🇱' },
  { value: 'CN', label: 'China', flag: '🇨🇳' },
  { value: 'CO', label: 'Colombia', flag: '🇨🇴' },
  { value: 'KM', label: 'Comoros', flag: '🇰🇲' },
  { value: 'CG', label: 'Congo', flag: '🇨🇬' },
  { value: 'CR', label: 'Costa Rica', flag: '🇨🇷' },
  { value: 'HR', label: 'Croatia', flag: '🇭🇷' },
  { value: 'CU', label: 'Cuba', flag: '🇨🇺' },
  { value: 'CY', label: 'Cyprus', flag: '🇨🇾' },
  { value: 'CZ', label: 'Czech Republic', flag: '🇨🇿' },
  { value: 'DK', label: 'Denmark', flag: '🇩🇰' },
  { value: 'DJ', label: 'Djibouti', flag: '🇩🇯' },
  { value: 'DM', label: 'Dominica', flag: '🇩🇲' },
  { value: 'DO', label: 'Dominican Republic', flag: '🇩🇴' },
  { value: 'EC', label: 'Ecuador', flag: '🇪🇨' },
  { value: 'EG', label: 'Egypt', flag: '🇪🇬' },
  { value: 'SV', label: 'El Salvador', flag: '🇸🇻' },
  { value: 'GQ', label: 'Equatorial Guinea', flag: '🇬🇶' },
  { value: 'ER', label: 'Eritrea', flag: '🇪🇷' },
  { value: 'EE', label: 'Estonia', flag: '🇪🇪' },
  { value: 'ET', label: 'Ethiopia', flag: '🇪🇹' },
  { value: 'FK', label: 'Falkland Islands', flag: '🇫🇰' },
  { value: 'FO', label: 'Faroe Islands', flag: '🇫🇴' },
  { value: 'FJ', label: 'Fiji', flag: '🇫🇯' },
  { value: 'FI', label: 'Finland', flag: '🇫🇮' },
  { value: 'FR', label: 'France', flag: '🇫🇷' },
  { value: 'GF', label: 'French Guiana', flag: '🇬🇫' },
  { value: 'PF', label: 'French Polynesia', flag: '🇵🇫' },
  { value: 'TF', label: 'French Southern Territories', flag: '🇹🇫' },
  { value: 'GA', label: 'Gabon', flag: '🇬🇦' },
  { value: 'GM', label: 'Gambia', flag: '🇬🇲' },
  { value: 'GE', label: 'Georgia', flag: '🇬🇪' },
  { value: 'DE', label: 'Germany', flag: '🇩🇪' },
  { value: 'GH', label: 'Ghana', flag: '🇬🇭' },
  { value: 'GI', label: 'Gibraltar', flag: '🇬🇮' },
  { value: 'GR', label: 'Greece', flag: '🇬🇷' },
  { value: 'GL', label: 'Greenland', flag: '🇬🇱' },
  { value: 'GD', label: 'Grenada', flag: '🇬🇩' },
  { value: 'GP', label: 'Guadeloupe', flag: '🇬🇵' },
  { value: 'GU', label: 'Guam', flag: '🇬🇺' },
  { value: 'GT', label: 'Guatemala', flag: '🇬🇹' },
  { value: 'GG', label: 'Guernsey', flag: '🇬🇬' },
  { value: 'GN', label: 'Guinea', flag: '🇬🇳' },
  { value: 'GW', label: 'Guinea-Bissau', flag: '🇬🇼' },
  { value: 'GY', label: 'Guyana', flag: '🇬🇾' },
  { value: 'HT', label: 'Haiti', flag: '🇭🇹' },
  { value: 'HM', label: 'Heard Island and McDonald Islands', flag: '🇭🇲' },
  { value: 'HN', label: 'Honduras', flag: '🇭🇳' },
  { value: 'HK', label: 'Hong Kong', flag: '🇭🇰' },
  { value: 'HU', label: 'Hungary', flag: '🇭🇺' },
  { value: 'IS', label: 'Iceland', flag: '🇮🇸' },
  { value: 'IN', label: 'India', flag: '🇮🇳' },
  { value: 'ID', label: 'Indonesia', flag: '🇮🇩' },
  { value: 'IR', label: 'Iran', flag: '🇮🇷' },
  { value: 'IQ', label: 'Iraq', flag: '🇮🇶' },
  { value: 'IE', label: 'Ireland', flag: '🇮🇪' },
  { value: 'IM', label: 'Isle of Man', flag: '🇮🇲' },
  { value: 'IL', label: 'Israel', flag: '🇮🇱' },
  { value: 'IT', label: 'Italy', flag: '🇮🇹' },
  { value: 'CI', label: 'Ivory Coast', flag: '🇨🇮' },
  { value: 'JM', label: 'Jamaica', flag: '🇯🇲' },
  { value: 'JP', label: 'Japan', flag: '🇯🇵' },
  { value: 'JE', label: 'Jersey', flag: '🇯🇪' },
  { value: 'JO', label: 'Jordan', flag: '🇯🇴' },
  { value: 'KZ', label: 'Kazakhstan', flag: '🇰🇿' },
  { value: 'KE', label: 'Kenya', flag: '🇰🇪' },
  { value: 'KI', label: 'Kiribati', flag: '🇰🇮' },
  { value: 'KP', label: 'North Korea', flag: '🇰🇵' },
  { value: 'KR', label: 'South Korea', flag: '🇰🇷' },
  { value: 'KW', label: 'Kuwait', flag: '🇰🇼' },
  { value: 'KG', label: 'Kyrgyzstan', flag: '🇰🇬' },
  { value: 'LA', label: 'Laos', flag: '🇱🇦' },
  { value: 'LV', label: 'Latvia', flag: '🇱🇻' },
  { value: 'LB', label: 'Lebanon', flag: '🇱🇧' },
  { value: 'LS', label: 'Lesotho', flag: '🇱🇸' },
  { value: 'LR', label: 'Liberia', flag: '🇱🇷' },
  { value: 'LY', label: 'Libya', flag: '🇱🇾' },
  { value: 'LI', label: 'Liechtenstein', flag: '🇱🇮' },
  { value: 'LT', label: 'Lithuania', flag: '🇱🇹' },
  { value: 'LU', label: 'Luxembourg', flag: '🇱🇺' },
  { value: 'MO', label: 'Macao', flag: '🇲🇴' },
  { value: 'MK', label: 'North Macedonia', flag: '🇲🇰' },
  { value: 'MG', label: 'Madagascar', flag: '🇲🇬' },
  { value: 'MW', label: 'Malawi', flag: '🇲🇼' },
  { value: 'MY', label: 'Malaysia', flag: '🇲🇾' },
  { value: 'MV', label: 'Maldives', flag: '🇲🇻' },
  { value: 'ML', label: 'Mali', flag: '🇲🇱' },
  { value: 'MT', label: 'Malta', flag: '🇲🇹' },
  { value: 'MH', label: 'Marshall Islands', flag: '🇲🇭' },
  { value: 'MQ', label: 'Martinique', flag: '🇲🇶' },
  { value: 'MR', label: 'Mauritania', flag: '🇲🇷' },
  { value: 'MU', label: 'Mauritius', flag: '🇲🇺' },
  { value: 'YT', label: 'Mayotte', flag: '🇾🇹' },
  { value: 'MX', label: 'Mexico', flag: '🇲🇽' },
  { value: 'FM', label: 'Micronesia', flag: '🇫🇲' },
  { value: 'MD', label: 'Moldova', flag: '🇲🇩' },
  { value: 'MC', label: 'Monaco', flag: '🇲🇨' },
  { value: 'MN', label: 'Mongolia', flag: '🇲🇳' },
  { value: 'ME', label: 'Montenegro', flag: '🇲🇪' },
  { value: 'MA', label: 'Morocco', flag: '🇲🇦' },
  { value: 'MZ', label: 'Mozambique', flag: '🇲🇿' },
  { value: 'MM', label: 'Myanmar', flag: '🇲🇲' },
  { value: 'NA', label: 'Namibia', flag: '🇳🇦' },
  { value: 'NR', label: 'Nauru', flag: '🇳🇷' },
  { value: 'NP', label: 'Nepal', flag: '🇳🇵' },
  { value: 'NL', label: 'Netherlands', flag: '🇳🇱' },
  { value: 'NC', label: 'New Caledonia', flag: '🇳🇨' },
  { value: 'NZ', label: 'New Zealand', flag: '🇳🇿' },
  { value: 'NI', label: 'Nicaragua', flag: '🇳🇮' },
  { value: 'NE', label: 'Niger', flag: '🇳🇪' },
  { value: 'NG', label: 'Nigeria', flag: '🇳🇬' },
  { value: 'NU', label: 'Niue', flag: '🇳🇺' },
  { value: 'NF', label: 'Norfolk Island', flag: '🇳🇫' },
  { value: 'MP', label: 'Northern Mariana Islands', flag: '🇲🇵' },
  { value: 'NO', label: 'Norway', flag: '🇳🇴' },
  { value: 'OM', label: 'Oman', flag: '🇴🇲' },
  { value: 'PK', label: 'Pakistan', flag: '🇵🇰' },
  { value: 'PW', label: 'Palau', flag: '🇵🇼' },
  { value: 'PS', label: 'Palestine', flag: '🇵🇸' },
  { value: 'PA', label: 'Panama', flag: '🇵🇦' },
  { value: 'PG', label: 'Papua New Guinea', flag: '🇵🇬' },
  { value: 'PY', label: 'Paraguay', flag: '🇵🇾' },
  { value: 'PE', label: 'Peru', flag: '🇵🇪' },
  { value: 'PH', label: 'Philippines', flag: '🇵🇭' },
  { value: 'PN', label: 'Pitcairn', flag: '🇵🇳' },
  { value: 'PL', label: 'Poland', flag: '🇵🇱' },
  { value: 'PT', label: 'Portugal', flag: '🇵🇹' },
  { value: 'PR', label: 'Puerto Rico', flag: '🇵🇷' },
  { value: 'QA', label: 'Qatar', flag: '🇶🇦' },
  { value: 'RE', label: 'Reunion', flag: '🇷🇪' },
  { value: 'RO', label: 'Romania', flag: '🇷🇴' },
  { value: 'RU', label: 'Russia', flag: '🇷🇺' },
  { value: 'RW', label: 'Rwanda', flag: '🇷🇼' },
  { value: 'BL', label: 'Saint Barthelemy', flag: '🇧🇱' },
  { value: 'SH', label: 'Saint Helena', flag: '🇸🇭' },
  { value: 'KN', label: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { value: 'LC', label: 'Saint Lucia', flag: '🇱🇨' },
  { value: 'MF', label: 'Saint Martin', flag: '🇲🇫' },
  { value: 'PM', label: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  { value: 'VC', label: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { value: 'WS', label: 'Samoa', flag: '🇼🇸' },
  { value: 'SM', label: 'San Marino', flag: '🇸🇲' },
  { value: 'ST', label: 'Sao Tome and Principe', flag: '🇸🇹' },
  { value: 'SA', label: 'Saudi Arabia', flag: '🇸🇦' },
  { value: 'SN', label: 'Senegal', flag: '🇸🇳' },
  { value: 'RS', label: 'Serbia', flag: '🇷🇸' },
  { value: 'SC', label: 'Seychelles', flag: '🇸🇨' },
  { value: 'SL', label: 'Sierra Leone', flag: '🇸🇱' },
  { value: 'SG', label: 'Singapore', flag: '🇸🇬' },
  { value: 'SX', label: 'Sint Maarten', flag: '🇸🇽' },
  { value: 'SK', label: 'Slovakia', flag: '🇸🇰' },
  { value: 'SI', label: 'Slovenia', flag: '🇸🇮' },
  { value: 'SB', label: 'Solomon Islands', flag: '🇸🇧' },
  { value: 'SO', label: 'Somalia', flag: '🇸🇴' },
  { value: 'ZA', label: 'South Africa', flag: '🇿🇦' },
  { value: 'SS', label: 'South Sudan', flag: '🇸🇸' },
  { value: 'ES', label: 'Spain', flag: '🇪🇸' },
  { value: 'LK', label: 'Sri Lanka', flag: '🇱🇰' },
  { value: 'SD', label: 'Sudan', flag: '🇸🇩' },
  { value: 'SR', label: 'Suriname', flag: '🇸🇷' },
  { value: 'SJ', label: 'Svalbard and Jan Mayen', flag: '🇸🇯' },
  { value: 'SE', label: 'Sweden', flag: '🇸🇪' },
  { value: 'CH', label: 'Switzerland', flag: '🇨🇭' },
  { value: 'SY', label: 'Syria', flag: '🇸🇾' },
  { value: 'TW', label: 'Taiwan', flag: '🇹🇼' },
  { value: 'TJ', label: 'Tajikistan', flag: '🇹🇯' },
  { value: 'TZ', label: 'Tanzania', flag: '🇹🇿' },
  { value: 'TH', label: 'Thailand', flag: '🇹🇭' },
  { value: 'TL', label: 'Timor-Leste', flag: '🇹🇱' },
  { value: 'TG', label: 'Togo', flag: '🇹🇬' },
  { value: 'TK', label: 'Tokelau', flag: '🇹🇰' },
  { value: 'TO', label: 'Tonga', flag: '🇹🇴' },
  { value: 'TT', label: 'Trinidad and Tobago', flag: '🇹🇹' },
  { value: 'TN', label: 'Tunisia', flag: '🇹🇳' },
  { value: 'TR', label: 'Turkey', flag: '🇹🇷' },
  { value: 'TM', label: 'Turkmenistan', flag: '🇹🇲' },
  { value: 'TV', label: 'Tuvalu', flag: '🇹🇻' },
  { value: 'UG', label: 'Uganda', flag: '🇺🇬' },
  { value: 'UA', label: 'Ukraine', flag: '🇺🇦' },
  { value: 'AE', label: 'United Arab Emirates', flag: '🇦🇪' },
  { value: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'US', label: 'United States', flag: '🇺🇸' },
  { value: 'UY', label: 'Uruguay', flag: '🇺🇾' },
  { value: 'UZ', label: 'Uzbekistan', flag: '🇺🇿' },
  { value: 'VU', label: 'Vanuatu', flag: '🇻🇺' },
  { value: 'VA', label: 'Vatican City', flag: '🇻🇦' },
  { value: 'VE', label: 'Venezuela', flag: '🇻🇪' },
  { value: 'VN', label: 'Vietnam', flag: '🇻🇳' },
  { value: 'VG', label: 'Virgin Islands (British)', flag: '🇻🇬' },
  { value: 'VI', label: 'Virgin Islands (U.S.)', flag: '🇻🇮' },
  { value: 'WF', label: 'Wallis and Futuna', flag: '🇼🇫' },
  { value: 'EH', label: 'Western Sahara', flag: '🇪🇭' },
  { value: 'YE', label: 'Yemen', flag: '🇾🇪' },
  { value: 'ZM', label: 'Zambia', flag: '🇿🇲' },
  { value: 'ZW', label: 'Zimbabwe', flag: '🇿🇼' },
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

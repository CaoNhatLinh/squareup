import { HiSearch } from 'react-icons/hi';
import Input from '@/components/ui/Input';

export default function SearchBar({ value, onChange, placeholder = 'Search' }) {
  return (
    <div className="relative flex-1 max-w-md">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        leftIcon={HiSearch}
        fullWidth
      />
    </div>
  );
}

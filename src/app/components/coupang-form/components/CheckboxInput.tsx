import { type ChangeEvent } from 'react';

type CheckboxInputProps = {
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
};

export function CheckboxInput({ name, label, checked, onChange, error }: CheckboxInputProps) {
  return (
    <div className="space-y-1">
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className={`mt-1 w-5 h-5 text-[#ff6b35] border-gray-300 rounded focus:ring-[#ff6b35] ${
            error ? 'border-red-500' : ''
          }`}
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
      {error && <p className="text-sm text-red-600 ml-8">{error}</p>}
    </div>
  );
}

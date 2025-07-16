interface InputProps {
  placeholder?: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({ placeholder, type = "text", ...rest }: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-gray-300"
      {...rest}
    />
  );
}

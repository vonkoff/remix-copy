type Props = {
  name: string;
  type: string;
  accept?: string;
  placeholder?: string;
  pattern?: string;
  onChange?: any;
  checked?: boolean;
  defaultChecked?: boolean;
  value?: string | number;
  id?: string;
  minlength?: number;
  required?: boolean;
};

function Input({
  name,
  type,
  accept,
  onChange,
  placeholder,
  pattern,
  checked,
  defaultChecked,
  minlength,
  required,
  value,
  id,
}: Props) {
  return (
    <>
      <input
        type={type}
        name={name}
        className={`
      ${
        type !== 'radio' && type !== 'checkbox'
          ? 'block w-full sm:text-sm rounded-md text-gray-800 pl-2 appearance-none'
          : ''
      }
      ${
        type === 'radio'
          ? `relative mr-2 appearance-none bg-white cursor-pointer rounded-lg
       w-[2.1rem]  checked:after:content-['✅']
      after:absolute after:top-[-2.5px] after:left-[2px] after:text-2xl
       sm:w-9
      `
          : ''
      }
      ${type === 'checkbox' ? `relative mr-2 cursor-pointer h-6 w-6` : ''}
      ${
        type === 'file'
          ? 'text-transparent appearance-none '
          : 'border-solid border-2 border-yellow-500 shadow-sm'
      }
      ${type !== 'color' ? '' : 'w-24 pr-2 cursor-pointer '}`}
        // Optional
        accept={accept}
        onChange={onChange}
        placeholder={placeholder}
        pattern={pattern}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        id={id}
        minLength={minlength}
        required={required}
      />
    </>
  );
}

export default Input;

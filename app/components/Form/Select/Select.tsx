type Props = {
  name: string;
  required?: boolean;
  optionList: {
    value: string;
    label: string;
  }[];
  onChange?: any;
};

function Select({ name, optionList, required, onChange }: Props) {
  const options = optionList.map((val, index) => (
    <option key={index} value={val.value}>
      {val.label}
    </option>
  ));

  return (
    <>
      <select
        name={name}
        className="shadow-sm block w-full sm:text-xs cursor-pointer 
      rounded-md  text-gray-800 pl-2 border-solid border-2 border-yellow-500 appearance-none"
        style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        required={required}
        onChange={onChange}
      >
        {options}
      </select>
    </>
  );
}

export default Select;

type Props = {
  name: string,
  label: string
}

function InputFile({name, label}: Props){
  return (
    <>
      <label htmlFor={name} className="block font-medium text-black-400 text-lg mt-2">{label}</label>
      <input type="file" name={name} className="shadow-sm block w-full h-8 sm:text-sm 
      rounded-md text-gray-800 pl-2 border-solid border-2 border-yellow-500"/>
    </>
  )
}

export default InputFile
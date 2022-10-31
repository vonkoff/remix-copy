type Props = {
  name: string,
  value: string,
  //! MAYBE FIX LATER?
  onChange: any
}

function TextArea({name, value, onChange}: Props){
  return (
    <>
      <textarea id={name} name={name} value={value} onChange={onChange}
          className="shadow-sm block w-full sm:text-sm 
          rounded-md text-gray-800 pl-2 border-solid border-2 border-yellow-500"
      />
    </>
  )
}

export default TextArea
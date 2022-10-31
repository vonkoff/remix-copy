type Props = {
  name: string,
  label: string,
}

function Label({name, label}: Props){
  return (
    <>
      <label 
        htmlFor={name} 
        className="font-Atkinson block my-2 pl-2  whitespace-nowrap rounded font-black text-black-400 text-xl"
      >
        {label}
      </label>
    </>
  )
}

export default Label
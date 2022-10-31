import type { ChangeEventHandler } from 'react';
import { Input } from '../Input';

const ListItem: React.FC<{
  name: string;
  text: string;
  handleOnChange: ChangeEventHandler;
  selected: boolean;
}> = ({ name, text, handleOnChange, selected }) => {
  return (
    <div className="flex items-center mt-2">
      <Input
        type="checkbox"
        name={name}
        id={name}
        checked={selected}
        onChange={handleOnChange}
      ></Input>
      <label className="text-lg cursor-pointer hover:opacity-70" htmlFor={name}>
        {text}
      </label>
    </div>
  );
};

export default ListItem;

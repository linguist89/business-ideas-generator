import { Label, Textarea } from 'flowbite-react';
import React from 'react';

function CustomTextarea({ instructions, placeholder, infoSetter, defaultValue  }) {

    React.useEffect(() => {
      infoSetter(defaultValue);
    }, []);

  return (
    <div
      id="textarea"
    >
      <div className="mb-2 block">
        <Label
          htmlFor={instructions}
          value={instructions}
        />
      </div>
      <Textarea
        id={instructions}
        placeholder={defaultValue}
        defaultValue={defaultValue}
        required
        rows={4}
        onChange={(event) => {
          infoSetter(event.target.value);
        }}
      />
    </div>
  )
}

export default CustomTextarea;

import React from 'react';
import './CustomTextarea.css';

function CustomTextarea({ instructions, placeholder, infoSetter, defaultValue }) {

  React.useEffect(() => {
    infoSetter(defaultValue);
    // eslint-disable-next-line
  }, []);

  return (
    <div id="textarea">
      <div>
        <label htmlFor={instructions} className="custom-label">
          {instructions}
        </label>
      </div>
      <textarea
        id={instructions}
        placeholder={defaultValue}
        defaultValue={defaultValue}
        required
        rows={4}
        className="custom-textarea"
        onChange={(event) => {
          infoSetter(event.target.value);
        }}
      />
    </div>
  )
}

export default CustomTextarea;

import PropTypes from 'prop-types';

import classes from './TextInput.module.css';

const TextInput = (props) => {
  const onChange = (event) => {
    const { target: { value } } = event;
    props.onChange(value)
  }

  return (
    <div className={classes.base}>
      <div>{props.label}</div>
      <input type="text" className={classes.input} value={props.value || ''} onChange={onChange} />
    </div>
  );
};

TextInput.propsTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  onChange: PropTypes.func
};

export default TextInput;

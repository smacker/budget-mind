import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import {
  currencyFormat,
  currencyNumberFormat,
  currencySymbol,
  parseCurrencyStringOrZero,
} from '../formatters';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function AmountInput({
  amount,
  onChange,
  onFocus,
  onBlur,
  refCallback,
  sx,
}: {
  amount: number;
  onChange?: (v: number, next?: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  refCallback?: React.RefCallback<HTMLInputElement>;
  sx?: any; // FIXME: need proper typing
}) {
  const inputRef = useRef<HTMLInputElement>();
  const [value, setValue] = useState(currencyFormat(amount / 100));
  const [focused, setFocused] = useState<boolean>(false);
  const [needChange, setNeedChange] = useState<boolean>(true);

  // Assume the amount never changes while the input is in "edit" mode
  useEffect(() => {
    setValue(currencyFormat(amount / 100));
  }, [amount]);

  const handleOnFocus = useCallback(() => {
    setValue(currencyNumberFormat(amount / 100));
    setFocused(true);
    setNeedChange(true);
  }, [amount]);

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.code === 'Enter') {
        inputRef.current?.blur();
        return;
      }
      if (e.code === 'Escape') {
        setNeedChange(false);
        setValue(currencyFormat(amount / 100));
        // we need timeout here to be able to update states before triggering onBlur() of the input
        // is there a better API in react for this?
        setTimeout(() => {
          inputRef.current?.blur();
        }, 0);
        return;
      }
    },
    [amount, setValue, setNeedChange]
  );

  return (
    <TextField
      sx={{
        ...sx,
        '& .MuiOutlinedInput-root': {
          paddingLeft: '6px',
          ...sx?.['& .MuiOutlinedInput-root'],
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'transparent',
          ...sx?.['& .MuiOutlinedInput-notchedOutline'],
        },
        input: {
          textAlign: 'right',
          ...sx?.input,
        },
      }}
      size="small"
      placeholder={currencyFormat(amount / 100)}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onFocus={() => {
        handleOnFocus();
        if (onFocus) {
          onFocus();
        }
      }}
      onBlur={() => {
        setFocused(false);
        if (onChange && needChange) {
          onChange(parseCurrencyStringOrZero(value) * 100, false);
        }
        if (onBlur) {
          onBlur();
        }
      }}
      onKeyUp={handleKeyUp}
      label={null}
      inputRef={inputRef}
      slotProps={{
        input: {
          startAdornment: focused ? (
            <InputAdornment position="start">{currencySymbol}</InputAdornment>
          ) : undefined,
          inputMode: 'decimal',
          ref: refCallback,
        },
      }}
    />
  );
}

import { useState, useCallback, useRef } from 'react';
import TextField from '@mui/material/TextField';

export default function ConfirmableInput({
  value,
  onChange,
  onFocus,
  onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>();
  const [v, setV] = useState(value);
  const [needChange, setNeedChange] = useState<boolean>(true);

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.code === 'Enter') {
        inputRef.current?.blur();
        return;
      }
      if (e.code === 'Escape') {
        setNeedChange(false);
        setV(value);
        // we need timeout here to be able to update states before triggering onBlur() of the input
        // is there a better API in react for this?
        setTimeout(() => {
          inputRef.current?.blur();
        }, 0);
        return;
      }
    },
    [value, setV, setNeedChange]
  );

  return (
    <TextField
      size="small"
      sx={{
        position: 'absolute',
        display: 'block',
        top: 0,
        left: '10px',
        right: '10px',
        bottom: 0,
        '& .MuiOutlinedInput-root': {
          width: '100%',
        },
        input: {
          fontSize: '0.875rem',
          padding: '6px',
        },
      }}
      onFocus={() => {
        setNeedChange(true);
        onFocus();
      }}
      onBlur={() => {
        if (needChange) {
          onChange(v);
        }
        onBlur();
      }}
      value={v}
      onChange={(e) => setV(e.target.value)}
      inputRef={inputRef}
      onKeyUp={handleKeyUp}
    />
  );
}

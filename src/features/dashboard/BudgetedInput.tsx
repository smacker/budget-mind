import ClickAwayListener from '@mui/material/ClickAwayListener';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';

import {
  currencyFormat,
  currencyNumberFormat,
  currencySymbol,
  parseCurrencyStringOrZero,
} from '../../core/formatters';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function BudgetedInput({
  amount,
  onChange,
  monthlyBudget,
  available,
  goal,
}: {
  amount: number;
  onChange: (v: number, next?: boolean) => void;
  available: number;
  monthlyBudget?: number;
  goal?: number;
}) {
  const inputRef = useRef<HTMLInputElement>();
  const [value, setValue] = useState(currencyFormat(amount / 100));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [focused, setFocused] = useState<boolean>(false);
  const [popupOpen, setPopupOpen] = useState<boolean>(false);

  // Assume the amount never changes while the input is in "edit" mode
  useEffect(() => {
    setValue(currencyFormat(amount / 100));
  }, [amount]);

  const options = useMemo(() => {
    const options: { amount: number; label: string }[] = [];

    // Editing non-budgeted budgeted category is the main use-case
    if (amount === 0) {
      if (monthlyBudget) {
        if (
          available < monthlyBudget &&
          monthlyBudget != monthlyBudget - available
        ) {
          options.push({
            amount: monthlyBudget - available,
            label: `To monthly amount`,
          });
        }
        options.push({
          amount: monthlyBudget,
          label: `Monthly amount`,
        });
      }
      if (goal && available < goal) {
        options.push({
          amount: goal - available,
          label: `Complete goal`,
        });
      }
      return options;
    } else if (available < 0) {
      options.push({
        amount: amount - available,
        label: `Cover overspending`,
      });
    }

    return options;
  }, [amount, monthlyBudget, goal, available]);

  // keep focused state in sync with popup
  useEffect(() => {
    setPopupOpen(focused);
  }, [focused]);

  const handleOnFocus = useCallback(() => {
    setValue(currencyNumberFormat(amount / 100));
    setFocused(true);
  }, [amount]);

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.code === 'Enter') {
        inputRef.current?.blur();
        onChange(parseCurrencyStringOrZero(value) * 100, true);
        return;
      }
      if (e.code === 'Escape') {
        inputRef.current?.blur();
        setValue(currencyFormat(amount / 100));
        return;
      }
    },
    [value, amount, setValue, onChange]
  );

  const handleClickAway = useCallback(() => {
    if (!focused) {
      return;
    }
    const v = parseCurrencyStringOrZero(value);
    setValue(currencyFormat(v));
    if (v * 100 !== amount) {
      onChange(v * 100);
    }
  }, [focused, value, amount, onChange]);

  return (
    <ClickAwayListener
      mouseEvent="onMouseDown"
      touchEvent="onTouchStart"
      onClickAway={handleClickAway}
    >
      <Box>
        <TextField
          sx={{
            '& .MuiOutlinedInput-root': {
              paddingLeft: '6px',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
            input: {
              textAlign: 'right',
              fontSize: '0.875rem',
              padding: '4.5px 6px',
            },
          }}
          size="small"
          placeholder={currencyFormat(amount / 100)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={handleOnFocus}
          onBlur={() => setFocused(false)}
          onKeyUp={handleKeyUp}
          label={null}
          inputRef={inputRef}
          InputProps={{
            startAdornment: focused ? (
              <InputAdornment position="start">{currencySymbol}</InputAdornment>
            ) : undefined,
            inputMode: 'decimal',
            ref: setAnchorEl,
          }}
        />
        {options.length && anchorEl ? (
          <Popper open={popupOpen} anchorEl={anchorEl}>
            <Paper>
              <List>
                {options.map((option, i) => (
                  <ListItem key={i} disablePadding>
                    <ListItemButton onClick={() => onChange(option.amount)}>
                      <ListItemText
                        primary={currencyFormat(option.amount / 100)}
                        secondary={option.label}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Popper>
        ) : undefined}
      </Box>
    </ClickAwayListener>
  );
}

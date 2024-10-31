import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import { currencyFormat } from '../../core/formatters';

import { useEffect, useMemo, useState } from 'react';
import AmountInput from '../../core/components/AmountInput';

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [focused, setFocused] = useState<boolean>(false);
  const [popupOpen, setPopupOpen] = useState<boolean>(false);

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
    // add a small delay to prevent the popup from closing when clicking on it
    setTimeout(() => setPopupOpen(focused), 100);
  }, [focused]);

  return (
    <Box>
      <AmountInput
        amount={amount}
        onChange={onChange}
        sx={{
          input: {
            fontSize: '0.875rem',
            padding: '4.5px 6px',
          },
        }}
        refCallback={setAnchorEl}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
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
  );
}

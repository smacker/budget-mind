import { useCallback, useState } from 'react';

import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { useStore } from '@nanostores/react';

import { SteppedAmount } from '../../core/components/SteppedAmount';
import { $categories } from '../../core/state';
import { moveAmountToCategory } from './state';
import {
  currencyNumberFormat,
  parseCurrencyStringOrZero,
} from '../../core/formatters';

type actions = 'cover' | 'transferTo' | 'transferFrom';

function ActionList({
  amount,
  onClick,
}: {
  amount: number;
  onClick: (action: actions) => void;
}) {
  return (
    <List>
      {amount < 0 ? (
        <ListItem disablePadding>
          <ListItemButton onClick={() => onClick('cover')}>
            <ListItemText primary="Cover overspending" />
          </ListItemButton>
        </ListItem>
      ) : undefined}
      <ListItem disablePadding>
        <ListItemButton onClick={() => onClick('transferTo')}>
          <ListItemText primary="Transfer to another category" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton onClick={() => onClick('transferFrom')}>
          <ListItemText primary="Transfer from another category" />
        </ListItemButton>
      </ListItem>
    </List>
  );
}

function ActionBox({
  categoryLabel,
  currentCategoryName,
  suggestedAmount,
  onSubmit,
}: {
  categoryLabel: string;
  currentCategoryName: string;
  suggestedAmount?: number;
  onSubmit: (selectedCategoryName: string, amount: number) => void;
}) {
  const categories = useStore($categories).filter(
    (c) => c.name !== currentCategoryName
  );

  const [amount, setAmount] = useState<string>(
    suggestedAmount ? currencyNumberFormat(suggestedAmount / 100) : ''
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  return (
    <Box padding="10px">
      <Autocomplete
        size="small"
        renderInput={(params) => (
          <TextField {...params} required label={categoryLabel} />
        )}
        options={categories}
        getOptionLabel={(option) => option.name}
        groupBy={(option) => option.group}
        filterSelectedOptions
        fullWidth
        value={categories.find((c) => c.name === selectedCategoryName) || null}
        onChange={(_e, value) => {
          setSelectedCategoryName(value?.name || '');
        }}
        sx={{ marginBottom: '10px' }}
      />
      <TextField
        size="small"
        required
        fullWidth
        type="number"
        label="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        sx={{ marginBottom: '10px' }}
      />
      <Box textAlign="right">
        <Button
          size="small"
          disabled={
            !selectedCategoryName || parseCurrencyStringOrZero(amount) <= 0
          }
          onClick={() =>
            onSubmit(
              selectedCategoryName,
              parseCurrencyStringOrZero(amount) * 100
            )
          }
        >
          Transfer
        </Button>
      </Box>
    </Box>
  );
}

function ActionMoveTo({
  categoryNameFrom,
  onSubmit,
}: {
  categoryNameFrom: string;
  onSubmit: () => void;
}) {
  const submit = useCallback(
    (selectedCategoryName: string, amount: number) => {
      moveAmountToCategory(selectedCategoryName, categoryNameFrom, amount);
      onSubmit();
    },
    [categoryNameFrom, onSubmit]
  );

  return (
    <ActionBox
      categoryLabel="To Category"
      currentCategoryName={categoryNameFrom}
      onSubmit={submit}
    />
  );
}

function ActionMoveFrom({
  categoryNameTo,
  amount,
  onSubmit,
}: {
  categoryNameTo: string;
  amount?: number;
  onSubmit: () => void;
}) {
  const submit = useCallback(
    (selectedCategoryName: string, amount: number) => {
      moveAmountToCategory(categoryNameTo, selectedCategoryName, amount);
      onSubmit();
    },
    [categoryNameTo, onSubmit]
  );

  return (
    <ActionBox
      categoryLabel="From Category"
      currentCategoryName={categoryNameTo}
      suggestedAmount={amount}
      onSubmit={submit}
    />
  );
}

export function AvailableAmount({
  categoryName,
  amount,
  target,
}: {
  categoryName: string;
  amount: number;
  target?: number;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [state, setState] = useState<'select' | actions>('select');

  const closePopup = useCallback(() => {
    setAnchorEl(null);
    setState('select');
  }, [setAnchorEl, setState]);

  let content;
  switch (state) {
    case 'cover':
      content = (
        <ActionMoveFrom
          categoryNameTo={categoryName}
          amount={-amount}
          onSubmit={closePopup}
        />
      );
      break;
    case 'transferTo':
      content = (
        <ActionMoveTo categoryNameFrom={categoryName} onSubmit={closePopup} />
      );
      break;
    case 'transferFrom':
      content = (
        <ActionMoveFrom categoryNameTo={categoryName} onSubmit={closePopup} />
      );
      break;
    default:
      content = (
        <ActionList amount={amount} onClick={(action) => setState(action)} />
      );
  }

  return (
    <>
      <SteppedAmount
        amount={amount}
        target={target}
        onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}
        sx={{ paddingTop: '2px', paddingBottom: '2px' }}
      />
      <Popper open={!!anchorEl} anchorEl={anchorEl}>
        <ClickAwayListener onClickAway={closePopup}>
          <Paper>{content}</Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}

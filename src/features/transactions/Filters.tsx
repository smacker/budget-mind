import Box, { BoxProps } from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Popper from '@mui/material/Popper';
import {
  DateField,
  Field,
  NumberField,
  StringField,
  addCondition,
  dateFields,
  numberFields,
  stringFields,
} from './state';
import { DateFilterBox, NumberFilterBox, StringFilterBox } from './FilterBox';

import { useState } from 'react';
import { $accounts, $categories } from '../../core/state';

type FilterState = {
  field: Field;
  anchor: HTMLElement;
  options?: string[];
};

function getOptionsStore(field: string) {
  switch (field) {
    case 'account':
      return $accounts.get().map((account) => account.name);
    case 'category':
      return $categories.get().map((category) => category.name);
  }

  return;
}

export function Filters(props: BoxProps) {
  const [currentFilter, setCurrentFilter] = useState<FilterState | null>(null);

  const handleFilterClick = (
    event: React.MouseEvent<HTMLElement>,
    field: Field
  ) => {
    if (currentFilter?.field === field) {
      setCurrentFilter(null);
    } else {
      setCurrentFilter({
        field,
        anchor: event.currentTarget,
        options: getOptionsStore(field),
      });
    }
  };

  let popper;
  if (currentFilter) {
    const { field, anchor, options } = currentFilter;
    let filterBox;
    if (dateFields.includes(field as DateField)) {
      filterBox = (
        <DateFilterBox
          field={field as DateField}
          onApply={(v) => {
            addCondition(v);
            setCurrentFilter(null);
          }}
        />
      );
    } else if (stringFields.includes(field as StringField)) {
      filterBox = (
        <StringFilterBox
          field={field as StringField}
          options={options}
          onApply={(v) => {
            addCondition(v);
            setCurrentFilter(null);
          }}
        />
      );
    } else if (numberFields.includes(field as NumberField)) {
      filterBox = (
        <NumberFilterBox
          field={field as NumberField}
          onApply={(v) => {
            addCondition(v);
            setCurrentFilter(null);
          }}
        />
      );
    }
    popper = (
      <Popper open={true} anchorEl={anchor} sx={{ zIndex: 2 }}>
        {filterBox}
      </Popper>
    );
  }

  return (
    <Box {...props}>
      <Box display="flex" flexDirection="row" alignItems="center">
        <ClickAwayListener onClickAway={() => setCurrentFilter(null)}>
          <Box>
            <ButtonGroup>
              <Button onClick={(e) => handleFilterClick(e, 'date')}>
                Date
              </Button>
              <Button onClick={(e) => handleFilterClick(e, 'account')}>
                Account
              </Button>
              <Button onClick={(e) => handleFilterClick(e, 'category')}>
                Category
              </Button>
              <Button onClick={(e) => handleFilterClick(e, 'amount')}>
                Amount
              </Button>
              <Button onClick={(e) => handleFilterClick(e, 'memo')}>
                Memo
              </Button>
            </ButtonGroup>
            {popper}
          </Box>
        </ClickAwayListener>
      </Box>
    </Box>
  );
}

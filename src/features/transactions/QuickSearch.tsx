import { useState } from 'react';
import { useStore } from '@nanostores/react';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { $quickSearch } from './state';

export default function QuickSearch() {
  const [focused, setFocus] = useState(false);
  const quickSearch = useStore($quickSearch);

  return (
    <FormControl
      variant="outlined"
      sx={{
        width: focused ? 400 : undefined,
        transition: (theme) => theme.transitions.create('width'),
      }}
    >
      <OutlinedInput
        size="small"
        id="search"
        placeholder="Quick Search…"
        sx={{ flexGrow: 1 }}
        startAdornment={
          <InputAdornment position="start" sx={{ color: 'text.primary' }}>
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        }
        inputProps={{
          'aria-label': 'search',
        }}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        autoComplete="off"
        value={quickSearch}
        onChange={(event) => $quickSearch.set(event.target.value)}
      />
    </FormControl>
  );
}

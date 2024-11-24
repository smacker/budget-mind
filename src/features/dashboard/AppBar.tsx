import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useStore } from '@nanostores/react';
import { $availableYears, $selectedMonth } from './state';
import { Tab, Tabs } from '@mui/material';
import { $locale } from '../../core/state';

const formatter = new Intl.DateTimeFormat($locale.get(), { month: 'short' }).format;
const months = [...Array(12).keys()].map((m) => ({
  month: m,
  title: formatter(new Date(2023, m)),
}));

export default function AppBar() {
  const selectedMonth = useStore($selectedMonth);
  const availableYears = useStore($availableYears);

  const handleChangeYear = (event: SelectChangeEvent) => {
    $selectedMonth.set(new Date(+event.target.value, selectedMonth.getMonth()));
  };

  return (
    <Box
      display="flex"
      flexGrow={1}
      fontWeight="bold"
      justifyContent="space-between"
    >
      <Select
        variant="standard"
        renderValue={(value) => (
          <Typography fontWeight="bold" fontSize="1.5em">
            {value}
          </Typography>
        )}
        value={selectedMonth.getFullYear().toString()}
        onChange={handleChangeYear}
      >
        {availableYears.map((year) => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
      </Select>
      <Tabs
        value={selectedMonth.getMonth()}
        onChange={(_e, v) =>
          $selectedMonth.set(new Date(selectedMonth.getFullYear(), v))
        }
      >
        {months.map((month) => (
          <Tab key={month.month} value={month.month} label={month.title} />
        ))}
      </Tabs>
    </Box>
  );
}

import { BarChart } from '@mui/x-charts/BarChart';
import { useStore } from '@nanostores/react';
import { $accountsReport, $selectedAccount } from './state';
import { currencyFormat } from '../../core/formatters';
import { cheerfulFiestaPalette } from '@mui/x-charts/colorPalettes';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { $accounts } from '../../core/state';

export default function AccountsReport() {
  const accounts = useStore($accounts);
  const selectedAccount = useStore($selectedAccount);
  const { series, xLabels } = useStore($accountsReport);
  const colors = cheerfulFiestaPalette('dark');

  return (
    <Stack direction="row" sx={{ minHeight: '100%' }}>
      <BarChart
        series={series.map((series) => ({
          ...series,
          valueFormatter: (v) => (v === null ? '' : currencyFormat(v)),
        }))}
        xAxis={[{ data: xLabels, scaleType: 'band' }]}
        slotProps={{
          legend: {
            hidden: true,
            direction: 'column',
            position: { vertical: 'top', horizontal: 'right' },
            itemMarkWidth: 10,
            itemMarkHeight: 10,
            labelStyle: {
              fontSize: 12,
            },
          },
        }}
        colors={colors}
      />
      <Box width={250}>
        <Autocomplete
          renderInput={(params) => <TextField {...params} label="Account" />}
          options={accounts}
          getOptionLabel={(option) => option.name}
          filterSelectedOptions
          disableClearable
          fullWidth
          value={accounts.find((c) => c.name === selectedAccount)}
          onChange={(_e, value) => $selectedAccount.set(value.name)}
        />
      </Box>
    </Stack>
  );
}

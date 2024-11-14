import { BarPlot } from '@mui/x-charts/BarChart';
import { useStore } from '@nanostores/react';
import { $accountsReport, $selectedAccount } from './state';
import { currencyFormat } from '../../core/formatters';
import { cheerfulFiestaPalette } from '@mui/x-charts/colorPalettes';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { $accounts } from '../../core/state';
import { ResponsiveChartContainer } from '@mui/x-charts/ResponsiveChartContainer';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { LinePlot, MarkPlot } from '@mui/x-charts/LineChart';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { ChartsAxisHighlight } from '@mui/x-charts/ChartsAxisHighlight';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';

export default function AccountsReport() {
  const accounts = useStore($accounts);
  const selectedAccount = useStore($selectedAccount);
  const { series, xLabels } = useStore($accountsReport);
  const colors = cheerfulFiestaPalette('dark');
  const colorMap = {
    inflow: colors[5],
    outflow: colors[8],
    transferred: colors[2],
    endBalance: colors[0],
  } as const;

  return (
    <Stack sx={{ minHeight: '100%' }}>
      <Box width={350} marginLeft="auto" marginRight="auto">
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
      <ResponsiveChartContainer
        series={series.map((series) => ({
          ...series,
          color: colorMap[series.id],
          valueFormatter: (v: number | null) =>
            v === null ? '' : currencyFormat(v),
        }))}
        xAxis={[
          {
            data: xLabels,
            scaleType: 'band',
            id: 'x-axis-id',
            valueFormatter: (v, context) =>
              context.location === 'tick'
                ? `${v.slice(0, 3)}\n${v.split(' ')[1]}`
                : v,
          },
        ]}
      >
        <ChartsAxisHighlight x="band" />
        <BarPlot />
        <LinePlot />
        <MarkPlot />
        <ChartsXAxis position="bottom" axisId="x-axis-id" />
        <ChartsYAxis position="left" />
        <ChartsTooltip />
      </ResponsiveChartContainer>
    </Stack>
  );
}

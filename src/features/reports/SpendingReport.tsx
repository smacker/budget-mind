import { BarChart } from '@mui/x-charts/BarChart';
import { useStore } from '@nanostores/react';
import { $spendingReport } from './state';
import { currencyFormat } from '../../core/formatters';
import { cheerfulFiestaPalette } from '@mui/x-charts/colorPalettes';
import Stack from '@mui/material/Stack';

export default function SpendingReport() {
  const { dataset } = useStore($spendingReport);
  const colors = cheerfulFiestaPalette('dark');

  return (
    <Stack direction="row" sx={{ minHeight: '100%' }}>
      <BarChart
        dataset={dataset}
        series={[
          {
            dataKey: 'data',
            label: 'Spent',
            valueFormatter: (v) => (v === null ? '' : currencyFormat(v)),
          },
        ]}
        xAxis={[
          {
            label: 'Outflow Amount',
          },
        ]}
        yAxis={[{ scaleType: 'band', dataKey: 'label' }]}
        layout="horizontal"
        grid={{ vertical: true }}
        margin={{ left: 150 }}
        slotProps={{
          legend: {
            hidden: true,
          },
        }}
        colors={colors}
      />
    </Stack>
  );
}

import { BarChart } from '@mui/x-charts/BarChart';
import { useStore } from '@nanostores/react';
import {
  $trendReport,
  toggleExcludeCategory,
  toggleOnlyCategory,
} from './state';
import { currencyFormat } from '../../core/formatters';
import { cheerfulFiestaPalette } from '@mui/x-charts/colorPalettes';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';

export default function TrendReport() {
  const { series, xLabels } = useStore($trendReport);
  const colors = cheerfulFiestaPalette('dark');

  return (
    <Stack direction="row" sx={{ minHeight: '100%' }}>
      <BarChart
        series={series.map((series) => ({
          ...series,
          valueFormatter: (v) => (v === null ? '' : currencyFormat(v)),
        }))}
        xAxis={[{ data: xLabels, scaleType: 'band' }]}
        tooltip={{ trigger: 'item' }}
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
      <div>
        {series.map((item, i) => (
          <Stack key={item.id} direction="row" alignItems="center" spacing={1}>
            <Link
              sx={{
                display: 'block',
                width: 10,
                height: 10,
                bgcolor: item.excluded ? undefined : colors[i % colors.length],
                border: item.excluded
                  ? `1px solid ${colors[i % colors.length]}`
                  : undefined,
              }}
              underline="none"
              href="#"
              onClick={() => toggleOnlyCategory(item.label)}
            />
            <Link
              sx={{ whiteSpace: 'nowrap' }}
              color="inherit"
              underline="none"
              href="#"
              onClick={() => toggleExcludeCategory(item.label)}
            >
              {item.label}
            </Link>
          </Stack>
        ))}
      </div>
    </Stack>
  );
}

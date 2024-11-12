import { BarChart } from '@mui/x-charts/BarChart';
import { useStore } from '@nanostores/react';
import { $trendReport, toggleExcludeCategory } from './state';
import { currencyFormat } from '../../core/formatters';
import { cheerfulFiestaPalette } from '@mui/x-charts/colorPalettes';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

export default function TrendReport() {
  const { series, xLabels } = useStore($trendReport);
  const colors = cheerfulFiestaPalette('dark');

  return (
    <Stack direction="row">
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
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 10,
                height: 10,
                bgcolor: item.excluded ? undefined : colors[i % colors.length],
                border: item.excluded
                  ? `1px solid ${colors[i % colors.length]}`
                  : undefined,
              }}
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

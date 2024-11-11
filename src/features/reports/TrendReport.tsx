import { BarChart } from '@mui/x-charts/BarChart';
import { useStore } from '@nanostores/react';
import { $trendReport } from './state';
import { currencyFormat } from '../../core/formatters';

export default function TrendReport() {
  const { series, xLabels } = useStore($trendReport);

  return (
    <BarChart
      // width={500}
      // height={300}
      series={series.map((series) => ({
        ...series,
        valueFormatter: (v) => (v === null ? '' : currencyFormat(v)),
      }))}
      xAxis={[{ data: xLabels, scaleType: 'band' }]}
      //margin={{ top: 20, right: 200, bottom: 20, left: 20 }}
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
    />
  );
}

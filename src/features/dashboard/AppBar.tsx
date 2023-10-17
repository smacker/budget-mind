import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useStore } from '@nanostores/react';
import { $selectedMonth } from './state';
import { Tab, Tabs } from '@mui/material';

// TODO: get locale from settings
const formatter = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format;
const months = [...Array(12).keys()].map((m) => ({
  month: m,
  title: formatter(new Date(2023, m)),
}));

// TODO: find a good UI/UX solution to change year
export default function AppBar() {
  const selectedMonth = useStore($selectedMonth);

  return (
    <Box display="flex" flexGrow={1} fontWeight="bold">
      <Typography
        fontWeight="bold"
        marginRight={1}
        fontSize="1.5em"
        padding="5px 16px"
      >
        {selectedMonth.getFullYear()}
      </Typography>
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

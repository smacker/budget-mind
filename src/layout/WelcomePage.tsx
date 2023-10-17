import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Main from './Main';
import { Login } from '../features/sync/Login';

const timeRanges = [
  {
    start: 0,
    end: 6,
    text: 'Night',
  },
  {
    start: 6,
    end: 12,
    text: 'Morning',
  },
  {
    start: 12,
    end: 18,
    text: 'Afternoon',
  },
  {
    start: 18,
    end: 24,
    text: 'Evening',
  },
];

function getTimeOfTheDay(d: Date) {
  for (const interval of timeRanges) {
    if (interval.start <= d.getHours() && d.getHours() < interval.end) {
      return interval.text;
    }
  }

  return 'Day';
}

function WelcomeAppBar() {
  return (
    <Typography
      variant="h4"
      noWrap
      component="div"
      sx={{
        flexGrow: 1,
        fontWeight: 'bold',
      }}
    >
      <span style={{ color: '#A3A3A3' }}>
        Good {getTimeOfTheDay(new Date())},{' '}
      </span>
      <span style={{ fontWeight: 'bolder' }}>Please Log-In</span>
    </Typography>
  );
}

export default function Welcome() {
  return (
    <Main appBarChildren={<WelcomeAppBar />}>
      <Box
        sx={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}
      >
        <Login />
      </Box>
    </Main>
  );
}

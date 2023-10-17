import Box from '@mui/material/Box';
import { AccountsSummary } from './AccountsSummary';
import { BudgetTable } from './BudgetTable';
import { BudgetSummary } from './BudgetSummary';
import AppBar from './AppBar';
import Main from '../../layout/Main';
import { Slide } from '@mui/material';
import { $selectedMonth } from './state';
import { useStore } from '@nanostores/react';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function DashboardPage() {
  const selectedMonth = useStore($selectedMonth).toISOString();
  const [prevSelectedMonth, setPrevSelectedMonth] = useState(selectedMonth);
  const [appear, setAppear] = useState(false);
  const containerRef = useRef(null);

  const direction = useMemo(() => {
    if (prevSelectedMonth > selectedMonth) {
      return 'right';
    }
    return 'left';
  }, [prevSelectedMonth, selectedMonth]);

  useEffect(() => {
    setPrevSelectedMonth(selectedMonth);
  }, [setPrevSelectedMonth, selectedMonth]);

  useEffect(() => {
    setAppear(true);
  }, [setAppear]);

  return (
    <Main appBarChildren={<AppBar />}>
      <Box display="flex" flexDirection="row">
        <Box flexGrow={1} ref={containerRef} overflow="hidden">
          <Slide
            container={containerRef.current}
            direction={direction}
            in={true}
            appear={appear}
            mountOnEnter
            unmountOnExit
            key={selectedMonth}
            timeout={500}
          >
            <Box>
              <BudgetSummary />
              <BudgetTable />
            </Box>
          </Slide>
        </Box>
        <Box flexShrink={0} minWidth={300}>
          <AccountsSummary />
        </Box>
      </Box>
    </Main>
  );
}

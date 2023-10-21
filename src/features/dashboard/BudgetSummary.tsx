import Box from '@mui/material/Box';
import Card, { CardProps } from '@mui/material/Card';
import CardContent, { CardContentProps } from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useStore } from '@nanostores/react';
import { $budgetSummary } from './state';
import { ColoredAmount } from '../../core/components/ColoredAmount';

const SummaryCard = (props: CardProps) => {
  const { children, ...rest } = props;
  return (
    <Card
      variant="outlined"
      {...rest}
      sx={{ border: 0, textAlign: 'center', padding: 0 }}
    >
      {children}
    </Card>
  );
};

const SummaryCardContent = (props: CardContentProps) => {
  const { children, ...rest } = props;
  return (
    <CardContent {...rest} sx={{ padding: 0 }}>
      {children}
    </CardContent>
  );
};

export function BudgetSummary() {
  const budgetSummary = useStore($budgetSummary);

  return (
    <Box display="flex" flexDirection="row" justifyContent="space-evenly">
      <SummaryCard>
        <SummaryCardContent>
          <Typography variant="h5" component="div">
            <ColoredAmount amount={budgetSummary.toBudget} />
          </Typography>
          <Typography color="text.secondary">
            {budgetSummary.toBudget < 0 ? 'Overbudgeted' : 'To budget'}
          </Typography>
        </SummaryCardContent>
      </SummaryCard>
      <SummaryCard>
        <SummaryCardContent>
          <Typography variant="h5" component="div">
            <ColoredAmount amount={budgetSummary.spent} />
          </Typography>
          <Typography color="text.secondary">Spent</Typography>
        </SummaryCardContent>
      </SummaryCard>
      <SummaryCard>
        <SummaryCardContent>
          <Typography variant="h5" component="div">
            <ColoredAmount amount={budgetSummary.budgeted} />
          </Typography>
          <Typography color="text.secondary">Budgeted</Typography>
        </SummaryCardContent>
      </SummaryCard>
    </Box>
  );
}

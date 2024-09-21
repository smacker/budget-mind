import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { $accounts, $categories } from '../../core/state';
import { useStore } from '@nanostores/react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Transaction, NewTransaction } from '../../core/models';
import { addTransaction } from './state';

export function AddTransactionDialog({
  open,
  onClose,
  defaultValues: inputDefaultValues,
}: {
  open: boolean;
  onClose: () => void;
  defaultValues?: Partial<NewTransaction>;
}) {
  const accounts = useStore($accounts);
  const categories = useStore($categories);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [isInflow, setIsInflow] = useState<boolean>(false);

  const defaultValues = useMemo(
    () => ({
      ...inputDefaultValues,
      date: inputDefaultValues?.date || today,
      status: inputDefaultValues?.status || 'settled',
    }),
    [inputDefaultValues, today]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<NewTransaction>({
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    reset(defaultValues);
    setIsInflow(false);
  }, [reset, defaultValues, open]);

  const onSubmit = (data: NewTransaction) => {
    addTransaction(
      new Transaction(
        '',
        data.date,
        (isInflow ? data.amount : -data.amount) * 100,
        data.category,
        data.account,
        data.memo,
        data.status
      )
    );
    onClose();
  };

  return (
    <Dialog open={open} onSubmit={handleSubmit(onSubmit)} onClose={onClose}>
      <DialogTitle>Add Transaction</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          display="flex"
          flexDirection="column"
          gap={1}
          paddingTop={1}
        >
          <Box
            display="flex-inline"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            gap={1}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={isInflow}
                  onChange={() => setIsInflow(!isInflow)}
                  sx={{
                    '&.MuiSwitch-root .MuiSwitch-switchBase': {
                      color: '#cc0000',
                    },
                    '&.MuiSwitch-root .MuiSwitch-track': {
                      backgroundColor: '#cc0000',
                    },
                    '&.MuiSwitch-root .Mui-checked': {
                      color: '#00aa00',
                    },
                    '&.MuiSwitch-root .Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00aa00',
                    },
                  }}
                />
              }
              label={isInflow ? 'Inflow' : 'Outflow'}
              sx={{
                display: 'flex-inline',
                flexDirection: 'column',
                marginTop: '-6px',
                marginLeft: 0,
              }}
            />
            <TextField
              autoFocus
              required
              type="number"
              label="Amount"
              {...register('amount', { required: true, min: 0.01 })}
              error={!!errors.amount}
              helperText={errors.amount?.message}
            />
          </Box>
          <Controller
            name="date"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={(e) => field.onChange(e || today)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    label: 'Date',
                    error: !!errors.date,
                    helperText: errors.date?.message,
                  },
                }}
              />
            )}
          />
          <Controller
            name="category"
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, ...restField } }) => (
              <Autocomplete
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Category"
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  />
                )}
                options={categories}
                getOptionLabel={(option) => option.name}
                groupBy={(option) => option.group}
                filterSelectedOptions
                fullWidth
                value={categories.find((c) => c.name === value) || null}
                onChange={(_e, value) => onChange(value?.name || '')}
                {...restField}
              />
            )}
          />
          <Controller
            name="account"
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, ...restField } }) => (
              <Autocomplete
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Account"
                    error={!!errors.account}
                    helperText={errors.account?.message}
                  />
                )}
                options={accounts}
                getOptionLabel={(option) => option.name}
                filterSelectedOptions
                fullWidth
                value={accounts.find((c) => c.name === value) || null}
                onChange={(_e, value) => onChange(value?.name || '')}
                {...restField}
              />
            )}
          />
          <TextField
            label="Memo"
            fullWidth
            {...register('memo')}
            error={!!errors.memo}
            helperText={errors.memo?.message}
            // Shortcut to submit after entering memo by pressing Enter
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(onSubmit)();
              }
            }}
          />
          <Box textAlign="right">
            <Controller
              name="status"
              control={control}
              render={({ field: { value, onChange, ...restField } }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={value === 'settled'}
                      onChange={() =>
                        onChange(value === 'settled' ? 'pending' : 'settled')
                      }
                      {...restField}
                    />
                  }
                  label={value}
                />
              )}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} type="submit">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

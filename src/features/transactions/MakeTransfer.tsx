import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { $accounts } from '../../core/state';
import { useStore } from '@nanostores/react';
import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Transaction, NewTransfer } from '../../core/models';
import { addTransaction } from './state';
import { accountTransfer } from '../../core/constants';

export function MakeTransferDialog({
  open,
  onClose,
  defaultValues: inputDefaultValues,
}: {
  open: boolean;
  onClose: () => void;
  defaultValues?: Partial<NewTransfer>;
}) {
  const accounts = useStore($accounts);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const defaultValues = useMemo(
    () => ({
      ...inputDefaultValues,
      date: inputDefaultValues?.date || today,
    }),
    [inputDefaultValues, today]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<NewTransfer>({
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    reset(defaultValues);
  }, [reset, defaultValues, open]);

  const onSubmit = async (data: NewTransfer) => {
    await addTransaction(
      new Transaction(
        '',
        data.date,
        -data.amount * 100,
        accountTransfer,
        data.fromAccount,
        data.memo,
        'settled'
      )
    );
    await addTransaction(
      new Transaction(
        '',
        data.date,
        data.amount * 100,
        accountTransfer,
        data.toAccount,
        data.memo,
        'settled'
      )
    );
    onClose();
  };

  return (
    <Dialog open={open} onSubmit={handleSubmit(onSubmit)} onClose={onClose}>
      <DialogTitle>Make a Transfer</DialogTitle>
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
          <TextField
            autoFocus
            required
            type="number"
            label="Amount"
            {...register('amount', { required: true, min: 0.01 })}
            error={!!errors.amount}
            helperText={errors.amount?.message}
          />
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
            name="fromAccount"
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, ...restField } }) => (
              <Autocomplete
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="From Account"
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
          <Controller
            name="toAccount"
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, ...restField } }) => (
              <Autocomplete
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="To Account"
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)}>Add</Button>
      </DialogActions>
    </Dialog>
  );
}

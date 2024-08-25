# Budget mind

Better UI for Aspire Budgeting.

### Development

```
pnpm run dev
```

### References

#### Inspiration:

https://app.actualbudget.com/budget

#### Main libraries in use:

- MUI: https://mui.com/material-ui/
- Nanostores: https://github.com/nanostores/nanostores
- Date-fns: https://date-fns.org

#### CSS guides:

Flexbox: https://css-tricks.com/snippets/css/a-guide-to-flexbox/

#### Tech inspiration:

Google Auth: https://github.com/MomenSherif/react-oauth

### TODO List

MVP:

- [x] Store token in local storage
- [x] Add new transaction
- [x] Write transaction to google sheet
- [x] Fix discrepancy in numbers between the app and google sheet
- [x] Loader when fetching data
- [x] Move constants to .env
- [x] Handle 401 errors from API
- [x] Dashboard UI
- [x] Allow changing month in dashboard
- [x] Add new transaction button from dashboard category
- [x] Animation when switching between months on dashboard
- [x] Allow transactions for "Available to budget", "Balance Adjustment", "Account Transfer"
- [x] Add logo
- [x] Clean-up for the initial version
- [x] Un-hardcode spreadsheet id

Next version:

- [x] Ability to budget
- [x] Category transfers
- [ ] Add filter by month in the list of transactions
- [ ] Quick search in transaction
- [x] Find a good UI/UX solution to change year on dashboard

Some other version:

- [ ] Edit transactions
- [ ] Beautiful graphs - figure out what kind of graphs
- [ ] Bulk actions with transactions
- [ ] Reconsolidation support
- [ ] Split transactions
- [ ] Settings
  - [ ] Language selector
  - [ ] Currency selector
  - [ ] Date formatter selector
  - [ ] Ability to change spreadsheet
- [ ] Auto data refresh => this would need import re-work to be able to match imported rows (by ids?) and what to do with newly added transactions?

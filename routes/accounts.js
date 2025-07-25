const express = require('express');
const router = express.Router();

// Mock account data (replace with real-time DB/service in production)
const accounts = [
  {
    accountId: '001',
    customerId: '123',
    accountNumber: '9876543210123456',
    accountType: 'Savings',
    currency: 'USD',
    balance: 2500.00,
    status: 'Active',
    openingDate: '2022-01-15'
  },
  {
    accountId: '002',
    customerId: '123',
    accountNumber: '1234567890123456',
    accountType: 'Current',
    currency: 'USD',
    balance: 4800.00,
    status: 'Dormant',
    openingDate: '2021-08-10'
  }
];

// Utility to mask account number (show last 4 digits)
function maskAccountNumber(accountNumber) {
  return accountNumber.replace(/\d(?=\d{4})/g, 'X');
}

// Standardized error response helper
function errorResponse(res, status, errorCode, message) {
  return res.status(status).json({ errorCode, message });
}

// GET /accounts
router.get('/', (req, res, next) => {
  try {
    if (req.query.force500 === 'true') {
      throw new Error('Simulated server error');
    }
    const { customerId, accountId, accountType, status, pageSize = 10, pageNumber = 1 } = req.query;

    // Parameter validation
    if (!customerId && !accountId) {
      return errorResponse(res, 400, 'ERR_MISSING_PARAM', 'Missing customerId or accountId');
    }
    if (pageSize && (isNaN(pageSize) || pageSize < 1 || pageSize > 100)) {
      return errorResponse(res, 400, 'ERR_INVALID_PARAM', 'Invalid pageSize (1-100 allowed)');
    }
    if (pageNumber && (isNaN(pageNumber) || pageNumber < 1)) {
      return errorResponse(res, 400, 'ERR_INVALID_PARAM', 'Invalid pageNumber (must be >= 1)');
    }
    if (customerId && isNaN(customerId)) {
      return errorResponse(res, 400, 'ERR_INVALID_PARAM', 'customerId must be numeric');
    }
    if (accountId && typeof accountId !== 'string') {
      return errorResponse(res, 400, 'ERR_INVALID_PARAM', 'accountId must be a string');
    }

    // Simulate authorization: only allow access if API key matches a hardcoded value (for demo)
    // In real system, check if the account/customer belongs to the authenticated user
    // For now, allow all if API key is present
    // TODO: Implement real authorization logic

    // Get account by ID
    if (accountId) {
      const account = accounts.find(acc => acc.accountId === accountId);
      if (!account) return errorResponse(res, 404, 'ERR_ACCOUNT_NOT_FOUND', 'Account not found');
      return res.status(200).json({
        accountId: account.accountId,
        accountNumber: maskAccountNumber(account.accountNumber),
        accountType: account.accountType,
        currency: account.currency,
        balance: { amount: account.balance, currency: account.currency },
        status: account.status,
        openingDate: account.openingDate
      });
    }

    // Get accounts by customerId
    let customerAccounts = accounts.filter(acc => acc.customerId === customerId);
    if (customerAccounts.length === 0) {
      return errorResponse(res, 404, 'ERR_CUSTOMER_NOT_FOUND', 'Customer not found or has no accounts');
    }

    // Apply filters
    let filteredAccounts = customerAccounts;
    if (accountType) {
      filteredAccounts = filteredAccounts.filter(acc => acc.accountType === accountType);
    }
    if (status) {
      filteredAccounts = filteredAccounts.filter(acc => acc.status === status);
    }

    // Pagination logic
    const totalCount = filteredAccounts.length;
    const startIdx = (parseInt(pageNumber) - 1) * parseInt(pageSize);
    const pagedData = filteredAccounts.slice(startIdx, startIdx + parseInt(pageSize));

    // Return result with total count in header and body
    res.set('X-Total-Count', totalCount);
    res.status(200).json({
      totalCount,
      pageSize: parseInt(pageSize),
      pageNumber: parseInt(pageNumber),
      accounts: pagedData.map(acc => ({
        accountId: acc.accountId,
        accountNumber: maskAccountNumber(acc.accountNumber),
        accountType: acc.accountType,
        currency: acc.currency,
        balance: { amount: acc.balance, currency: acc.currency },
        status: acc.status,
        openingDate: acc.openingDate
      }))
    });
  } catch (err) {
    // Internal error
    errorResponse(res, 500, 'ERR_INTERNAL', 'Internal Server Error');
  }
});

// POST /accounts - Add a new account
router.post('/', (req, res, next) => {
  try {
    const { customerId, accountNumber, accountType, currency, balance, status, openingDate } = req.body;
    if (!customerId || !accountNumber || !accountType || !currency || balance == null || !status || !openingDate) {
      return res.status(400).json({ error: 'Missing required account fields' });
    }
    const accountId = (accounts.length + 1).toString().padStart(3, '0');
    const newAccount = { accountId, customerId, accountNumber, accountType, currency, balance, status, openingDate };
    accounts.push(newAccount);
    res.status(201).json({ message: 'Account created', account: {
      ...newAccount,
      accountNumber: maskAccountNumber(newAccount.accountNumber),
      balance: { amount: newAccount.balance, currency: newAccount.currency }
    }});
  } catch (err) {
    next(err);
  }
});

// GET /accounts/all - List all accounts (for admin/testing)
router.get('/all', (req, res, next) => {
  try {
    const response = accounts.map(acc => ({
      ...acc,
      accountNumber: maskAccountNumber(acc.accountNumber),
      balance: { amount: acc.balance, currency: acc.currency }
    }));
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// DELETE /accounts/:accountId - Remove an account
router.delete('/:accountId', (req, res, next) => {
  try {
    const { accountId } = req.params;
    const idx = accounts.findIndex(acc => acc.accountId === accountId);
    if (idx === -1) {
      return res.status(404).json({ error: 'Account not found' });
    }
    accounts.splice(idx, 1);
    res.status(200).json({ message: 'Account removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router; 
'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-09-20T17:01:17.194Z',
    '2022-09-24T23:36:17.929Z',
    '2022-09-25T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let currentAcc, timer;

let sorted = false;

const formatDate = function (movDate) {
  const diffOfDates = Math.round(
    Math.abs(movDate - new Date()) / (1000 * 60 * 60 * 24)
  );

  if (diffOfDates === 0) return `Today`;
  if (diffOfDates === 1) return `Yesterday`;
  if (diffOfDates <= 7) return `${diffOfDates} days ago`;
  return new Intl.DateTimeFormat(currentAcc.locale).format(movDate);
};

const formatCurr = function (curr) {
  return new Intl.NumberFormat(currentAcc.locale, {
    style: 'currency',
    currency: currentAcc.currency,
  }).format(curr);
};

const displayMovements = function () {
  containerMovements.innerHTML = '';

  const sortedCopyAccMovs = sorted
    ? currentAcc.movements.slice().sort((a, b) => a - b)
    : currentAcc.movements;

  sortedCopyAccMovs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const rowOfMovements = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${formatDate(
        new Date(currentAcc.movementsDates[i])
      )}</div>
      <div class="movements__value">${formatCurr(mov)}</div>
  </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', rowOfMovements);
  });
};

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  sorted = !sorted;
  displayMovements();
});

const displayBalance = function () {
  const totalSum = currentAcc.movements.reduce((sum, curr) => sum + curr, 0);
  labelBalance.textContent = `${formatCurr(totalSum)}`;
};

const displaySummary = function () {
  labelSumIn.textContent = `${formatCurr(
    currentAcc.movements
      .filter(mov => mov > 0)
      .reduce((sum, curr) => sum + curr, 0)
  )}`;

  labelSumOut.textContent = `${formatCurr(
    currentAcc.movements
      .filter(mov => mov < 0)
      .reduce((sum, curr) => sum + curr, 0)
  )}`;

  labelSumInterest.textContent = `${formatCurr(
    currentAcc.movements
      .filter(mov => mov > 0)
      .map(mov => (mov * currentAcc.interestRate) / 100)
      .reduce((sum, curr) => sum + curr, 0)
  )}`;
};

const displayUI = function () {
  displayMovements();
  displayBalance();
  displaySummary();
};

const createUsernames = function () {
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(acc => acc[0])
      .join('');
  });
};

createUsernames();

const logOutTimer = function () {
  const tick = function () {
    let minutes = `${Math.trunc(flowTime / 60)}`.padStart(2, '0');
    let seconds = `${flowTime % 60}`.padStart(2, '0');
    labelTimer.textContent = `${minutes}:${seconds}`;
    if (flowTime === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    flowTime--;
  };
  let flowTime = 120;
  tick();
  const currTime = setInterval(tick, 1000);
  return currTime;
};

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  const account = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (account?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome ${account.owner}`;
    containerApp.style.opacity = 100;
    currentAcc = account;
    sorted = false;
    labelDate.textContent = new Intl.DateTimeFormat(currentAcc.locale, {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(new Date());
    displayUI();

    if (timer) clearInterval(timer);
    timer = logOutTimer();
  }

  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const receiver = accounts.find(acc => acc.username === inputTransferTo.value);
  const totalSum = currentAcc.movements.reduce((sum, curr) => sum + curr, 0);
  const transferAmount = Number(inputTransferAmount.value);

  inputTransferTo.value = '';
  inputTransferAmount.value = '';
  inputTransferAmount.blur();

  if (
    receiver &&
    receiver.username != currentAcc.username &&
    transferAmount > 0 &&
    transferAmount <= totalSum
  ) {
    currentAcc.movements.push(-transferAmount);
    receiver.movements.push(transferAmount);
    currentAcc.movementsDates.push(new Date().toISOString());
    receiver.movementsDates.push(new Date().toISOString());
    displayUI();
    clearInterval(timer);
    timer = logOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const loan = Number(inputLoanAmount.value);

  inputLoanAmount.value = '';
  inputLoanAmount.blur();

  if (loan > 0 && currentAcc.movements.some(mov => loan <= mov * 0.1)) {
    setTimeout(function () {
      currentAcc.movements.push(loan);
      currentAcc.movementsDates.push(new Date().toISOString());
      displayUI();
      clearInterval(timer);
      timer = logOutTimer();
    }, 3000);
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  const account = accounts.find(
    acc => acc.username === inputCloseUsername.value
  );

  if (
    account?.username === currentAcc.username &&
    account?.pin === Number(inputClosePin.value)
  ) {
    const i = accounts.findIndex(acc => acc.username === currentAcc.username);
    accounts.splice(i, 1);
    labelWelcome.textContent = `Log in to get started`;
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
  inputClosePin.blur();
});

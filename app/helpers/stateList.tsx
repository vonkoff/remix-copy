export const states = [
  '',
  'AK',
  'AL',
  'AR',
  'AS',
  'AZ',
  'CA',
  'CO',
  'CT',
  'DC',
  'DE',
  'FL',
  'GA',
  'GU',
  'HI',
  'IA',
  'ID',
  'IL',
  'IN',
  'KS',
  'KY',
  'LA',
  'MA',
  'MD',
  'ME',
  'MI',
  'MN',
  'MO',
  'MS',
  'MT',
  'NC',
  'ND',
  'NE',
  'NH',
  'NJ',
  'NM',
  'NV',
  'NY',
  'OH',
  'OK',
  'OR',
  'PA',
  'PR',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VA',
  'VI',
  'VT',
  'WA',
  'WI',
  'WV',
  'WY',
];

function StateListMaker() {
  const stateList: {
    value: string;
    label: string;
  }[] = [];

  for (let i = 1; i < states.length; i++) {
    stateList.push({ value: states[i], label: states[i] });
  }

  let stateArr = Array.from(stateList);
  stateArr.unshift({ value: '', label: 'Choose a State' });

  return stateArr;
}

export const stateList = StateListMaker();

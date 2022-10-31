export function SalaryHelper() {
  let arr = [];
  for (let i = 10; i <= 200; i = i + 10) {
    arr.push({ value: i.toString(), label: i.toString() });
  }

  arr.map((x, i) => {
    x.value = '$' + x.value + 'K';
    x.label = 'USD ' + x.label + ',000 per year';
    return x;
  });

  let minArr = Array.from(arr);
  let maxArr = Array.from(arr);
  minArr.unshift({ value: '', label: 'Minimum per year' });
  maxArr.unshift({ value: '', label: 'Maximum per year' });

  return { minArr, maxArr };
}

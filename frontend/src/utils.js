import qs from 'qs';

export function parseHistorySearch(history) {
  const {search} = history.location;
  return qs.parse(search.substring(search.startsWith('?') ? 1 : 0));
}

export function uniqueArray(arr) {
    return arr.filter((item, pos, self) => {
        return self.indexOf(item) === Number(pos);
    })
}

export function formatDateTime(dt) {
  const now = new Date();
  if (
    now.getFullYear() === dt.getFullYear() &&
    now.getMonth() === dt.getMonth() &&
    now.getDate() === dt.getDate()
  ) {
    return fmtDgt(dt.getHours(), 2) + ':' + fmtDgt(dt.getMinutes(), 2);
  } else {
    return fmtDgt(dt.getHours(), 2) + ':' + fmtDgt(dt.getMinutes(), 2) + ' ' +
      fmtDgt(dt.getDate(), 2) + '.' + fmtDgt(dt.getMonth(), 2) + '.' + dt.getFullYear();
  }
}

function fmtDgt(number, repeat=2) {
  return ('0'.repeat(repeat) + number).substr(-repeat);
}



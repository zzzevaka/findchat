// import { browserHistory, Link } from 'react-router-dom';
import { Link } from 'react-router-dom';
import qs from 'qs';

export function parseHistorySearch(history) {
  const {search} = history.location;
  return qs.parse(search.substring(search.startsWith('?') ? 1 : 0));
}

export function uniqueArray(arr) {
    return arr.filter((item, pos, self) => {
        return self.indexOf(item) == pos
    })
}

export function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
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



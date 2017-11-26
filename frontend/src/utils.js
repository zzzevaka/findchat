import { browserHistory, Link } from 'react-router';

// export function parseHastags(string) {
//   const re = /#\w+/g;
//   return string.replace(re, <Link>{$&}<<Link>);
// }

export function showModal(query) {
  browserHistory.push(
    `${browserHistory.getCurrentLocation().pathname}?${query}`
  );
}

export function getModalUrl(query) {
  return `${browserHistory.getCurrentLocation().pathname}?${query}`;
}

export function closeModal() {
  browserHistory.push(browserHistory.getCurrentLocation().pathname);
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



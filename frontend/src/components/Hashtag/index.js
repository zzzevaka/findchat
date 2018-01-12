const EXCLUDE_SYMBOLS = '!@#$%^&*().,?+-=/{}|" ';
const HASHTAG_REGEX = new RegExp(`#([^${EXCLUDE_SYMBOLS}]+)`, 'gm');

export function HashtagString(string, className) {
    return string.replace(
        HASHTAG_REGEX,
        (h,w) => `<a href="#" class="hashtag">${w}</a>`
    )
}
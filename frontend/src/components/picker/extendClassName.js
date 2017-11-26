import classNames from 'classnames';

// HOC for extending props.className 
export default function extendClassName(wrapped, additionalClasses) {
  return function(props, context) {
    const {className, ...rest} = props;
    const classes = classNames(additionalClasses, className);
    return wrapped({...rest, className: classes}, context);
  }
}
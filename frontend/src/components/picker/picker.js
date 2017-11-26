import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import extendClassName from './extendClassName';
import './picker.css';


export const CategoryList = extendClassName(
  props => <div {...props} />,
  'picker-category-list'
)


export const CategoryListItem = (props, context) => {
  const {category, className, ...rest} = props;
  const classes = classNames(
    'picker-categoty-list-item',
    {'picker-categoty-list-item-selected': category === context.currentCategory},
    className
  );
  return (
    <div
      {...rest}
      className={classes}
      onClick={() => context.categorySelected(props.category)}
    />
  );
}

CategoryListItem.contextTypes = {
  categorySelected: PropTypes.func,
  currentCategory: PropTypes.string
}


export const ItemList = extendClassName(
  (props, context) => {
    const {category, ...rest} = props;
    return category === context.currentCategory ? <div {...rest} /> : null;
  },
  'picker-item-list'
)

ItemList.contextTypes = {currentCategory: PropTypes.string}


export const ItemListItem = (props, context) => {
  const {className, value, ...rest} = props;
  const classes = classNames('picker-item-list-item', className);
  return (
    <div
      {...rest}
      className={classes}
      onClick={() => context.itemSelected(value)}
    />
  );
}

ItemListItem.contextTypes = {itemSelected: PropTypes.func}


export default class Picker extends Component {

  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    initCategory: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired
  }

  static childContextTypes = {
    itemSelected: PropTypes.func,
    categorySelected: PropTypes.func,
    currentCategory: PropTypes.string
  }

  getChildContext() {
    return {
      itemSelected: this.itemSelected,
      categorySelected: this.categorySelected,
      currentCategory: this.state.currentCategory
    };
  }

  itemSelected = value => this.props.onSelect(value);

  categorySelected = value => this.setState({currentCategory: value});

  constructor(props) {
    super(props);
    this.state = {
      currentCategory: props.initCategory
    };
  }

  render() {
    const {className, initCategory, ...rest} = this.props;
    const classes = classNames('picker-container', className);
    return <div {...rest} className={classes} />
  }

}
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import extendClassName from './extendClassName';
import './picker.css';


const PickerCategoryList = extendClassName(
  props => <div {...props} />,
  'picker-category-list'
)

PickerCategoryList.contextTypes = {currentCategory: PropTypes.string}


const PickerCategoryListItem = (props, context) => {
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

PickerCategoryListItem.contextTypes = {
  categorySelected: PropTypes.func,
  currentCategory: PropTypes.string
}


const PickerItemList = extendClassName(
  (props, context) => {
    return props.category === context.currentCategory
      ? <div {...props}/>
      : null;
  },
  'picker-item-list'
)

PickerItemList.contextTypes = {currentCategory: PropTypes.string}


const PickerItemListItem = (props, context) => {
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

PickerItemListItem.contextTypes = {itemSelected: PropTypes.func}


class Picker extends Component {

  static defaultProps = {
      onSelect=PropTypes.func.isRequired,
      currentCa
  }

  static childContextTypes = {
    itemSelected: PropTypes.func,
    categorySelected: PropTypes.func,
    currentCategory: PropTypes.string
  }

  constructor() {
    super();
    this.state = {
      currentCategory: 'people'
    };
  }



  getChildContext() {
    return {
      itemSelected: this.itemSelected,
      categorySelected: this.categorySelected,
      currentCategory: this.state.currentCategory
    };
  }

  itemSelected = key => {console.log(key + ' choosen item')};

  categorySelected = key => {
    console.log(key + ' choosen category')
    this.setState({currentCategory: key})  
  }


  render() {
    const {className, ...rest} = this.props;
    const classes = classNames('picker-container', className);
    return <div {...rest} className={classes} />
  }

}
import React, { PureComponent } from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Picker, {CategoryList, CategoryListItem, ItemList, ItemListItem} from './picker/picker';
import {categories, emojiItems} from './emoji-meta.json';
import './emojiPicker.css';
import ReactDOMServer from 'react-dom/server';

const emojiPath = '/emojione-32x32';


export function getEmojiItem(id) {
  const item = emojiItems[id];
  if (item) {
    return item;
  }
  else {
    throw new Error(`emoji ${id} not found in emoji set`);
  }
}

export function emojiImage(id) {
  return ReactDOMServer.renderToString(<Emoji id={id} />);
}

export const Emoji = (props) => {
  const {id, useSprite, ...rest} = props;
  const emoji = getEmojiItem(id);
  if (useSprite) {
    return (
      <div className='emoji-item-sprite-outer' {...rest}>
        <div className='emoji-item-sprite-inner'
          style={{
            backgroundPosition: `${emoji.pos[0]}px ${emoji.pos[1]}px`,
            width: `${emoji.size[0]}px`,
            height: `${emoji.size[1]}px`,
            margin: `${(30 - emoji.size[1])}px ${(30 - emoji.size[0]) / 2}px`
          }}
        />
      </div>
    );
  }
  else {
    return <img src={`${emojiPath}/${id}.png`} className='emoji-item-img' {...rest}/>
  }
}


class EmojiWithOptions extends PureComponent {

  _onEnterOverlay = e => this.props.onEnterOverlay(this.overlay)

  render() {
    const {id} = this.props;
    const popover = (
      <Popover id={id}>
        <div style={{display: 'flex'}}>
        <ItemListItem key={id} value={id}>
            <Emoji id={id} useSprite />
          </ItemListItem>
        {
          getEmojiItem(id).options.map(optionId => {
            return (
              <ItemListItem key={optionId} value={optionId}>
                <Emoji id={optionId} useSprite />
              </ItemListItem>
            );
          })
        }
        </div>
      </Popover>
    );

    return (
      <OverlayTrigger
        ref={e => this.overlay = e}
        onEnter={this._onEnterOverlay}
        placement="top"
        overlay={popover} 
        trigger='click'
        rootClose
      >
        <span><Emoji id={id} useSprite /></span>
      </OverlayTrigger>
    );
  }

}


export default class EmojiPicker extends PureComponent {

  constructor() {
    super();
    this.state = {
      currentCategory: 'people',
    };

  }

  _closeOpenedOverlay = () => {
    if (this.openedOverlay) {
      this.openedOverlay.hide();
      this.openedOverlay = null;
    }
  }

  
  _renderCategories() {
    let keys = Object.keys(categories).sort((a,b) => categories[a].order - categories[b].order);
    return keys.map(k => {
        return (
          <CategoryListItem category={k} key={k}>
            <Emoji id={categories[k].emoji[0]} useSprite />
          </CategoryListItem>
        );
    })
  }

  _renderItemsByCategory(category) {
    return categories[category].emoji.map(id => {
      try {
        if (getEmojiItem(id).options) {
          return (
            <EmojiWithOptions
              id={id}
              key={`overlay_${id}`}
              onEnterOverlay={e => this.openedOverlay = e}
            />
          );
        }
        else {
          return (
            <ItemListItem key={id} value={id}>
              <Emoji id={id} useSprite />
            </ItemListItem>
          )
        }
      } catch(e) {
        console.error(e);
        return null;
      }
    });
  }

  _categorySelected = v => {
    this.openedOverlay = null;
    this.setState({currentCategory: v});
  }

  _emojiClicked = e => {
    this.props.onItemSelect({id: e, ...getEmojiItem(e)});
  }

  render() {
    const {
      onItemSelect,
      children,
      ...rest
    } = this.props;
    return (
      <Picker
        onItemSelect={this._emojiClicked}
        onCategorySelect={this._categorySelected}
        initCategory='people'
        className='emoji-picker'
        {...rest}
      >
        <CategoryList className='emoji-category-list'>
            {this._renderCategories()}
        </CategoryList>
        <ItemList
          key={this.state.currentCategory}
          category={this.state.currentCategory}
          className='emoji-item-list'
          onScroll={this._closeOpenedOverlay}
        >
        
        {
            this._renderItemsByCategory(this.state.currentCategory)
        }
        </ItemList>
      </Picker>
    );
  }
}
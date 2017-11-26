import React, { Component } from 'react';
import { Popover, OverlayTrigger, Glyphicon } from 'react-bootstrap';
import Picker, {CategoryList, CategoryListItem, ItemList, ItemListItem} from './picker';

import './emojiPicker.css';

const emoji = require('./emoji.json');

class App extends Component {

  _renderCategories() {
    return emoji.map(i => {
      return (
        <CategoryListItem category={i.category} key={i.category} className='emoji-item'>
          <img src={`https://cdn.jsdelivr.net/emojione/assets/3.0/png/32/${i.label}.png`} />
        </CategoryListItem>
      )
    })
  }

  _renderEmojies() {
    return emoji.map(category => {
      return (
        <ItemList category={category.category} key={category.category} className='emoji-item-list'>
          {
            category.emoji.map(emoji => {
              if (emoji.choice.length && true) {
                let popover = (
                  <Popover id={emoji.id}>
                    {
                      emoji.choice.map(child => {
                        return (
                          <div key={child.id} style={{display: 'inline-block'}}>
                            <ItemListItem value={child.shortname} className='emoji-item'>
                              <img src={`https://cdn.jsdelivr.net/emojione/assets/3.0/png/32/${child.id}.png`} />
                            </ItemListItem>
                          </div>
                        )
                      })
                    }
                  </Popover>
                );

                return (
                  <OverlayTrigger key={emoji.id} placement="top" overlay={popover} trigger='click' rootClose>
                    <div className='picker-item-list-item'>
                      <img src={`https://cdn.jsdelivr.net/emojione/assets/3.0/png/32/${emoji.id}.png`} />
                    </div>
                  </OverlayTrigger>
                )
              }
              else {
                return (
                  <ItemListItem key={emoji.id} value={emoji.shortname} className='emoji-item'>
                    <img src={`https://cdn.jsdelivr.net/emojione/assets/3.0/png/32/${emoji.id}.png`} />
                  </ItemListItem>
                )
              }
            })
          }
        </ItemList>
      )
    })
  }

  render() {
    return (
      <Picker onSelect={v => this.props.onItemSelect(v)} initCategory='people' className='emoji-picker'>
        {
          this._renderEmojies()
        }
      </Picker>
    );
  }
}


export default App;

import * as React from 'react';
import Key from './Key';
import KeyboardRow from './KeyboardRow';
import EmojiKeyboard from './EmojiKeyboard';
import {Text, View, Image, asset} from 'react-360';

const QWERTY_LAYOUT = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

const NUMERIC_LAYOUT = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['-', '/', ':', ';', '(', ')', '$', '@', '"'],
  ['.', ',', '?', '!', '`'],
];

type Props = {|
  numeric: boolean,
  shift: boolean,
  onToggleShift: () => mixed,
  onType: (value: string) => mixed,
|};

export default class LetterKeyboard extends React.Component<Props> {
  static defaultProps = {
    shift: false,
    numeric: false,
  };

  render() {
    return (this.props.numeric ? NUMERIC_LAYOUT : QWERTY_LAYOUT).map((row, i) => (
      <KeyboardRow key={i} margin={i === 1 ? 20 : 0}>
        {i === 2 && (
          <Key width={65} onClick={this.props.onToggleShift}>
            <Image
              source={this.props.shift ? asset('shift-active.png') : asset('shift.png')}
              style={{width: 40, height: 40, tintColor: '#81D9FD'}}
            />
          </Key>
        )}
        {row.map(key => {
          const letter = this.props.shift ? key.toUpperCase() : key;
          return (
            <Key onClick={() => this.props.onType(letter)} key={key}>
              {letter}
            </Key>
          );
        })}
        {i === 2 && (
          <Key onClick={() => this.props.onType('Backspace')} width={65}>
            <Image source={asset('backspace.png')} style={{width: 40, height: 40, tintColor: '#81D9FD'}} />
          </Key>
        )}
      </KeyboardRow>
    ));
  }
}

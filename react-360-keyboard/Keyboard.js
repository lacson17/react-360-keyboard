import * as React from 'react';
import Key from './Key';
import KeyboardRow from './KeyboardRow';
import LetterKeyboard from './LetterKeyboard';
import Placeholder from './Placeholder';
import Dictation from './Dictation';
import PropTypes from 'prop-types';
import EmojiKeyboard from './EmojiKeyboard';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  asset,
  NativeModules,
  Animated,
} from 'react-360';

type Props = {||};

type InternalConfig = {|
  initialValue: ?string,
  placeholder: ?string,
  sound: boolean,
  returnKeyLabel?: string,
  tintColor: string,
|};

export type Config = $Shape<InternalConfig>;

type State = {
  value: ?string,
  shift: boolean,
  numeric: boolean,
  emoji: boolean,
  dictation: boolean,
  opacity: Object,
  config: Config,
};

const DEFAULT_CONFIG = Object.freeze({
  initialValue: null,
  placeholder: null,
  sound: true,
  returnKeyLabel: 'Return',
  tintColor: '#81D9FD',
});

export default class Keyboard extends React.Component<Props, State> {
  static childContextTypes = {
    tintColor: PropTypes.string,
  };

  state = {
    shift: true,
    numeric: false,
    emoji: false,
    dictation: false,
    opacity: new Animated.Value(0),
    value: '',
    config: {...DEFAULT_CONFIG},
  };

  componentDidMount() {
    NativeModules.Keyboard.waitForShow().then(this.onShow);
  }

  getChildContext() {
    return {tintColor: this.state.config.tintColor};
  }

  onShow = (config: Config) => {
    this.setState({
      config: {
        ...DEFAULT_CONFIG,
        ...config,
      },
      value: config.initialValue,
      shift: !Boolean(config.initialValue),
    });
    Animated.timing(this.state.opacity, {
      toValue: 1,
      duration: 200,
    }).start();
  };

  onSubmit = () => {
    NativeModules.Keyboard.endInput(this.state.value).then(() => {
      Animated.timing(this.state.opacity, {
        toValue: 0,
        duration: 200,
      }).start();
      NativeModules.Keyboard.waitForShow().then(this.onShow);
    });
  };

  onType = (letter: string) => {
    let {value} = this.state;
    value = value || '';

    if (letter === 'Backspace') {
      value = value.slice(0, -1);
    } else {
      value += String(letter);
    }

    this.onChange(value);
  };

  onChange = (value: ?string) => {
    if (value && value.length === 0) {
      value = null;
    }
    this.setState({value, shift: !Boolean(value)});
  };

  startDictation = () => {
    this.setState({
      dictation: true,
    });
    NativeModules.Keyboard.startDictation().then(this.onChange);
  };

  endDictation = () => {
    this.setState({
      dictation: false,
    });
    NativeModules.Keyboard.stopDictation();
  };

  render() {
    const tintColor = this.state.config.tintColor;

    return (
      <Animated.View
        style={{
          opacity: this.state.opacity,
          transform: [
            {
              translateY: this.state.opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [-150, 0],
              }),
            },
          ],
        }}
      >
        <Placeholder
          typed={this.state.value}
          placeholder={this.state.config.placeholder}
          onChange={this.onChange}
        />
        <View style={styles.keyboard}>
          {this.state.emoji ? (
            <EmojiKeyboard onType={this.onType} />
          ) : (
            <LetterKeyboard
              numeric={this.state.numeric}
              onType={this.onType}
              shift={this.state.shift}
              onToggleShift={() => this.setState({shift: !this.state.shift})}
            />
          )}
          <KeyboardRow>
            <Key
              grow={2}
              label={this.state.numeric ? 'ABC' : '123'}
              onClick={() => this.setState({numeric: !this.state.numeric})}
            />
            <Key
              grow={2}
              onClick={() => this.setState({emoji: !this.state.emoji})}
              icon={asset('emoji.png')}
            />
            <Key grow={6} onClick={() => this.onType(' ')} />
            {NativeModules.Keyboard.dictationAvailable && (
              <Key
                grow={2}
                onButtonPress={this.startDictation}
                onButtonRelease={this.endDictation}
                icon={asset('mic.png')}
              />
            )}
            <Key
              grow={3}
              onClick={this.onSubmit}
              label={this.state.config.returnKeyLabel}
            />
          </KeyboardRow>
          <Dictation />
        </View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  keyboard: {
    zIndex: 100,
    width: 600,
    height: 200,
    backgroundColor: '#262729',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    padding: 5,
    alignSelf: 'center',
  },
});

AppRegistry.registerComponent('HVPanel', () => Keyboard);
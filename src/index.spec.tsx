import { shallow } from 'enzyme';
import { describe, expect, test } from 'vitest';
import Ansi from './index.js';

const GREEN_FG = '\u001b[32m';
const YELLOW_BG = '\u001b[43m';
const BOLD = '\u001b[1m';
const RESET = '\u001b[0;m';

describe('Ansi', () => {
  test('hello world', () => {
    const el = shallow(<Ansi>hello world</Ansi>);
    expect(el).not.toBeNull();
    expect(el.text()).toBe('hello world');
  });

  test('can color', () => {
    const el = shallow(<Ansi>{`hello ${GREEN_FG}world`}</Ansi>);
    expect(el).not.toBeNull();
    expect(el.text()).toBe('hello world');
    expect(el.html()).toBe(
      '<code><span>hello </span><span style="color:rgb(0, 187, 0)">world</span></code>',
    );
  });

  test('can have className', () => {
    const el = shallow(<Ansi className="my-class">{'hello world'}</Ansi>);
    expect(el).not.toBeNull();
    expect(el.text()).toBe('hello world');
    expect(el.html()).toBe('<code class="my-class"><span>hello world</span></code>');
  });

  test('can nest', () => {
    const el = shallow(<Ansi>{`hello ${GREEN_FG}wo${YELLOW_BG}rl${RESET}d`}</Ansi>);
    expect(el).not.toBeNull();
    expect(el.text()).toBe('hello world');
    expect(el.html()).toBe(
      '<code><span>hello </span><span style="color:rgb(0, 187, 0)">wo</span><span style="background-color:rgb(187, 187, 0);color:rgb(0, 187, 0)">rl</span><span>d</span></code>',
    );
  });

  test('can handle carriage symbol', () => {
    const el = shallow(<Ansi>{'this sentence\rthat\nwill make you pause'}</Ansi>);
    expect(el).not.toBeNull();
    expect(el.text()).toBe('that sentence\nwill make you pause');
  });

  test('can handle backspace symbol', () => {
    const el = shallow(<Ansi>{'01hello\b goodbye'}</Ansi>);
    expect(el).not.toBeNull();
    expect(el.text()).toBe('01hell goodbye');
  });

  // see https://stackoverflow.com/questions/55440152/multiple-b-doesnt-work-as-expected-in-jupyter#
  test('handles backspace symbol in same funny way as Jupyter Classic -- 1/2', () => {
    const el = shallow(<Ansi>{'02hello\b\b goodbye'}</Ansi>);
    expect(el).not.toBeNull();
    expect(el.text()).toBe('02hel goodbye');
  });

  test('handles backspace symbol in same funny way as Jupyter Classic -- 2/2', () => {
    const el = shallow(<Ansi>{'03hello\b\b\b goodbye'}</Ansi>);
    expect(el).not.toBeNull();
    expect(el.text()).toBe('03hell goodbye');
  });

  test('can linkify', () => {
    const el = shallow(<Ansi linkify>{'this is a link: https://nteract.io/'}</Ansi>);
    expect(el).not.toBeNull();
    expect(el.text()).toBe('this is a link: https://nteract.io/');
    expect(el.html()).toBe(
      '<code><span>this is a link: <a href="https://nteract.io/" target="_blank">https://nteract.io/</a></span></code>',
    );
  });

  test('can linkify links starting with www.', () => {
    const el = shallow(<Ansi linkify>{'this is a link: www.google.com'}</Ansi>);
    expect(el).not.toBeNull();
    expect(el.text()).toBe('this is a link: www.google.com');
    expect(el.html()).toBe(
      '<code><span>this is a link: <a href="http://www.google.com" target="_blank">www.google.com</a></span></code>',
    );
  });

  test("doesn't linkify partial matches", () => {
    const el = shallow(<Ansi linkify>{"cant click this link: 'http://www.google.com'"}</Ansi>);
    expect(el).not.toBeNull();
    expect(el.text()).toBe("cant click this link: 'http://www.google.com'");
    expect(el.html()).toBe(
      '<code><span>cant click this link: &#x27;http://www.google.com&#x27;</span></code>',
    );
  });

  test('can distinguish URL-ish text', () => {
    const el = shallow(<Ansi linkify>{'<transport.model.TransportInfo'}</Ansi>);
    expect(el).not.toBeNull();
    expect(el.text()).toBe('<transport.model.TransportInfo');
  });

  test('can distinguish URL-ish text', () => {
    const el = shallow(
      <Ansi linkify>
        {
          "<module 'something' from '/usr/local/lib/python2.7/dist-packages/something/__init__.pyc'>"
        }
      </Ansi>,
    );
    expect(el).not.toBeNull();
    expect(el.text()).toBe(
      "<module 'something' from '/usr/local/lib/python2.7/dist-packages/something/__init__.pyc'>",
    );
  });

  test('can linkify multiple links', () => {
    const el = shallow(
      <Ansi linkify>
        {'this is a link: www.google.com and this is a second link: www.microsoft.com'}
      </Ansi>,
    );
    expect(el).not.toBeNull();
    expect(el.text()).toBe(
      'this is a link: www.google.com and this is a second link: www.microsoft.com',
    );
    expect(el.html()).toBe(
      '<code><span>this is a link: <a href="http://www.google.com" target="_blank">www.google.com</a> and this is a second link: <a href="http://www.microsoft.com" target="_blank">www.microsoft.com</a></span></code>',
    );
  });

  test('creates a minimal number of nodes when using linkify', () => {
    const el = shallow(
      <Ansi linkify>{'this is a link: www.google.com and this is text after'}</Ansi>,
    );
    expect(el).not.toBeNull();
    expect(el.text()).toBe('this is a link: www.google.com and this is text after');
    expect(el.childAt(0).children()).toHaveLength(3);
  });

  test('can linkify multiple links one after another', () => {
    const el = shallow(<Ansi linkify>{'www.google.com www.google.com www.google.com'}</Ansi>);
    expect(el).not.toBeNull();
    expect(el.text()).toBe('www.google.com www.google.com www.google.com');
    expect(el.html()).toBe(
      '<code><span><a href="http://www.google.com" target="_blank">www.google.com</a> <a href="http://www.google.com" target="_blank">www.google.com</a> <a href="http://www.google.com" target="_blank">www.google.com</a></span></code>',
    );
  });

  test('can handle URLs inside query parameters', () => {
    const el = shallow(<Ansi linkify>{'www.google.com/?q=https://www.google.com'}</Ansi>);
    expect(el).not.toBeNull();
    expect(el.text()).toBe('www.google.com/?q=https://www.google.com');
    expect(el.html()).toBe(
      '<code><span><a href="http://www.google.com/?q=https://www.google.com" target="_blank">www.google.com/?q=https://www.google.com</a></span></code>',
    );
  });

  describe('useClasses options', () => {
    test('can add the font color class', () => {
      const el = shallow(<Ansi useClasses>{`hello ${GREEN_FG}world`}</Ansi>);
      expect(el).not.toBeNull();
      expect(el.text()).toBe('hello world');
      expect(el.html()).toBe(
        '<code><span>hello </span><span class="ansi-green-fg">world</span></code>',
      );
    });

    test('can add the background color class', () => {
      const el = shallow(<Ansi useClasses>{`hello ${YELLOW_BG}world`}</Ansi>);
      expect(el).not.toBeNull();
      expect(el.text()).toBe('hello world');
      expect(el.html()).toBe(
        '<code><span>hello </span><span class="ansi-yellow-bg">world</span></code>',
      );
    });

    test('can add font and background color classes', () => {
      const el = shallow(<Ansi useClasses>{`hello ${GREEN_FG}${YELLOW_BG}world`}</Ansi>);
      expect(el).not.toBeNull();
      expect(el.text()).toBe('hello world');
      expect(el.html()).toBe(
        '<code><span>hello </span><span class="ansi-yellow-bg ansi-green-fg">world</span></code>',
      );
    });

    test('can add text decoration classes', () => {
      const el = shallow(<Ansi useClasses>{`hello ${GREEN_FG}${BOLD}world${RESET}!`}</Ansi>);
      expect(el).not.toBeNull();
      expect(el.text()).toBe('hello world!');
      expect(el.html()).toBe(
        '<code><span>hello </span><span class="ansi-green-fg ansi-bold">world</span><span>!</span></code>',
      );
    });

    test('can use useClasses with linkify', () => {
      const el = shallow(
        <Ansi linkify useClasses>{`${GREEN_FG}this is a link: https://nteract.io/`}</Ansi>,
      );
      expect(el).not.toBeNull();
      expect(el.text()).toBe('this is a link: https://nteract.io/');
      expect(el.html()).toBe(
        '<code><span class="ansi-green-fg">this is a link: <a href="https://nteract.io/" target="_blank">https://nteract.io/</a></span></code>',
      );
    });

    test('can add text decoration styles', () => {
      const el = shallow(<Ansi>{`hello ${GREEN_FG}${BOLD}world${RESET}!`}</Ansi>);
      expect(el).not.toBeNull();
      expect(el.text()).toBe('hello world!');
      expect(el.html()).toBe(
        '<code><span>hello </span><span style="color:rgb(0, 187, 0);font-weight:bold">world</span><span>!</span></code>',
      );
    });
  });
});

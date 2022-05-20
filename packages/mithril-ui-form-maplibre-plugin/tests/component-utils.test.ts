import { generateGradientIcon } from '../src/component-utils';

describe('testing generateGradientIcon method', () => {
  test('height and width from call without arguments should be 64', () => {
    const expected = { width: 64, height: 64 };
    const actual = generateGradientIcon();
    expect(actual).toMatchObject(expected);
  });
});

const { assert } = require('chai');
const { DateTime } = require('luxon');

const Condition = require('../condition');

describe('Condition', () => {
  describe('#constructor', () => {
    it('should have proper condition class when proper value is present', () => {
      const args = [['simple', '> 0'], ['time', '0000-0001']];
      const expected = ['SimpleCondition', 'TimeRangeCondition'];

      args.map((arg, i) => [arg, expected[i]])
        .forEach(([ arg, expected ]) => {
          const instance = new Condition(...arg);

          assert.isNotNull(instance.cond);
          assert.strictEqual(instance.cond.constructor.name, expected);
        });
    });

    it('should throw an Error when invalid condition argument is present', () => {
      const args = [['simple', '0'], ['time', '00000001']];

      args.forEach(arg => {
        const constructor = () => new Condition(...arg);

        assert.throws(constructor, Error);
      });
    });

    it('should work with simple condition when proper condition is present', () => {
      assert.equal(new Condition('simple', '> 0').test(5), true);
      assert.equal(new Condition('simple', '> 0').test(0), false);
      assert.equal(new Condition('simple', '<= 5').test(5), true);
      assert.equal(new Condition('simple', '<= 5').test(6), false);
    });

    it('should work with time condition when proper condition is present', () => {
      const now = DateTime.local();
      const future = now.plus({ hours: 1 });
      const arg = `${now.toFormat('HHmm')}-${future.toFormat('HHmm')}`;

      assert.equal(new Condition('time', arg).test(now), true);
    });
  });
});

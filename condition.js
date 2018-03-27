const assert = require('assert');
const vm = require('vm');

const { DateTime } = require('luxon');

class ConditionChecker {

  constructor(arg) {
    this.arg = arg;
  }

  match() {
    throw new Error('Not implemented');
  }

}

class SimpleCondition extends ConditionChecker {

  constructor(arg) {
    super(arg);

    const parts = /([>|<]=?)\s+?(\w{1,})/.exec(arg);
    if (parts === null) {
      throw new Error(`Invalid condition argument given: ${arg}`);
    }
    this.operator = parts[1];
    this.value = Number(parts[2]);
  }

  match(arg) {
    if (typeof arg !== 'number') {
      throw new Error(`Argument must be a number, ${typeof arg} given`);
    }

    const { operator, value } = this;
    return vm.runInContext(`${arg} ${operator} ${value}`, vm.createContext());
  }

}

class TimeRangeCondition extends ConditionChecker {

  constructor(arg) {
    super(arg);

    const parts = arg.split('-');
    assert.equal(parts.length, 2, `Invalid condition argument given: ${arg}`);
    parts.forEach(part => assert.equal(part.length, 4, `Invalid condition argument given: ${arg}`));

    this.from = Number(parts[0]);
    this.to = Number(parts[1]);
  }

  match(arg) {
    if (!arg instanceof DateTime) {
      throw new Error(`Argument must be a DateTime`);
    }

    const { from, to } = this;
    const target = Number(arg.toFormat('HHmm'));
    return from <= target && target <= to;
  }

}

class Condition {

  constructor(type, arg) {
    this.type = type;
    this.arg = arg;

    let conditionClass = null;
    switch(type) {
      case 'time':
      conditionClass = TimeRangeCondition;
      break;
      case 'simple':
      conditionClass = SimpleCondition;
      break;
    }

    if (!conditionClass) {
      throw new Error(`No registered condition found for ${type}`);
    }
    this.cond = new conditionClass(arg);
  }

  test(arg) {
    return this.cond.match(arg);
  }

}

module.exports = Condition;

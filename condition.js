const assert = require('assert');
const vm = require('vm');

const { DateTime } = require('luxon');

class ConditionChecker {

  constructor(parent, arg) {
    this.parent = parent;
    this.arg = arg;
  }

  get name() {
    throw new Error('Not implemented');
  }

  match() {
    throw new Error('Not implemented');
  }

}

class SimpleCondition extends ConditionChecker {

  constructor(parent, arg) {
    super(parent, arg);

    const parts = /([>|<]=?)\s+?(\w{1,})/.exec(arg);
    if (parts === null) {
      throw new Error(`Invalid condition argument given: ${arg}`);
    }
    this.operator = parts[1];
    this.value = Number(parts[2]);
  }

  get name() {
    return 'simple';
  }

  match(arg) {
    const { field } = this.parent;
    if (typeof arg[field] !== 'number' && arg[field] !== null) {
      throw new Error(`Argument must be a number, ${typeof arg[field]} given`);
    }

    if (arg[field] === null) {
      return null;
    }

    const { operator, value } = this;
    return vm.runInContext(`${arg[field]} ${operator} ${value}`, vm.createContext());
  }

}

class TimeRangeCondition extends ConditionChecker {

  constructor(parent, arg) {
    super(parent, arg);

    const parts = arg.split('-');
    assert.equal(parts.length, 2, `Invalid condition argument given: ${arg}`);
    parts.forEach(part => assert.equal(part.length, 4, `Invalid condition argument given: ${arg}`));

    this.from = Number(parts[0]);
    this.to = Number(parts[1]);
  }

  get name() {
    return 'time';
  }

  match(arg) {
    if (!arg.time instanceof DateTime && arg.time !== null) {
      throw new Error(`Argument must be a DateTime`);
    }

    const { from, to } = this;
    const target = Number(arg.time.toFormat('HHmm'));
    return (from <= to) ? from <= target && target <= to : (from <= target && to <= target) || (target <= to && target <= from);
  }

}

class Condition {

  constructor(type, arg, field, comment = '') {
    this.type = type;
    this.arg = arg;
    this.field = field;
    this.comment = comment;

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
    this.cond = new conditionClass(this, arg);
  }

  static fromConfig(config, comment = '') {
    const conds = [];

    if (config.times !== undefined) {
      conds.push(new Condition('time', config.times, 'times', comment));
    }

    for (const field of ['aqi', 'temperature', 'humidity']) {
      if (config[field] !== undefined) {
        conds.push(new Condition('simple', config[field], field, comment));
      }
    }

    return conds;
  }

  test(arg) {
    return this.cond.match(arg);
  }

}

module.exports = Condition;

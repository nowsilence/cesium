import defined from "../Core/defined.js";
import ConstantProperty from "./ConstantProperty.js";

function createProperty(
  name,
  privateName,
  subscriptionName,
  configurable,
  createPropertyCallback,
) {
  return {
    configurable: configurable,
    get: function () {
      return this[privateName];
    },
    set: function (value) {
      const oldValue = this[privateName];
      const subscription = this[subscriptionName];
      if (defined(subscription)) {
        subscription(); // 移除监听
        this[subscriptionName] = undefined;
      }

      const hasValue = value !== undefined;
      // value若为定义getValue方法则用回调创建属性
      if (
        hasValue &&
        (!defined(value) || !defined(value.getValue)) &&
        defined(createPropertyCallback)
      ) {
        value = createPropertyCallback(value);
      }

      if (oldValue !== value) {
        this[privateName] = value;
        // 触发所在对象的change事件，比如Entity（此属性在entity内定义，如果监听了entity的definitionChanged事件，就会收到回调）等
        this._definitionChanged.raiseEvent(this, name, value, oldValue);
      }

      if (defined(value) && defined(value.definitionChanged)) {
        /**
         * value可能是一个数值，也可能是一个Property（e.g ConstantProperty/ConstantPositionProperty/***MaterailProperty/CallbackProperty……）
         * 如果调用了property.setValue方法就会触发value的definitionChanged事件，
         * 这里做了一个监听，触发宿主的definitionChanged事件
         * */
        this[subscriptionName] = value.definitionChanged.addEventListener( // 返回值是移除监听
          function () {
            this._definitionChanged.raiseEvent(this, name, value, value);
          },
          this,
        );
      }
    },
  };
}

function createConstantProperty(value) {
  return new ConstantProperty(value);
}

/**
 * Used to consistently define all DataSources graphics objects.
 * This is broken into two functions because the Chrome profiler does a better
 * job of optimizing lookups if it notices that the string is constant throughout the function.
 * @private
 */
function createPropertyDescriptor(name, configurable, createPropertyCallback) {
  //Safari 8.0.3 has a JavaScript bug that causes it to confuse two variables and treat them as the same.
  //The two extra toString calls work around the issue.
  return createProperty(
    name,
    `_${name.toString()}`,
    `_${name.toString()}Subscription`,
    configurable ?? false,
    createPropertyCallback ?? createConstantProperty,
  );
}
export default createPropertyDescriptor;

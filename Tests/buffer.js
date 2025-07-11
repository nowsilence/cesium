// Cesium风格的属性定义
function createPropertyDescriptor(propertyName) {
    return {
      get: function() {
        console.log('aaa')
        return this[`_${propertyName}`];
      },
      set: function(value) {
        const oldValue = this[`_${propertyName}`];
        
        // 处理属性变更
        if (oldValue !== value) {
          this[`_${propertyName}`] = value;
          console.log('jjj')
          // 触发属性变更事件（Cesium内部使用Event机制）
        //   if (this._propertyChanged) {
        //     this._propertyChanged.raiseEvent(this, propertyName, oldValue, value);
        //   }
        }
      },
      enumerable: true,
      configurable: true
    };
}

class Entity {
    constructor(options = {}) {
      this._show = true; // 实际存储值的私有变量
      this._position = options.position;
    }
  }

// function Entity(options = {}) {
    // 初始化私有变量
    // this._show = true; //Cesium.defaultValue(options.show, true);
    // this._position = options.position;
    // this._propertyChanged = new Cesium.Event();
    
    // 其他初始化代码...
//   }
  
  // 定义多个属性
  Object.defineProperties(Entity.prototype, {
    show: createPropertyDescriptor('show'),
    position: createPropertyDescriptor('position')
  });

  const entity = new Entity();

  entity.show = false;

  console.log(entity.show);
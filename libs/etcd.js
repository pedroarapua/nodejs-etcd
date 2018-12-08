let _ = require('lodash'),
  Etcd = require('node-etcd');

module.exports = function (options, key, config) {
  this.etcd = new Etcd(options);
  this.watcher =  etcd.watcher('/' + key, null, { recursive: true });
  this.originalConfig = _.cloneDeep(config);
  this.rootKey = key;
  
  this.getOriginalValue = (keyChange, obj) => {
    let keys = keyChange.split('/').slice(1);
    
    if(keys.length === 1) {
      return obj;
    }
  
    keys = keys.slice(1);
    let value = obj;
    keys.forEach((key, index) => {
      value = value[key];
      if(_.isUndefined(value)) {
        return false;
      }
    });
  
    return value;
  };

  this.setValue = (keys, key, obj, value) => {
    keys = keys.slice(1);
    if(_.isObject(obj[key])) {
      return this.setValue(keys, keys[0], obj[key], value);
    }

    obj[key] = value;
  }

  this.setValueConfig = (data) => {
    let keys = data.node.key.split('/').slice(1);
    
    if(!data.node.value) {
      if(keys[0] === this.rootKey) {
        return Object.assign(config, this.originalConfig);
      }
      else {
        data.node.value = this.getOriginalValue(keys[1], this.originalConfig);
      }
    }
    keys = keys.slice(1);
    this.setValue(keys, keys[0], config, data.node.value);
    
  }

  return {
    subscribe: () => {
      this.watcher
        .on('change', this.setValueConfig);
    }
  };
};

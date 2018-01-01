const DeviceParser = require('./DeviceParser');
const AccessoryParser = require('./AccessoryParser');
const SwitchVirtualBasePressParser = require('./SwitchVirtualBasePressParser');

class Button2Parser extends DeviceParser {
    getAccessoriesParserInfo() {
        var info = {
            'Button2_StatelessProgrammableSwitch': Button2StatelessProgrammableSwitchParser,
            'Button2_Switch_VirtualSinglePress': Button2SwitchVirtualSinglePressParser,
            'Button2_Switch_VirtualDoublePress': Button2SwitchVirtualDoublePressParser,
            'Button2_Switch_VirtualLongPress': Button2SwitchVirtualLongPressParser
        }

        // 支持摇一摇
        if (this.model === 'sensor_switch.aq3') {
            info['Button2_StatelessProgrammableSwitch_Shake'] = Button2StatelessProgrammableSwitchShakeParser;
            info['Button2_Switch_VirtualShake'] = Button2SwitchVirtualShakeParser;
        }
        
        return info;
    }
}
module.exports = Button2Parser;

class Button2StatelessProgrammableSwitchParser extends AccessoryParser {
    getAccessoryCategory(deviceSid) {
        return this.Accessory.Categories.PROGRAMMABLE_SWITCH;
    }
    
    getAccessoryInformation(deviceSid) {
        return {
            'Manufacturer': 'Aqara',
            'Model': 'Button 2',
            'SerialNumber': deviceSid
        };
    }

    getServices(jsonObj, accessoryName) {
        var that = this;
        var result = [];
        
        var service = new that.Service.StatelessProgrammableSwitch(accessoryName);
        service.getCharacteristic(that.Characteristic.ProgrammableSwitchEvent);
        result.push(service);
        
        var batteryService  = new that.Service.BatteryService(accessoryName);
        batteryService.getCharacteristic(that.Characteristic.StatusLowBattery);
        batteryService.getCharacteristic(that.Characteristic.BatteryLevel);
        batteryService.getCharacteristic(that.Characteristic.ChargingState);
        result.push(batteryService);
        
        return result;
    }
    
    parserAccessories(jsonObj) {
        var that = this;
        var deviceSid = jsonObj['sid'];
        var uuid = that.getAccessoryUUID(deviceSid);
        var accessory = that.platform.AccessoryUtil.getByUUID(uuid);
        if(accessory) {
            var service = accessory.getService(that.Service.StatelessProgrammableSwitch);
            var programmableSwitchEventCharacteristic = service.getCharacteristic(that.Characteristic.ProgrammableSwitchEvent);
            var value = that.getProgrammableSwitchEventCharacteristicValue(jsonObj, null);
            if(null != value) {
                programmableSwitchEventCharacteristic.updateValue(value);
            }
            
            that.parserBatteryService(accessory, jsonObj);
        }
    }
    
    getProgrammableSwitchEventCharacteristicValue(jsonObj, defaultValue) {
        var value = this.getValueFrJsonObjData(jsonObj, 'status');
        if(value === 'click') {
            return this.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;
        } else if(value === 'double_click') {
            return this.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS;
        } else if(value === 'long_click_release') {
            /* 'long_click_press' */
            return this.Characteristic.ProgrammableSwitchEvent.LONG_PRESS;
        } else {
            return defaultValue;
        }
    }
}

class Button2StatelessProgrammableSwitchShakeParser extends AccessoryParser {
    getAccessoryCategory(deviceSid) {
        return this.Accessory.Categories.PROGRAMMABLE_SWITCH;
    }
    
    getAccessoryInformation(deviceSid) {
        return {
            'Manufacturer': 'Aqara',
            'Model': 'Button 2',
            'SerialNumber': deviceSid
        };
    }

    getServices(jsonObj, accessoryName) {
        var that = this;
        var result = [];
        
        var service = new that.Service.StatelessProgrammableSwitch(accessoryName);
        service.getCharacteristic(that.Characteristic.ProgrammableSwitchEvent);
        result.push(service);
        
        var batteryService  = new that.Service.BatteryService(accessoryName);
        batteryService.getCharacteristic(that.Characteristic.StatusLowBattery);
        batteryService.getCharacteristic(that.Characteristic.BatteryLevel);
        batteryService.getCharacteristic(that.Characteristic.ChargingState);
        result.push(batteryService);
        
        return result;
    }
    
    parserAccessories(jsonObj) {
        var that = this;
        var deviceSid = jsonObj['sid'];
        var uuid = that.getAccessoryUUID(deviceSid);
        var accessory = that.platform.AccessoryUtil.getByUUID(uuid);
        if(accessory) {
            var service = accessory.getService(that.Service.StatelessProgrammableSwitch);
            var programmableSwitchEventCharacteristic = service.getCharacteristic(that.Characteristic.ProgrammableSwitchEvent);
            programmableSwitchEventCharacteristic.setProps({
                validValues: [0]
            });
            var value = that.getProgrammableSwitchEventCharacteristicValue(jsonObj, null);
            if(null != value) {
                programmableSwitchEventCharacteristic.updateValue(value);
            }
            
            that.parserBatteryService(accessory, jsonObj);
        }
    }
    
    getProgrammableSwitchEventCharacteristicValue(jsonObj, defaultValue) {
        var value = this.getValueFrJsonObjData(jsonObj, 'status');
        if(value === 'shake') {
            return this.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;
        } else {
            return defaultValue;
        }
    }
}

class Button2SwitchVirtualBasePressParser extends SwitchVirtualBasePressParser {
    getAccessoryInformation(deviceSid) {
        return {
            'Manufacturer': 'Aqara',
            'Model': 'Button',
            'SerialNumber': deviceSid
        };
    }
}

class Button2SwitchVirtualSinglePressParser extends Button2SwitchVirtualBasePressParser {
    getWriteCommand(deviceSid, value) {
        return '{"cmd":"write","model":"' + this.model + '","sid":"' + deviceSid + '","data":"{\\"status\\":\\"click\\", \\"key\\": \\"${key}\\"}"}';
    }
    
    doSomething(jsonObj) {
        var deviceSid = jsonObj['sid'];
        var newObj = JSON.parse("{\"cmd\":\"report\",\"model\":\"" + this.model + "\",\"sid\":\"" + deviceSid + "\",\"data\":\"{\\\"status\\\":\\\"click\\\"}\"}");
        this.platform.ParseUtil.parserAccessories(newObj);
    }
}

class Button2SwitchVirtualDoublePressParser extends Button2SwitchVirtualBasePressParser {
    getWriteCommand(deviceSid, value) {
        return '{"cmd":"write","model":"' + this.model + '","sid":"' + deviceSid + '","data":"{\\"status\\":\\"double_click\\", \\"key\\": \\"${key}\\"}"}';
    }
    
    doSomething(jsonObj) {
        var deviceSid = jsonObj['sid'];
        var newObj = JSON.parse("{\"cmd\":\"report\",\"model\":\"" + this.model + "\",\"sid\":\"" + deviceSid + "\",\"data\":\"{\\\"status\\\":\\\"double_click\\\"}\"}");
        this.platform.ParseUtil.parserAccessories(newObj);
    }
}

class Button2SwitchVirtualLongPressParser extends Button2SwitchVirtualBasePressParser {
    getWriteCommand(deviceSid, value) {
        return '{"cmd":"write","model":"' + this.model + '","sid":"' + deviceSid + '","data":"{\\"status\\":\\"long_click_press\\", \\"key\\": \\"${key}\\"}"}';
    }
    
    doSomething(jsonObj) {
        var deviceSid = jsonObj['sid'];
        var newObj = JSON.parse("{\"cmd\":\"report\",\"model\":\"" + this.model + "\",\"sid\":\"" + deviceSid + "\",\"data\":\"{\\\"status\\\":\\\"long_click_press\\\"}\"}");
        this.platform.ParseUtil.parserAccessories(newObj);
    }
}

class Button2SwitchVirtualShakeParser extends Button2SwitchVirtualBasePressParser {
    getWriteCommand(deviceSid, value) {
        return '{"cmd":"write","model":"' + this.model + '","sid":"' + deviceSid + '","data":"{\\"status\\":\\"shake\\", \\"key\\": \\"${key}\\"}"}';
    }
    
    doSomething(jsonObj) {
        var deviceSid = jsonObj['sid'];
        var newObj = JSON.parse("{\"cmd\":\"report\",\"model\":\"" + this.model + "\",\"sid\":\"" + deviceSid + "\",\"data\":\"{\\\"status\\\":\\\"shake\\\"}\"}");
        this.platform.ParseUtil.parserAccessories(newObj);
    }
}

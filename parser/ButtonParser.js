const DeviceParser = require('./DeviceParser');
const AccessoryParser = require('./AccessoryParser');
const SwitchVirtualBasePressParser = require('./SwitchVirtualBasePressParser');

class ButtonParser extends DeviceParser {
    getAccessoriesParserInfo() {
        return {
            'Button_StatelessProgrammableSwitch': ButtonStatelessProgrammableSwitchParser,
            'Button_Switch_VirtualSinglePress': ButtonSwitchVirtualSinglePressParser,
            'Button_Switch_VirtualDoublePress': ButtonSwitchVirtualDoublePressParser
            // 'Button_Switch_VirtualLongPress': ButtonSwitchVirtualLongPressParser
        }
    }
}
module.exports = ButtonParser;

class ButtonStatelessProgrammableSwitchParser extends AccessoryParser {
    getAccessoryCategory(deviceSid) {
        return this.Accessory.Categories.PROGRAMMABLE_SWITCH;
    }
    
    getAccessoryInformation(deviceSid) {
        return {
            'Manufacturer': 'Aqara',
            'Model': 'Button',
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

class ButtonSwitchVirtualBasePressParser extends SwitchVirtualBasePressParser {
    getAccessoryInformation(deviceSid) {
        return {
            'Manufacturer': 'Aqara',
            'Model': 'Button',
            'SerialNumber': deviceSid
        };
    }
}

class ButtonSwitchVirtualSinglePressParser extends ButtonSwitchVirtualBasePressParser {
    getWriteCommand(deviceSid, value) {
        return '{"cmd":"write","model":"switch","sid":"' + deviceSid + '","data":"{\\"status\\":\\"click\\", \\"key\\": \\"${key}\\"}"}';
    }
    
    doSomething(jsonObj) {
        var deviceSid = jsonObj['sid'];
        var newObj = JSON.parse("{\"cmd\":\"report\",\"model\":\"switch\",\"sid\":\"" + deviceSid + "\",\"data\":\"{\\\"status\\\":\\\"click\\\"}\"}");
        this.platform.ParseUtil.parserAccessories(newObj);
    }
}

class ButtonSwitchVirtualDoublePressParser extends ButtonSwitchVirtualBasePressParser {
    getWriteCommand(deviceSid, value) {
        return '{"cmd":"write","model":"switch","sid":"' + deviceSid + '","data":"{\\"status\\":\\"double_click\\", \\"key\\": \\"${key}\\"}"}';
    }
    
    doSomething(jsonObj) {
        var deviceSid = jsonObj['sid'];
        var newObj = JSON.parse("{\"cmd\":\"report\",\"model\":\"switch\",\"sid\":\"" + deviceSid + "\",\"data\":\"{\\\"status\\\":\\\"double_click\\\"}\"}");
        this.platform.ParseUtil.parserAccessories(newObj);
    }
}

// class ButtonSwitchVirtualLongPressParser extends ButtonSwitchVirtualBasePressParser {
    // getWriteCommand(deviceSid, value) {
        // return '{"cmd":"write","model":"switch","sid":"' + deviceSid + '","data":"{\\"status\\":\\"long_click_press\\", \\"key\\": \\"${key}\\"}"}';
    // }
// }

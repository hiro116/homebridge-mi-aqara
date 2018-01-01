const GatewayParser = require('./../parser/GatewayParser');
const ContactSensorParser = require('./../parser/ContactSensorParser');
const MotionSensorParser = require('./../parser/MotionSensorParser');
const ButtonParser = require('./../parser/ButtonParser');
const TemperatureAndHumiditySensorParser = require('./../parser/TemperatureAndHumiditySensorParser');
const SingleSwitchParser = require('./../parser/SingleSwitchParser');
const DuplexSwitchParser = require('./../parser/DuplexSwitchParser');
const SingleSwitchLNParser = require('./../parser/SingleSwitchLNParser');
const DuplexSwitchLNParser = require('./../parser/DuplexSwitchLNParser');
const SingleButton86Parser = require('./../parser/SingleButton86Parser');
const DuplexButton86Parser = require('./../parser/DuplexButton86Parser');
const PlugBaseParser = require('./../parser/PlugBaseParser');
const PlugBase86Parser = require('./../parser/PlugBase86Parser');
const MagicSquareParser = require('./../parser/MagicSquareParser');
const SmokeDetectorParser = require('./../parser/SmokeDetectorParser');
const NatgasDetectorParser = require('./../parser/NatgasDetectorParser');
const ElectricCurtainParser = require('./../parser/ElectricCurtainParser');
const ContactSensor2Parser = require('./../parser/ContactSensor2Parser');
const MotionSensor2Parser = require('./../parser/MotionSensor2Parser');
const Button2Parser = require('./../parser/Button2Parser');
const TemperatureAndHumiditySensor2Parser = require('./../parser/TemperatureAndHumiditySensor2Parser');
const WaterDetectorParser = require('./../parser/WaterDetectorParser');

class ParseUtil {
    constructor(platform) {
        this.platform = platform;
        this.parsers = {}
        
        this.models = {
            'gateway': GatewayParser, // 网关
            'magnet': ContactSensorParser, // 门磁感应
            'motion': MotionSensorParser, // 人体感应
            'switch': ButtonParser, // 按钮
            'sensor_ht': TemperatureAndHumiditySensorParser, // 温度湿度传感器
            'ctrl_neutral1': SingleSwitchParser, // 单按钮墙壁开关
            'ctrl_neutral2': DuplexSwitchParser, // 双按钮墙壁开关
            'ctrl_ln1': SingleSwitchLNParser, // 单按钮墙壁开关零火版
            'ctrl_ln2': DuplexSwitchLNParser, // 双按钮墙壁开关零火版
            'ctrl_ln1.aq1': SingleSwitchLNParser, // 单按钮墙壁开关零火版
            'ctrl_ln2.aq1': DuplexSwitchLNParser, // 双按钮墙壁开关零火版
            '86sw1': SingleButton86Parser, // 86型无线单按钮开关
            '86sw2': DuplexButton86Parser, // 86型无线双按钮开关
            'plug': PlugBaseParser, // 插座
            '86plug': PlugBase86Parser, // 86型墙壁插座
            'cube': MagicSquareParser, // 魔方
            'smoke': SmokeDetectorParser, // 烟雾警报器
            'natgas': NatgasDetectorParser, // 天然气警报器
            'curtain': ElectricCurtainParser, // 电动窗帘
            'sensor_magnet.aq2': ContactSensor2Parser, // 门磁感应 第二代
            'sensor_motion.aq2': MotionSensor2Parser, // 人体感应 第二代
            'sensor_switch.aq2': Button2Parser, // 按钮 第二代
            'sensor_switch.aq3': Button2Parser, // 按钮 第二代
            'weather.v1': TemperatureAndHumiditySensor2Parser, // 温度湿度传感器 第二代
            'sensor_wleak.aq1': WaterDetectorParser // 水浸传感器
        }
    }
    
    getByModel(model) {
        return (model in this.parsers) 
        ? this.parsers[model] 
        : ((model in this.models) ? new (this.models[model])(this.platform, model) : null);
    }
    
    getCreateAccessories(jsonObj) {
        var result = [];
        
        var model = jsonObj['model'];
        var parser = this.getByModel(model);
        if(parser) {
            result = parser.getCreateAccessories(jsonObj);
        }
        
        return result;
    }
    
    parserAccessories(jsonObj) {
        var result = [];
        
        var model = jsonObj['model'];
        var parser = this.getByModel(model);
        if(parser) {
            result = parser.parserAccessories(jsonObj);
        }
        
        return result;
    }
    
    getAccessoriesUUID(sid, deviceModel) {
        var result = [];
        
        var parser = this.getByModel(deviceModel);
        if(parser) {
            result = parser.getAccessoriesUUID(sid);
        }
        
        return result;
    }
}

module.exports = ParseUtil;
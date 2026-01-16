/**
 * Payload Decoder
 *
 * Copyright 2026 Milesight IoT
 *
 * @product UC100
 */
var RAW_VALUE = 0x00;

// Chirpstack v4 / TTN
function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    var res = [];   
    var isHistory = false;
    var historicDate = null;

    // Handle Historical Data
    if (decoded.history && decoded.history.length > 0) {
        isHistory = true;
        // Using the timestamp from the first historical record for the top-level HistoricDate
        historicDate = decoded.history[0].timestamp;

        decoded.history.forEach(function (item) {
            for (var i = 1; i <= 32; i++) {
                var key = "modbus_chn_" + i;
                if (item.hasOwnProperty(key)) {
                    res.push({
                        ChannelId: i,
                        Value: item[key],                       
                        ScalingValue: 1,
                        ScalingChannel: -1
                    });
                }
            }
        });
    } 
    // Handle Regular Data
    else {
        for (var i = 1; i <= 32; i++) {
            var key = "modbus_chn_" + i;
            if (decoded.hasOwnProperty(key)) {
                res.push({
                    ChannelId: i,
                    Value: decoded[key],                  
                    ScalingValue: 1,
                    ScalingChannel: -1
                });
            }
        }
    }

    return {
        data: {
            isHistory: isHistory,
            HistoricDate: historicDate,
            dexmaSettings: dexmaSettings,
            res: res
        }
    };
}

function milesightDeviceDecode(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // IPSO VERSION
        if (channel_id === 0xff && channel_type === 0x01) {
            decoded.ipso_version = readProtocolVersion(bytes[i]);
            i += 1;
        }
        // HARDWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x09) {
            decoded.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // FIRMWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x0a) {
            decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // TSL VERSION
        else if (channel_id === 0xff && channel_type === 0xff) {
            decoded.tsl_version = readTslVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // LORAWAN CLASS TYPE
        else if (channel_id === 0xff && channel_type === 0x0f) {
            decoded.lorawan_class = readLoRaWANClass(bytes[i]);
            i += 1;
        }
        // RESET EVENT
        else if (channel_id === 0xff && channel_type === 0xfe) {
            decoded.reset_event = readResetEvent(1);
            i += 1;
        }
        // DEVICE STATUS
        else if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.device_status = readDeviceStatus(1);
            i += 1;
        }
        // MODBUS (Regular)
        else if (channel_id === 0xff && channel_type === 0x19) {
            var modbus_chn_id = readUInt8(bytes[i++]) + 1;
            readUInt8(bytes[i++]); 
            var data_def = readUInt8(bytes[i++]);
            var sign = (data_def >>> 7) & 0x01;
            var data_type = data_def & 0x7f; 
            var modbus_chn_name = "modbus_chn_" + modbus_chn_id;

            switch (data_type) {
                case 0:
                case 1:
                    decoded[modbus_chn_name] = readOnOffStatus(bytes[i]);
                    i += 1;
                    break;
                case 2:
                case 3:
                    decoded[modbus_chn_name] = sign ? readInt16LE(bytes.slice(i, i + 2)) : readUInt16LE(bytes.slice(i, i + 2));
                    i += 2;
                    break;
                case 4:
                case 6:
                    decoded[modbus_chn_name] = sign ? readInt32LE(bytes.slice(i, i + 4)) : readUInt32LE(bytes.slice(i, i + 4));
                    i += 4;
                    break;
                case 8:
                case 9:
                case 10:
                case 11:
                    decoded[modbus_chn_name] = sign ? readInt16LE(bytes.slice(i, i + 2)) : readUInt16LE(bytes.slice(i, i + 2));
                    i += 4;
                    break;
                case 5:
                case 7:
                    decoded[modbus_chn_name] = readFloatLE(bytes.slice(i, i + 4));
                    i += 4;
                    break;
            }
        }
        // MODBUS HISTORY (v1.7+)
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var modbus_chn_id = readUInt8(bytes[i + 4]) + 1;
            var data_def = readUInt8(bytes[i + 5]);
            var sign = (data_def >>> 7) & 0x01;
            var data_type = (data_def >> 2) & 0x1f;
            var read_status = (data_def >>> 1) & 0x01;
            i += 6;

            var data = { timestamp: timestamp };
            var modbus_chn_name = "modbus_chn_" + modbus_chn_id;
            
            if (read_status !== 0) {
                switch (data_type) {
                    case 0: case 1:
                        data[modbus_chn_name] = readOnOffStatus(bytes[i]);
                        i += 4;
                        break;
                    case 2: case 3: case 14: case 15:
                        data[modbus_chn_name] = sign ? readInt32LE(bytes.slice(i, i + 4)) : readUInt32LE(bytes.slice(i, i + 4));
                        i += 4;
                        break;
                    case 4: case 5: case 6: case 7: case 16: case 17: case 18: case 19:
                        data[modbus_chn_name] = sign ? readInt32LE(bytes.slice(i, i + 4)) : readUInt32LE(bytes.slice(i, i + 4));
                        i += 4;
                        break;
                    case 8: case 9: case 20: case 21:
                        data[modbus_chn_name] = sign ? readInt16LE(bytes.slice(i, i + 2)) : readUInt16LE(bytes.slice(i, i + 2));
                        i += 4;
                        break;
                    case 10: case 11: case 12: case 13: case 22: case 23: case 24: case 25:
                        data[modbus_chn_name] = readFloatLE(bytes.slice(i, i + 4));
                        i += 4;
                        break;
                }
            } else { i += 4; }

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var result = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        }
        else { i = bytes.length; }
    }
    return decoded;
}

function handle_downlink_response(channel_type, bytes, offset) {
    var decoded = {};
    switch (channel_type) {
        case 0x03:
            decoded.report_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x04:
            decoded.confirm_mode_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x68:
            decoded.history_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        default:
            offset = bytes.length;
    }
    return { data: decoded, offset: offset };
}

function readProtocolVersion(bytes) { return "v" + ((bytes & 0xf0) >> 4) + "." + (bytes & 0x0f); }
function readHardwareVersion(bytes) { return "v" + (bytes[0] & 0xff).toString(16) + "." + ((bytes[1] & 0xff) >> 4); }
function readFirmwareVersion(bytes) { return "v" + (bytes[0] & 0xff).toString(16) + "." + (bytes[1] & 0xff).toString(16); }
function readTslVersion(bytes) { return "v" + (bytes[0] & 0xff) + "." + (bytes[1] & 0xff); }
function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) { temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2)); }
    return temp.join("");
}
function readLoRaWANClass(type) { return ["Class A", "Class B", "Class C", "Class CtoB"][type] || "unknown"; }
function readResetEvent(status) { return status === 1 ? "reset" : "normal"; }
function readDeviceStatus(status) { return status === 1 ? "on" : "off"; }
function readSensorStatus(status) { return status === 1 ? "read error" : "normal"; }
function readEnableStatus(status) { return status === 1 ? "enable" : "disable"; }
function readYesNoStatus(status) { return status === 1 ? "yes" : "no"; }
function readOnOffStatus(status) { return status === 1 ? "on" : "off"; }
function readModbusAlarmType(type) { return ["normal", "threshold alarm", "threshold release alarm", "mutation alarm"][type] || "unknown"; }
function readUInt8(bytes) { return bytes & 0xff; }
function readUInt16LE(bytes) { return ((bytes[1] << 8) + bytes[0]) & 0xffff; }
function readInt16LE(bytes) { var ref = readUInt16LE(bytes); return ref > 0x7fff ? ref - 0x10000 : ref; }
function readUInt32LE(bytes) { return ((bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0]) >>> 0; }
function readInt32LE(bytes) { var ref = readUInt32LE(bytes); return ref > 0x7fffffff ? ref - 0x100000000 : ref; }
function readFloatLE(bytes) {
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 23) & 0xff;
    var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    return Number((sign * m * Math.pow(2, e - 150)).toFixed(2));
}
function readAscii(bytes) {
    var str = "";
    for (var i = 0; i < bytes.length; i++) { str += String.fromCharCode(bytes[i]); }
    return str;
}
function getValue(map, key) { if (RAW_VALUE) return key; var value = map[key]; return value || "unknown"; }

Object.defineProperty(Object, "assign", {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function (target) {
        "use strict";
        if (target == null) { throw new TypeError("Cannot convert first argument to object"); }
        var to = Object(target);
        for (var i = 1; i < arguments.length; i++) {
            var nextSource = arguments[i];
            if (nextSource == null) { continue; }
            nextSource = Object(nextSource);
            var keysArray = Object.keys(Object(nextSource));
            for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                var nextKey = keysArray[nextIndex];
                var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                if (desc !== undefined && desc.enumerable) {
                    if (Array.isArray(to[nextKey]) && Array.isArray(nextSource[nextKey])) {
                        to[nextKey] = to[nextKey].concat(nextSource[nextKey]);
                    } else { to[nextKey] = nextSource[nextKey]; }
                }
            }
        }
        return to;
    },
});
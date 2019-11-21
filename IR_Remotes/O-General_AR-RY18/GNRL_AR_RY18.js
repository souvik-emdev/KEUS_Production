/*
v1.0
Encoder files for iGeneral AC
Protocol : Fujitsu128_56AC
AC model : AR-RY18
*/


const rootPath = require('app-root-path');
const IRUtils = require(rootPath + '/zigbee-coordinator/device-helpers/ir-blaster/ir-service/ir_utils');

const info = {
    "Brand": "oGeneral",
    "Model": "AR-RY18",
    "Protocol": "Fujitsu128_56AC",
    "version": 1,
    "filename": "GNRL_AR_RY18",
    "device": "AC",
};


//8th byte
const tempOptions = [
    0x04,	//18
    0x0C,	//19
    0x02,	//20
    0x0A,	//21
    0x06,	//22
    0x0E,	//23
    0x01,	//24
    0x09,	//25
    0x05,	//26
    0x0D,	//27
    0x03,	//28
    0x0B,	//29
    0x07	//30
];

//10th byte					
const fanOptions = {
    "low": 0xC0,
    "medium": 0x40,
    "high": 0x80,
    "auto": 0x00,
    "quiet": 0x20
};

//10th 
const swingOptions = {
    "vertical": {
        "off": 0x00,
        "auto": 0x08
    },
    "horizontal": {
        "off": 0x00,
        "auto": 0x04
    },
};

//9th byte
const modeOptions = {
    "cool": {
        "mode": 0x80,
        "temp": null,
        "fan": null
    },

    "dry": {
        "mode": 0x40,
        "temp": null,
        "fan": null
    },

    "fan": {
        "mode": 0xC0,
        "temp": null,
        "fan": null
    },

    "auto": {
        "mode": 0x00,
        "temp": null,
        "fan": null
    }
};

const updateTypesAvailable = ["ONOF", "SWNGV", "SWNGH"];
const sceneTypesAvailable = ["ONOF", "SWNGV"];


class IREncoder {

    static getEncodedByteArray(irInfo) {

        var irData = [];

        console.log('\n Incoming data \n')
        console.log(irInfo);

        var
            temp = irInfo.temperature ? (irInfo.temperature - 18) : 7,
            fan = irInfo.fan ? irInfo.fan : "auto",
            power = irInfo.power ? 1 : 0,
            swing_v = irInfo.swing.vertical ? irInfo.swing.vertical : "auto",
            swing_h = irInfo.swing.horizontal ? irInfo.swing.horizontal : "auto",
            mode = irInfo.mode ? irInfo.mode : "cool",
            special = irInfo.special ? 1 : 0,
            type = irInfo.updateType ? irInfo.updateType : [],
            configId = irInfo.configId ? irInfo.configId : [],
            noOfSignal = irInfo.no_of_signal ? irInfo.no_of_signal : 1,

            i = 0, j = 0, x = 0,
            checkSum = 0;

        if (noOfSignal > 0) {
            //no of signals
            irData[i] = noOfSignal;
            i++;
        }

        while (j < noOfSignal) {
            //config Id
            irData[i] = configId;
            i++;

            //pos of length
            x = i;
            i++;

            checkSum = 0;

            irData[i] = 0x28;
            i++;

            irData[i] = 0xC6;
            i++;

            irData[i] = 0x00;
            i++;

            irData[i] = 0x08;
            i++;

            irData[i] = 0x08;
            i++;

            if (power == 0) {
                irData[i] = 0x40;
                i++;
                irData[i] = 0xBF;
                i++;
            }


            else {
                irData[i] = 0x7F;
                i++;

                irData[i] = 0x90;
                i++;

                irData[i] = 0x0C;
                checkSum += IRUtils.binaryReverse({ number: irData[i], pow: 8 });
                i++;

                irData[i] = (type[j] == "ONOF" ? 0x80 : 0x00) | tempOptions[temp];
                checkSum += IRUtils.binaryReverse({ number: irData[i], pow: 8 });
                i++;

                irData[i] = modeOptions[mode]["mode"];
                checkSum += IRUtils.binaryReverse({ number: irData[i], pow: 8 });
                i++;

                irData[i] = fanOptions[fan];



                if (type[j] == "SWNGV") {
                    irData[i] |= swingOptions["vertical"][swing_v];
                }

                else if (type[j] == "SWNGH") {
                    irData[i] = swingOptions["horizontal"][swing_h];
                }

                checkSum += IRUtils.binaryReverse({ number: irData[i], pow: 8 });

                i++;
                console.log('\n Checksum', checkSum);

                irData[i] = 0x00;
                i++;

                irData[i] = 0x00;
                i++;

                irData[i] = 0x00;
                i++;

                irData[i] = 0x04;
                checkSum += IRUtils.binaryReverse({ number: irData[i], pow: 8 });
                i++;

                checkSum = 256 - (checkSum % 256);
                checkSum = IRUtils.binaryReverse({ number: checkSum, pow: 8 });
                irData[i] = checkSum;
                i++;
            }

            irData[x] = i - x - 1;
            j++;
        }

        console.log('\n Formed data');
        var stringer = "[";
        irData.forEach(function (element) {
            stringer += ('0x' + element.toString(16) + ", ");
        });
        stringer += "]";
        console.log(stringer);

        return irData;

    }


    static getSceneArray(irInfo) {

        var configId = irInfo.configId ? irInfo.configId : 0;

        if (irInfo.power) {
            irInfo.updateType = sceneTypesAvailable;
            irInfo.no_of_signal = sceneTypesAvailable.length;
        }
        else {
            irInfo.updateType = ["ONOF"];
            irInfo.no_of_signal = 1;
        }


        if (configId) {
            return this.getEncodedByteArray(irInfo);
        }

        //return [];
    }

    static getSignalArray(irInfo) {
        var configId = irInfo.configId ? irInfo.configId : 0;

        if (updateTypesAvailable.indexOf(irInfo.updateType[0]) < 0) {
            irInfo.updateType = ["NORMAL"];
        }

        irInfo.no_of_signal = 1;

        if (configId) {
            return this.getEncodedByteArray(irInfo);
        }

        //return
    }

    static getConfigInfo() {
        return {
            configData: [10000, 3240, 1590, 405, 370, 405, 1180, 405, 38000],
            configFrame: [0x53]
        }

        //return [];
    }

    static getTempLevels() {
        return {
            "low": 18,
            "high": 30
        };
    }

    static getFanLevels() {
        return Object.keys(fanOptions);
    }

    static getSwingLevels() {
        return {
            horizontal: Object.keys(swingOptions.horizontal),
            vertical: Object.keys(swingOptions.vertical)
        }
    }

    static getModes() {
        return Object.keys(modeOptions);
    }

    static getInfo() {
        return info;
    }
}

module.exports = IREncoder;


// // IR utility methods


// class IRUtils {

//     static binaryReverse(data) {
//         var revNum = 0,
//             i = 0,
//             num = data.number,
//             pow = data.pow;


//         for (i = 0; i < pow; i++) {
//             revNum = revNum | (num >> i & 1);
//             revNum = revNum << 1;
//         }

//         revNum = revNum >> 1;

//         return revNum;
//     }

//     static binaryCompliment(data) {
//         var revNum = 0,
//             i = 0,
//             num = data.number,
//             pow = data.pow;

//         revNum = num ^ (Math.pow(2, pow) - 1);

//         return revNum;
//     }

// }
// //module.exports = IRUtils;

// IREncoder.getSignalArray({
//     configId: 1,
//     temperature: 18,
//     fan: 'auto',
//     power: 1,
//     swing: { "vertical": "auto", "horizontal": "off" },
//     mode: "fan",
//     updateType: ["SWNGV"]
// });
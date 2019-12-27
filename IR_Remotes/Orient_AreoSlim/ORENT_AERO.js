/*
v1.0
Encoder files for Orient Fan
Protocol : NEC
Fan model : Orient Aeroslim
file : ORENT_AERO.js
*/

const rootPath = require('app-root-path');
const IRUtils = require(rootPath + '/zigbee-coordinator/device-helpers/ir-blaster/ir-service/ir_utils');

const info = {
    "Brand": "Orient",
    "Model": "Aeroslim",
    "Protocol": "NEC",
    "version": 1,
    "filename": "ORENT_AERO",
    "device": "FAN",
};

var fan_level = 0;

const blastOptions = {

    "ONOF": 0xF5,

    "FAN_INC": [],
    "FAN_DEC": [],

    "FAN_LEVELS": [
        0x55, //fs1
        0x5D, //fs2
        0x53, //fs3
        0x5B, //fs4
        0x57 //fs5
    ],

    "FAN_LED": 0x75,
    "FAN_BST": 0xB5,
};


class IREncoder {


    static getEncodedByteArray(irInfo) {

        var irData = [];

        console.log('\n Incoming data \n')
        console.log(irInfo);

        var
            configId = irInfo.configId ? irInfo.configId : 0,
            updateType = irInfo.updateType ? irInfo.updateType : [],
            noOfSignal = irInfo.updateType ? irInfo.no_of_signal : 0,
            i = 0, j = 0, x = 0;

        i = 0, j = 0;

        if (noOfSignal > 0) {
            //no of signals
            irData[i] = noOfSignal;
            i++;
        }

        var signalStruct = {};

        while (j < noOfSignal) {
            signalStruct.repCount = 0;
            signalStruct.formatLength = 0;
            signalStruct.format = [];
            signalStruct.signalData = [];
            signalStruct.dataLength = 0;
            signalStruct.bitCount = 0;

            var index = 0;

            signalStruct.format[signalStruct.formatLength++] = 0x02; //start
            signalStruct.format[signalStruct.formatLength++] = 0x10; //data

            signalStruct.signalData[index++] = 0xDB;
            signalStruct.bitCount += 8;

            signalStruct.signalData[index++] = 0x53;
            signalStruct.bitCount += 8;

            // signalStruct.signalData[index++] = blastOptions[updateType[j]];
            // signalStruct.bitCount += 8;
            switch (updateType[j]) {
                case "FAN_INC":
                    if (fan_level < blastOptions["FAN_LEVELS"].length) {
                        fan_level++;
                    }

                    signalStruct.signalData[index++] = blastOptions["FAN_LEVELS"][fan_level-1];
                    break;

                case "FAN_DEC":
                    if (fan_level != 0) {
                        fan_level--;
                    }

                    signalStruct.signalData[index++] = blastOptions["FAN_LEVELS"][fan_level];
                    break;

                default:
                    signalStruct.signalData[index++] = blastOptions[updateType[j]];
                    break;
            }
            signalStruct.bitCount += 8;

            signalStruct.signalData[index] = IRUtils.binaryCompliment({ number: signalStruct.signalData[index - 1], pow: 8 });
            index++;
            signalStruct.bitCount += 8;

            signalStruct.format[signalStruct.formatLength++] = signalStruct.bitCount & 0xFF; //fill in bits
            signalStruct.format[signalStruct.formatLength++] = signalStruct.bitCount >> 8;

            signalStruct.format[signalStruct.formatLength++] = 0x04;  //stop
            signalStruct.format[signalStruct.formatLength++] = 0x03;  //repeat
            signalStruct.format[signalStruct.formatLength++] = 0x04;  //stop

            signalStruct.dataLength += 4;


            //config Id
            irData[i++] = configId;
            //total length
            irData[i++] = 1 + (signalStruct.formatLength + 1) + signalStruct.dataLength;

            //format and settings
            irData[i++] = signalStruct.repCount;

            irData[i++] = signalStruct.formatLength;

            irData = irData.concat(signalStruct.format);
            i += signalStruct.formatLength;

            irData = irData.concat(signalStruct.signalData);
            i += signalStruct.dataLength;

            j++;
        }

        console.log('\n Formed data');
        console.log(irData);

        console.log('\n Formed data-HEX');
        var stringer = "[";
        irData.forEach(function (element) {
            stringer += ('0x' + element.toString(16) + ", ");
        });
        stringer += "]";
        console.log(stringer);

        //return [dummyArray successful message]
        return irData;

    }


    //

    static getSceneArray(irInfo) {

        var configId = irInfo.configId ? irInfo.configId : 0;
        irInfo.no_of_signal = irInfo.no_of_signal ? irInfo.no_of_signal : 1;
        irInfo.updateType = ["ONOF"];

        if (configId) {
            return this.getEncodedByteArray(irInfo);
        }
    }

    static getSignalArray(irInfo) {

        var configId = irInfo.configId ? irInfo.configId : 0;
        irInfo.no_of_signal = irInfo.no_of_signal ? irInfo.no_of_signal : 1;

        if (configId) {
            return this.getEncodedByteArray(irInfo);
        }
    }

    static getConfigInfo() {
        return {
            configData: [8000, 3200, 1600, 400, 400, 400, 1200, 400, 38000],

			/*learnIrData format
			8950H, 4480L	start
			8950H, 2220L	repeat 
			550H, 550L,  	1
			550H, 1650L		0
			550H, 42200L		section stop    
			*/
            configFrame: [
                0x6B,	//config type
                22,	//length
                35,	//pwm_duty
                0x40,	///no of timings = 5/repeat count= 1
                0x26, 0x02, 0x26, 0x02, 		// 0 - 550H, 550L
                0x72, 0x06, 0x26, 0x02, 		// 1 - 550H, 1650L
                0x80, 0x11, 0xF6, 0x22, 		// t3  8950H, 4480L
                0xAC, 0x08, 0xF6, 0x22, 		// t4 ? 8950H, 2220L
                0xD8, 0xA4, 0x26, 0x02, 		// t5 - 550H, 42200L
            ]
        }

        //return [];
    }

    static getBlastOptions() {
        return Object.keys(blastOptions);
    }

    static getInfo() {
        return info;
    }

}

module.exports = IREncoder;




//////////////////////////////////////////////////////////////////////////////////
// IR utility methods


// class IRUtils {

//     static binaryReverse(data)
//     {
//         var revNum = 0,
//             i =0,
//             num = data.number,
//             pow = data.pow;


//         for( i = 0; i < pow; i++)
//         {
//             revNum = revNum | (num>>i & 1) ;
//             revNum = revNum<<1;
//         }	

//         revNum = revNum >> 1; 

//         return revNum;
//     }

//     static binaryCompliment(data)
//     {
//         var revNum = 0,
//             i =0,
//             num = data.number,
//             pow = data.pow;

//             revNum = num ^ (Math.pow(2,pow) -1);

//         return revNum;
//     }		

// }
// module.exports = IRUtils;

// IREncoder.getSignalArray({
//     configId: 1,
//     updateType: ["FAN_INC"]
// });
/*
v1.0
Encoder files for Daikin AC
Protocol : DAIKIN176ACALT
AC model : BRC4C158
file : DKN_BRC4C158
*/

const rootPath = require('app-root-path');
const IRUtils = require(rootPath + '/zigbee-coordinator/device-helpers/ir-blaster/ir-service/ir_utils');


const info = {
    "Brand": "Daikin",
    "Model": "BRC4C158",
    "Protocol": "DAIKIN176ACALT",
    "version": 1,
    "filename": "DKN_BRC4C158",
    "device": "AC",
};


const tempOptions = [
    0x70,	//16
    0x08,	//17
    0x48,	//18
    0x28,	//19
    0x68,	//20
    0x18,	//21
    0x58,	//22
    0x38,	//23
    0x78,	//24
    0x04,	//25
    0x44,	//26
    0x24,	//27
    0x64,	//28
    0x14,	//29
    0x54,	//30
    0x34,	//31
    0x74];  //32

const tempAuto = 0x03;


const fanOptions = {
    "low": 0x08,
    "medium": 0x0C,
    "high": 0x0A,
};

const swingOptions = {
    "vertical": {},
    "horizontal": {},
};


//6th byte - mode
const modeOptions = {
    "cool": {
        "mode": [0x0A, 0x04],
        "temp": null,  //21
        "fan": null   //high
    },
    "dry": {
        "mode": [0x00, 0x0E],
        "temp": 0x08,  //temp AUTo
        "fan": null   //auto
    },
    "fan": {
        "mode": [0x02, 0x00],
        "temp": 0x08,
        "fan": null
    },
    "auto": {
        "mode": [0x0A, 0x0C],
        "temp": 0x58,
        "fan": null
    },
    "heat": {
        "mode": [0x0A, 0x08],
        "temp": null,
        "fan": null
    }
};

const updateTypesAvailable = ["ONOF", "MODE"];
const sceneTypesAvailable = ["ONOF"];




class IREncoder {


    static getEncodedByteArray(irInfo) 
    {

    	var irData = [];

    	console.log('\n Incoming data \n')
    	console.log(irInfo);

    	var 
    		temp = irInfo.temperature ? (irInfo.temperature-16) : 8,
    		fan	= irInfo.fan ? irInfo.fan : "auto",
    		power = irInfo.power ? 1 :0,
    		swing_v = irInfo.swing.vertical ? irInfo.swing.vertical : "off",
    		swing_h = irInfo.swing.horizontal ? irInfo.swing.horizontal : "off",
    		mode = irInfo.mode ? irInfo.mode : "cool",
    		special = irInfo.special ? 1 :0,
    		type = irInfo.updateType  ? irInfo.updateType : [],
    		configId = irInfo.configId  ? irInfo.configId : [],   		
    		noOfSignal = irInfo.no_of_signal ? irInfo.no_of_signal : 1,

    		i=0, j = 0, x = 0,
    		checkSum = 0;

    	if(noOfSignal > 0)
    	{
    		//no of signals
    		irData[i] = noOfSignal;
			i++;
    	}	

    	while(j < noOfSignal)	
    	{
    		
    			//config Id
    			irData[i] = configId;
				i++;

				//pos of length
				x = i;
				i++;

				console.log('x');
				console.log(x);

	//1
			irData[i] = 0x88;
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
	
	//2		console.log(checkSum);
			irData[i] = 0x5B;
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
	
	//3		console.log(checkSum);
			irData[i] = 0xE8;
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
	
	//4		console.log(checkSum);
			irData[i] = 0x18;
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
	
	//5		console.log(checkSum);
			irData[i] = 0x00;
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
	
	//		console.log(checkSum);
	//6
			irData[i] = 0xC0 | (modeOptions[mode]["mode"][0]);
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
	
	//7
			irData[i] = type[j] == "MODE" ? 0x20 : 0x00;
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
	
	//8		console.log(checkSum);
			irData[i] = modeOptions[mode]["mode"][1] | (power<<7); 
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
	
	//9 
			irData[i] = 0x00; 
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
	
	//10
			irData[i] = 0x00; 
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
	
	//11
			irData[i] = modeOptions[mode]["temp"] ? modeOptions[mode]["temp"] : tempOptions[temp];
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
	
	//12
			irData[i] = 0x60 | (modeOptions[mode]["fan"] ? modeOptions[mode]["fan"] : fanOptions[fan]); 
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;	
			
	//13
			irData[i] = 0x00;
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
	
	//14
			irData[i] = 0x04 ;
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
	
	
	
			checkSum = checkSum%256;
	
	//		console.log(checkSum);
			irData[i] = IRUtils.binaryReverse({number: checkSum, pow : 8});				
			i++;
	
			irData[x] = i-x-1;
					
			j++;

		}		

 		console.log('\n Formed data');
 		var stringer = "[";
		irData.forEach(function(element){
    		stringer += ('0x' +element.toString(16) + ", ");
		});
		stringer += "]";
		console.log(stringer);

		return irData;


	}

    //Daikin

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
            irInfo.updateType = ["ONOF"];
        }

        irInfo.no_of_signal = 1;

        if (configId) {
            return this.getEncodedByteArray(irInfo);
        }

        //return
    }

    static getConfigInfo() {
        return {
            configData: [29300, 5000, 2140, 365, 692, 365, 1750, 365, 33000],
            configFrame: [0x43, 0x07, 0x88, 0x5B, 0xE8, 0x18, 0x20, 0x00, 0x78, 0x53]
        }
    }


    static getTempLevels() {
        return {
            "low": 16,
            "high": 32
        };
    }

    static getFanLevels() {
        return Object.keys(fanOptions);
    }

    static getSwingLevels() {
        return {
			horizontal : Object.keys(swingOptions.horizontal)  ,
			vertical : Object.keys(swingOptions.vertical)
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

/*
v1.0
Encoder files for Mitsubishi AC
Protocol : MITSUBISHI228AC 
AC model : SG15A_0289
file : MTSBSH_SG15A_0289
*/


const rootPath = require('app-root-path');
const IRUtils = require(rootPath + '/zigbee-coordinator/device-helpers/ir-blaster/ir-service/ir_utils');


const info = {
	"Brand"		: "Mitsubishi",  
	"Model"  	: "SG15A_0289",
	"Protocol"  : "MITSUBISHI228AC",
	"version"	: 1,
	"filename"	: "MTSBSH_SG15A_0289",
	"device"	: "AC",
};

//8
const tempOptions = [
	0x00,	//16
	0x80,	//17
	0x40,	//18
	0xC0,	//19
	0x20,	//20
	0xA0,	//21
	0x60,	//22
	0xE0,	//23
	0x10,	//24
	0x90,	//25
	0x50,	//26
	0xD0,	//27
	0x30,	//28
	0xB0,	//29
	0x70,	//30
	0xF0	//31
];
					 
					 
//10				
const fanOptions = {	
	"off"		: 0xA0, 
	"low"  		: 0x80,
	"medium"  	: 0x40,
	"high"		: 0x20,
	"auto"		: 0x00  
};



//9/10
const swingOptions = {
	"vertical" 	: {			
		"off" 	: 0x02,
		"auto"	: 0x1E
	},
	"horizontal": {			
		"off" 	: 0x0C,
		"auto"	: 0x03
	},
};	

//7/8/9
const modeOptions = {		
	"cool"	: {
		"mode" : [0x18, 0x60],
		"temp" : null, 
		"fan"  : null
	},

	"dry"	: {
		"mode" : [0x08, 0x40],
		"temp" : 0x10,  //24
		"fan"  : null   //auto
	},
	"auto"	: {
		"mode" : [0x00, 0x60],
		"temp" : 0x10, //t auto
		"fan"  : null 
	},
	"fan"	: {
		"mode" : [0x1C, 0x00],
		"temp" : 0x10,  //24
		"fan"  : null   
	}
};

//power

const updateTypesAvailable = ["ONOF"] ;
const sceneTypesAvailable = ["ONOF"];					

class IREncoder {
	
//Mitsubishi AC 
// Codes make sense when seen as LSB8


	static getEncodedByteArray(irInfo) {

		var irData = [];
	
	    console.log('\n Incoming data \n')
	    console.log(irInfo);
	
	    var 
	    	temp = irInfo.temperature ? (irInfo.temperature-16): 6,
	    	fan	= irInfo.fan ? irInfo.fan : "auto",
	    	power = irInfo.power ? 1 :0,
	    	swing_v = irInfo.swing.vertical ? irInfo.swing.vertical : "off",
	    	swing_h = irInfo.swing.horizontal ? irInfo.swing.horizontal : "off",
	    	mode = irInfo.mode ? irInfo.mode : "cool",
	    	special = irInfo.special ? 1 :0,
	    	type = irInfo.updateType  ? irInfo.updateType : [],
	    	configId = irInfo.configId  ? irInfo.configId : [],   		
	    	noOfSignal = irInfo.no_of_signal ? irInfo.no_of_signal : 1,
	
	    	i=0, j = 0, x = 0, dummy =0,
	    	checkSum = 0;
	
	
	    if(noOfSignal > 0) {
	    	//no of signals
	    	irData[i] = noOfSignal;
			i++;
	    }	
	
	    while(j < noOfSignal) {
	
	    	//config Id
	    	irData[i] = configId;
			i++;
	
			//pos of length
			x = i;
			i++;
	
			checkSum = 0;
	
			console.log('x');
			console.log(x);
			//1
			irData[i] = 0xC4;
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
			//2
			irData[i] = 0xD3;
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
			//3
			irData[i] = 0x64;
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
			//4
			irData[i] = 0x80;
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
			//5
			irData[i] = 0x00;
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
			//6
			irData[i] = (power<<2); 
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
			//7
			irData[i] = modeOptions[mode]["mode"][0];     
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
			//8
            //irData[i] = tempOptions[temp];
            irData[i] = modeOptions[mode]["temp"] ? modeOptions[mode]["temp"] : tempOptions[temp];
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
			//9
			irData[i] = modeOptions[mode]["mode"][1] | swingOptions["horizontal"][swing_h];
			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
			//10
			irData[i] = swingOptions["vertical"][swing_v] | fanOptions[fan] ;						
			
			//special case for temp 16 and 31

			if (((temp == 0) || (temp == 15)) && (mode == 'cool' || mode == 'auto') && swing_v == 'off' && swing_h == 'off' && fan == 'auto') {
				irData[i] -= 0x01;
			}

			checkSum += IRUtils.binaryReverse({ number : irData[i], pow: 8});
			i++;
			//11
			irData[i++] = 0x00;
			//12
			irData[i++] = 0x00;
			//13
			irData[i++] = 0x00;
			//14
			irData[i++] = 0x00;
			//15
			irData[i++] = 0x00;
			//16
			irData[i++] = 0x00;
			//17
			irData[i++] = 0x00;
			//18
			checkSum = checkSum%256;
			irData[i++] = IRUtils.binaryReverse({number: checkSum, pow : 8});
	
			irData[x] = i-x-1;
					
			j++;

	}		

 	console.log('\n Formed data');
 	var stringer = "[";
	irData.forEach(function(element){
    	stringer += ('0x' +(element < 0x10 ? ('0'+element.toString(16)) : element.toString(16)).toUpperCase() + ", ");
	});
	stringer += "]";
	console.log(stringer);

	return irData;

	}

	static getSceneArray(irInfo) 
	{
	
		var configId = irInfo.configId  ? irInfo.configId : 0;
	
		if(irInfo.power)
		{
			irInfo.updateType = sceneTypesAvailable; 
			irInfo.no_of_signal = sceneTypesAvailable.length;
		}
		else 
		{
			irInfo.updateType = ["ONOF"]; 
			irInfo.no_of_signal = 1;
		}
	
	
		if(configId)
		{
			return this.getEncodedByteArray(irInfo);
		}
	
		//return [];
	}
	
	static getSignalArray(irInfo) 
	{
		var	configId = irInfo.configId  ? irInfo.configId : 0;
	
		if(updateTypesAvailable.indexOf(irInfo.updateType[0]) < 0)
		{
			irInfo.updateType = ["ONOF"]; 
		}
		
		irInfo.no_of_signal = 1;
	
		if(configId)
		{
			return this.getEncodedByteArray(irInfo);
		}
	
		//return
	}
	
	static getConfigInfo()
	{
		return {
			configData : [11300,3370,1650,430, 380, 430,1200, 430, 38000],
		 	configFrame : [0x53, 0x53]
		}
	}

	static getTempLevels()
	{
		return {"low" : 16,
				"high" : 31};
		
	}

	static getFanLevels()
	{ 
		return Object.keys(fanOptions);
	}

	static getSwingLevels()
	{
		return {
			horizontal : Object.keys(swingOptions.horizontal)  ,
			vertical : Object.keys(swingOptions.vertical) 
		}
	}

	static getModes()
	{
		return Object.keys(modeOptions);
	}

	static getInfo()
	{
		return info;
	}


}

module.exports = IREncoder;

// // IR utility methods


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
// 	configId: 1,
// 	temperature: 16,
// 	fan: 'auto',
// 	power: 1,
// 	swing: { "vertical" : "off", "horizontal" : "off"},
// 	mode: "auto",
// 	updateType: ["TEMP"]
// });

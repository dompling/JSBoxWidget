const getChartConfig = (data, color, value, fontColor) => {
  const template1 = `
  {
    "type": "radialGauge",
    "data": {
      "datasets": [
        {
          "data": [${parseFloat(data[0])}],
          "borderWidth": 0,
          "backgroundColor": getGradientFillHelper('vertical', ${JSON.stringify(
            color[0],
          )}),
        }
      ]
    },
    "options": {
        centerPercentage: 86,
        rotation: Math.PI / 2,
        centerArea: {
          displayText: false,
        },
        options:{
            trackColor: '#f4f4f4',
        }
    }
  }
        `;
  const template2 = `
  {
    "type": "radialGauge",
    "data": {
      "datasets": [
        {
         "data": [${parseFloat(data[1])}],
          "borderWidth": 0,
          "backgroundColor": getGradientFillHelper('vertical', ${JSON.stringify(
            color[1],
          )}),
        }
      ]
    },
    "options": {
        layout: {
            padding: {
                left: 47,
                right: 47,
                top: 47,
                bottom: 47
            }
        },
        options:{
            trackColor: '#f4f4f4',
        },
        centerPercentage: 80,
        rotation: Math.PI / 2,
        centerArea: {
          displayText: false,
        }
    }
  }
        `;
  const template3 = `
  {
    "type": "radialGauge",
    "data": {
      "datasets": [
        {
          "data": [${parseFloat(data[2])}],
          "borderWidth": 0,
          "backgroundColor": getGradientFillHelper('vertical', ${JSON.stringify(
            color[2],
          )}),
        }
      ]
    },
    "options": {
        layout: {
            padding: {
                left: 94,
                right: 94,
                top: 94,
                bottom: 94
            }
        },
        options:{
            trackColor: '#f4f4f4',
        },
        centerPercentage: 70,
        rotation: Math.PI / 2,
        centerArea: {
          displayText: true,
          fontColor: '${fontColor}',
          fontSize: 20,
          text:(value)=>{
            return '${value}';
          }
        }
    }
  }
        `;
  return { template1, template2, template3 };
};

function getDaysInMonth(year, month) {
  month = parseInt(month, 10);
  var temp = new Date(year, month, 0);
  return temp.getDate();
}

module.exports = {
  getChartConfig,
  getDaysInMonth,
};

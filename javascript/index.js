document.getElementById('date').innerHTML = new Date().toDateString();

// plot the main panel (warming response)


Plotly.d3.csv('https://raw.githubusercontent.com/stujen/SPMFigure_webpage/master/data/temps.csv', function (err, data) {
  // Create a lookup table to sort and regroup the columns of data,
  // first by scenario, then by percentile:
  var lookup = {};
  function getData(scenario, percentile) {
    var byScen, trace;
    if (!(byScen = lookup[scenario])) {;
      byScen = lookup[scenario] = {};
    }
     // If a container for this scenario + percentile doesn't exist yet,
     // then create one:
    if (!(trace = byScen[percentile])) {
      trace = byScen[[percentile]] = {
        x: [],
        y: [],
        id: [],
        text: [],
        // color_val: [],
        marker: {color: 'rbg(100,100,100)'}
      };
    }
    return trace;
  }

  // Go through each row, get the right trace, and append the data:
  for (var i = 0; i < data.length; i++) {
    var datum = data[i];
    var trace = getData(datum.scenario, datum.percentile);
    trace.text.push(datum.scenario);
    trace.id.push(datum.scenario);
    trace.x.push(datum.year);
    trace.y.push(datum.temperature);
    // trace.color_val.push(datum.color_val)
    trace.marker.color = datum.color_val;
    // trace.marker.size.push(datum.pop);
  }

  // Get the group names:
  var scens = Object.keys(lookup);
  // In this case, every year includes every percentile, so we
  // can just infer the percentiles from the *first* year:
  var firstScen = lookup[scens[0]];
  var percentiles = Object.keys(firstScen);

  // Create the main traces, one for each percentile:
  var traces = [];
  for (i = 0; i < percentiles.length; i++) {
    var data = firstScen[percentiles[i]];
     // One small note. We're creating a single trace here, to which
     // the frames will pass data for the different years. It's
     // subtle, but to avoid data reference problems, we'll slice 
     // the arrays to ensure we never write any new data into our
     // lookup table:
    traces.push({
      name: percentiles[i],
      x: data.x.slice(),
      y: data.y.slice(),
      id: data.id.slice(),
      text: data.text.slice(),
      mode: 'lines',
      marker: {
        color: data.marker.color.slice(),
        // size: data.marker.size.slice(),
        // sizemode: 'area',
        // sizeref: 200000
      }
    });
  }

  // Create a frame for each year. Frames are effectively just
  // traces, except they don't need to contain the *full* trace
  // definition (for example, appearance). The frames just need
  // the parts the traces that change (here, the data).
  var frames = [];
  for (i = 0; i < scens.length; i++) {
    frames.push({
      name: scens[i],
      data: percentiles.map(function (percentile) {
        return getData(scens[i], percentile);
      })
    })
  }
    
  // Now create slider steps, one for each frame. The slider
  // executes a plotly.js API command (here, Plotly.animate).
  // In this example, we'll animate to one of the named frames
  // created in the above loop.
  var sliderSteps = [];
  for (i = 0; i < scens.length; i++) {
    sliderSteps.push({
      method: 'animate',
      label: scens[i],
      args: [[scens[i]], {
        mode: 'immediate',
        transition: {duration: 1000},
        frame: {duration: 1000, redraw: false},
      }]
    });
  }
  
  var layout = {
    xaxis: {
      title: 'Year',
      range: [1960, 2100]
    },
    yaxis: {
      title: 'Temperature',
      range: [0.0, 2.05]
    },
    hovermode: 'closest',
     // We'll use updatemenus (whose functionality includes menus as
     // well as buttons) to create a play button and a pause button.
     // The play button works by passing `null`, which indicates that
     // Plotly should animate all frames. The pause button works by
     // passing `[null]`, which indicates we'd like to interrupt any
     // currently running animations with a new list of frames. Here
     // The new list of frames is empty, so it halts the animation.
    updatemenus: [{
      x: 0,
      y: 0,
      yanchor: 'top',
      xanchor: 'left',
      showactive: false,
      direction: 'left',
      type: 'buttons',
      pad: {t: 87, r: 10},
      buttons: [{
        method: 'animate',
        args: [null, {
          mode: 'immediate',
          fromcurrent: true,
          transition: {duration: 1000},
          frame: {duration: 1000, redraw: false}
        }],
        label: 'Play'
      }, {
        method: 'animate',
        args: [[null], {
          mode: 'immediate',
          transition: {duration: 0},
          frame: {duration: 0, redraw: false}
        }],
        label: 'Pause'
      }]
    }],
     // Finally, add the slider and use `pad` to position it
     // nicely next to the buttons.
    sliders: [{
      pad: {l: 130, t: 55},
      currentvalue: {
        visible: true,
        prefix: 'Scenario:',
        xanchor: 'right',
        font: {size: 20, color: '#666'}
      },
      steps: sliderSteps
    }]
  };
  
  // Create the plot:
  Plotly.plot('panel_a_div', {
    data: traces,
    layout: layout,
     config: {showSendToCloud:false},
    frames: frames,
    margin: { t: 20, b: 40, l: 40, r: 20},
  });
});


// test panel a with GDP vs life expectancy data

// Plotly.d3.csv('https://raw.githubusercontent.com/stujen/SPMFigure_webpage/master/data/gapminderDataFiveYear.csv', function (err, data) {
//   // Create a lookup table to sort and regroup the columns of data,
//   // first by year, then by continent:
//   var lookup = {};
//   function getData(year, continent) {
//     var byYear, trace;
//     if (!(byYear = lookup[year])) {;
//       byYear = lookup[year] = {};
//     }
//      // If a container for this year + continent doesn't exist yet,
//      // then create one:
//     if (!(trace = byYear[continent])) {
//       trace = byYear[continent] = {
//         x: [],
//         y: [],
//         id: [],
//         text: [],
//         marker: {size: []}
//       };
//     }
//     return trace;
//   }

//   // Go through each row, get the right trace, and append the data:
//   for (var i = 0; i < data.length; i++) {
//     var datum = data[i];
//     var trace = getData(datum.year, datum.continent);
//     trace.text.push(datum.country);
//     trace.id.push(datum.country);
//     trace.x.push(datum.lifeExp);
//     trace.y.push(datum.gdpPercap);
//     trace.marker.size.push(datum.pop);
//   }

//   // Get the group names:
//   var years = Object.keys(lookup);
//   // In this case, every year includes every continent, so we
//   // can just infer the continents from the *first* year:
//   var firstYear = lookup[years[0]];
//   var continents = Object.keys(firstYear);

//   // Create the main traces, one for each continent:
//   var traces = [];
//   for (i = 0; i < continents.length; i++) {
//     var data = firstYear[continents[i]];
//      // One small note. We're creating a single trace here, to which
//      // the frames will pass data for the different years. It's
//      // subtle, but to avoid data reference problems, we'll slice 
//      // the arrays to ensure we never write any new data into our
//      // lookup table:
//     traces.push({
//       name: continents[i],
//       x: data.x.slice(),
//       y: data.y.slice(),
//       id: data.id.slice(),
//       text: data.text.slice(),
//       mode: 'markers',
//       marker: {
//         size: data.marker.size.slice(),
//         sizemode: 'area',
//         sizeref: 200000
//       }
//     });
//   }

//   // Create a frame for each year. Frames are effectively just
//   // traces, except they don't need to contain the *full* trace
//   // definition (for example, appearance). The frames just need
//   // the parts the traces that change (here, the data).
//   var frames = [];
//   for (i = 0; i < years.length; i++) {
//     frames.push({
//       name: years[i],
//       data: continents.map(function (continent) {
//         return getData(years[i], continent);
//       })
//     })
//   }
    
//   // Now create slider steps, one for each frame. The slider
//   // executes a plotly.js API command (here, Plotly.animate).
//   // In this example, we'll animate to one of the named frames
//   // created in the above loop.
//   var sliderSteps = [];
//   for (i = 0; i < years.length; i++) {
//     sliderSteps.push({
//       method: 'animate',
//       label: years[i],
//       args: [[years[i]], {
//         mode: 'immediate',
//         transition: {duration: 300},
//         frame: {duration: 300, redraw: false},
//       }]
//     });
//   }
  
//   var layout = {
//     xaxis: {
//       title: 'Life Expectancy',
//       range: [30, 85]
//     },
//     yaxis: {
//       title: 'GDP per Capita',
//       type: 'log'
//     },
//     hovermode: 'closest',
//      // We'll use updatemenus (whose functionality includes menus as
//      // well as buttons) to create a play button and a pause button.
//      // The play button works by passing `null`, which indicates that
//      // Plotly should animate all frames. The pause button works by
//      // passing `[null]`, which indicates we'd like to interrupt any
//      // currently running animations with a new list of frames. Here
//      // The new list of frames is empty, so it halts the animation.
//     updatemenus: [{
//       x: 0,
//       y: 0,
//       yanchor: 'top',
//       xanchor: 'left',
//       showactive: false,
//       direction: 'left',
//       type: 'buttons',
//       pad: {t: 87, r: 10},
//       buttons: [{
//         method: 'animate',
//         args: [null, {
//           mode: 'immediate',
//           fromcurrent: true,
//           transition: {duration: 300},
//           frame: {duration: 500, redraw: false}
//         }],
//         label: 'Play'
//       }, {
//         method: 'animate',
//         args: [[null], {
//           mode: 'immediate',
//           transition: {duration: 0},
//           frame: {duration: 0, redraw: false}
//         }],
//         label: 'Pause'
//       }]
//     }],
//      // Finally, add the slider and use `pad` to position it
//      // nicely next to the buttons.
//     sliders: [{
//       pad: {l: 130, t: 55},
//       currentvalue: {
//         visible: true,
//         prefix: 'Year:',
//         xanchor: 'right',
//         font: {size: 20, color: '#666'}
//       },
//       steps: sliderSteps
//     }]
//   };
  
//   // Create the plot:
//   Plotly.plot('panel_a_div', {
//     data: traces,
//     layout: layout,
//      config: {showSendToCloud:true},
//     frames: frames,
//     margin: { t: 20, b: 40, l: 40, r: 20},
//   });
// });



// plot the annual co2 emissions panel
panel_b = document.getElementById('panel_b_div');
Plotly.plot( panel_b, [{
x: [1, 2, 3, 4, 5],
y: [1, 2, 4, 8, 16] }], {
margin: { t: 20, b: 40, l: 40, r: 20} } );

// plot the cumulative co2 emissions panel
panel_c = document.getElementById('panel_c_div');
Plotly.plot( panel_c, [{
x: [1, 2, 3, 4, 5],
y: [1, 2, 4, 8, 16] }], {
margin: { t: 20, b: 40, l: 40, r: 20} } );

// plot the non-CO2 RF panel
panel_d = document.getElementById('panel_d_div');
Plotly.plot( panel_d, [{
x: [1, 2, 3, 4, 5],
y: [1, 2, 4, 8, 16] }], {
margin: { t: 20, b: 40, l: 40, r: 20} } );


$.extend( $.ui.slider.prototype.options, { 
    animate: 300
});

$("#flat-slider")
    .slider({
        max: 50,
        min: 0,
        range: true,
        values: [15, 35]
    })
    .slider("pips", {
        first: "pip",
        last: "pip"
    });

$("#flat-slider-vertical-1")
    .slider({
        max: 25,
        min: 0,
        range: "min",
        value: 25,
        orientation: "vertical"
    });

    $("#flat-slider-vertical-2")
    .slider({
        max: 25,
        min: 0,
        range: "max",
        value: 12,
        orientation: "vertical"
    });

$("#flat-slider-vertical-3")
    .slider({
        max: 25,
        min: 0,
        range: "min",
        value: 0,
        orientation: "vertical"
    });

    $("#flat-slider-vertical-1, #flat-slider-vertical-2, #flat-slider-vertical-3")
    .slider("pips", {
        first: "pip",
        last: "pip"
    })
    .slider("float");
var chartRT = function () {
    var _self = this;

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
    };

    function guid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
    }

    _self.guid = guid();
    _self.DataSeries = [];
    _self.Ticks = 20;
    _self.TickDuration = 1000; //1 Sec
    _self.MaxValue = 100;
    _self.w = 800;
    _self.h = 400;
    _self.margin = { top: 50, right: 120, bottom: 60, left: 300 };
    _self.width = _self.w - _self.margin.left - _self.margin.right;
    _self.height = _self.h - _self.margin.top - _self.margin.bottom;
    _self.xText = '';
    _self.yText = '';
    _self.titleText = '';
    _self.chartSeries = {};

    _self.Init = function () {
        d3.select('#chart-' + _self.guid).remove();
        //
        // Back fill DataSeries with Ticks of 0 value data
    	//
		/*
        _self.fillDataSeries = function () {
            for (Series in _self.DataSeries) {
                while (_self.DataSeries[Series].Data.length < _self.Ticks +3) {
                    _self.DataSeries[Series].Data.push({ Value: 0 });
                }
            }
        }
		*/
        //_self.fillDataSeries();
        //
        //  SVG Canvas
        //
        _self.svg = d3.select("body").append("svg")
         .attr("id", 'chart-' + _self.guid)
        .attr("width", _self.w)
        .attr("height", _self.h)
      .append("g")
        .attr("transform", "translate(" + _self.margin.left + "," + _self.margin.top + ")");
        //
        //  Use Clipping to hide chart mechanics
        //
        _self.svg.append("defs").append("clipPath")
            .attr("id", "clip-" + _self.guid)
          .append("rect")
            .attr("width", _self.width)
            .attr("height", _self.height);
        //
        // Generate colors from DataSeries Names
        //
        _self.color = d3.scale.category10();
        _self.color.domain(_self.DataSeries.map(function (d) { return d.Name; }));
        //
        //  X,Y Scale
        //
        _self.xscale = d3.scale.linear().domain([0, _self.Ticks]).range([0, _self.width]);
        _self.yscale = d3.scale.linear().domain([0, _self.MaxValue]).range([_self.height, 0]);
        //
        //  X,Y Axis
        //
        _self.xAxis = d3.svg.axis()
        .scale(d3.scale.linear().domain([0, _self.Ticks]).range([_self.width, 0]))
        .orient("bottom");
        _self.yAxis = d3.svg.axis()
        .scale(_self.yscale)
        .orient("left");
        //
        //  Line/Area Chart
        //
        _self.line = d3.svg.line()
        .interpolate("basis")
        .x(function (d, i) { return _self.xscale(i-1); })
        .y(function (d) { return _self.yscale(d.Value); });
		//
        _self.area = d3.svg.area()
        .interpolate("basis")
        .x(function (d, i) { return _self.xscale(i-1); })
        .y0(_self.height)
        .y1(function (d) { return _self.yscale(d.Value); });
        //
        //  Title 
        //
        _self.Title = _self.svg.append("text")
          .attr("id", "title-" + _self.guid)
          .style("text-anchor", "middle")
          .text(_self.titleText)
          .attr("transform", function (d, i) { return "translate(" + _self.width / 2 + "," + -10 + ")"; });
        //
        //  X axis text
        //
        _self.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + _self.yscale(0) + ")")
        .call(_self.xAxis)
       .append("text")
           .attr("id", "xName-" + _self.guid)
          .attr("x", _self.width / 2)
          .attr("dy", "3em")
          .style("text-anchor", "middle")
          .text(_self.xText);
        //
        // Y axis text
        //
        _self.svg.append("g")
        .attr("class", "y axis")
        .call(_self.yAxis)
      .append("text")
           .attr("id", "yName-" + _self.guid)
          .attr("transform", "rotate(-90)")
          .attr("y", 0)
          .attr("x", -_self.height / 2)
          .attr("dy", "-3em")
          .style("text-anchor", "middle")
          .text(_self.yText);
        //
        // Vertical grid lines
        //
        _self.svg.selectAll(".vline").data(d3.range(_self.Ticks)).enter()
			.append("line")
			.attr("x1", function (d) { return d * (_self.width / _self.Ticks); })
			.attr("x2", function (d) { return d * (_self.width / _self.Ticks); })
			.attr("y1", function (d) { return 0; })
			.attr("y2", function (d) { return _self.height; })
			.style("stroke", "#eee")
			.style("opacity", .5)
			.attr("clip-path", "url(#clip-" + _self.guid + ")")
			.attr("transform", "translate(" + (_self.width / _self.Ticks) + "," + 0 + ")");
        //
        // Horizontal grid lines
        //
        _self.svg.selectAll(".hline").data(d3.range(_self.Ticks)).enter()
			.append("line")
			.attr("x1", function (d) { return 0; })
			.attr("x2", function (d) { return _self.width; })
			.attr("y1", function (d) { return d * (_self.height / (_self.MaxValue / 10)); })
			.attr("y2", function (d) { return d * (_self.height / (_self.MaxValue / 10)); })
			.style("stroke", "#eee")
			.style("opacity", .5)
			.attr("clip-path", "url(#clip-" + _self.guid + ")")
			.attr("transform", "translate(" + 0 + "," + 0 + ")");
        //
        //  Bind DataSeries to chart
        //
        _self.Series = _self.svg.selectAll(".Series")
			.data(_self.DataSeries)
			.enter().append("g")
			.attr("clip-path", "url(#clip-" + _self.guid + ")")
			.attr("class", "Series");
        //
        //  Draw path from Series Data Points
        //
        _self.path = _self.Series.append("path")
			.attr("class", "area")
			.attr("d", function (d) { return _self.area(d.Data); })
			.style("fill", function (d) { return _self.color(d.Name); })
			.style("fill-opacity", .25)
			.style("stroke", function (d) { return _self.color(d.Name); });
        //
        //  Legend 
        //
        _self.Legend = _self.svg.selectAll(".Legend")
        .data(_self.DataSeries)
        .enter().append("g")
        .attr("class", "Legend");
        _self.Legend.append("circle")
            .attr("r", 4)
            .style("fill", function (d) { return _self.color(d.Name); })
            .style("fill-opacity", .5)
            .style("stroke", function (d) { return _self.color(d.Name); })
            .attr("transform", function (d, i) { return "translate(" + (_self.width + 6) + "," + (10 + (i * 20)) + ")"; });
        _self.Legend.append("text")
            .text(function (d) { return d.Name; })
            .attr("dx", "0.5em")
            .attr("dy", "0.25em")
            .style("text-anchor", "start")
            .attr("transform", function (d, i) { return "translate(" + (_self.width + 6) + "," + (10 + (i * 20)) + ")"; });

        _self.tick = function (id) {
            _self.thisTick = new Date();
            var elapsed = parseInt(_self.thisTick - _self.lastTick);
            var elapsedTotal = parseInt(_self.lastTick - _self.firstTick);
            if (elapsed < 900 && elapsedTotal > 0) {
                _self.lastTick = _self.thisTick;
                return;
            }
            if (id < _self.DataSeries.length - 1 && elapsedTotal > 0) {
                return;
            }
            _self.lastTick = _self.thisTick;
            //console.log(_self.guid, id, _self.DataSeries[id]);
            //var DataUpdate = [{ Value: (elapsed - 1000) }, { Value: Math.random() * 10 }, { Value: Math.random() * 10 }, { Value: Math.random() * 10}];



            //Add new values
            for (i in _self.DataSeries) {
            	_self.DataSeries[i].Data.push({ Value: _self.chartSeries[_self.DataSeries[i].Name] });
			//Backfill missing values
            	while (_self.DataSeries[i].Data.length -1<_self.Ticks+3 ) {
            		_self.DataSeries[i].Data.unshift({ Value: 0 })
            	}
            }

            d3.select("#yName-" + _self.guid).text(_self.yText);
            d3.select("#xName-" + _self.guid).text(_self.xText);
            d3.select("#title-" + _self.guid).text(_self.titleText);

            _self.path
                .attr("d", function (d) { return _self.area(d.Data); })
                .attr("transform", null)
                .transition()
                .duration(_self.TickDuration)
                .ease("linear")
                .attr("transform", "translate(" + _self.xscale(-1) + ",0)")
                .each("end", function (d, i) { _self.tick(i); });

        	//Remove oldest values
            for (i in _self.DataSeries) {
            	_self.DataSeries[i].Data.shift();
            }



        }
        _self.firstTick = new Date();
        _self.lastTick = new Date();
        _self.start = function () {
            _self.firstTick = new Date();
            _self.lastTick = new Date();
            _self.tick(0);

        }
        _self.start();
    }
    _self.addSeries = function (SeriesName) {
        _self.chartSeries[SeriesName] = 0;
        _self.DataSeries.push({ Name: SeriesName, Data: [{ Value: 0}] });
        _self.Init();
    }
}
//
//
//
//    Real Time Chart Example
//
//
//
//
//
    var chart = new chartRT();
    chart.xText = "Seconds";
    chart.yText = "Value";
    chart.titleText = "Random ODD Series";
    chart.Ticks = 60;
    chart.Init();

    var chart2 = new chartRT();
    chart2.xText = "Seconds";
    chart2.yText = "Value";
    chart2.titleText = "Random Even Series";
    chart2.Ticks = 60;
    chart2.TickDuration = 1000;
    chart2.MaxValue = 10000;
    chart2.Init();

    var eventNames = [];
    
    setInterval(generateRandomData2Chart, 3000);
    
    function generateRandomData2Chart(){
        var randomEvents = ['POPULARITY', 'CATEGORY', 'DELETE', 'PRICE', 'FULL_INDEX'];
        console.log("Genearating data");
        var randomNumber = parseInt((Math.random()*randomEvents.length)-1);
        console.log(randomNumber);
        var randomEventName=randomEvents[randomNumber];
        console.log(randomEventName);
        var randomEventCount=Math.random()*90+1;
        populate([{name:randomEventName, count: randomEventCount}]);
    }

    function populate(events){
        for (var i = events.length - 1; i >= 0; i--) {
            var event = events[i];
            if(eventNames.indexOf(event.name)<0){
                eventNames.push(event.name);
                chart.addSeries(event.name);      
                chart2.addSeries(event.name);      
            }
            chart.chartSeries[event.name]=event.count;
            chart2.chartSeries[event.name]=event.count;
        };  
    }


    
    // now.receiveMessage = function(events){
    //     console.log(events);
    //     for (var i = events.length - 1; i >= 0; i--) {
    //         var event = events[i];
    //         if(eventNames.indexOf(event.name)<0){
    //             eventNames.push(event.name);
    //             chart.addSeries(event.name);      
    //             chart2.addSeries(event.name);      
    //         }
    //         chart.chartSeries[event.name]=event.count;
    //         chart2.chartSeries[event.name]=event.count;
    //     };  
    // };
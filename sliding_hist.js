function sliding_hist() {
  var chartWidth     = 960, // default width
      chartHeight    = 500, // default height
      binWidth  = 10,
      stepWidth = 1;

    //Need last element of array later, neater to define logic here.
    Array.prototype.last = function() {
      return this[this.length-1];
    }

    //takes your data, bin width and how much the bin slides over each step and
    //returns an array of objects containing the "center" of the bin and the number
    //of elements that fell in it ("in_bin").
    function generate_slide_hist(data, binWidth, stepSize){
        var binHalf = binWidth/2;

        //Find the range of the data so we can know which window to slide overlay
        var data_range = d3.extent(data)

        //generate an array of the bin centers we are going to use in our sliding interval.
        var bin_centers = [data_range[0] ]
        while(bin_centers.last() < data_range[1]) bin_centers.push(bin_centers.last() + stepSize)

        //Run through the bin centers counting how many are within the bin width of the value.
        var counts = []
        bin_centers.forEach(function(center){
            var points_in_bin = data.filter(function(val){return val > (center - binHalf) &&  val < (center + binHalf) })
            counts.push({"center": center, "in_bin": points_in_bin.length})
        })

      return counts;
    }

  function chart(selection) {
      selection.each(function(data){

          //make into the correct form.
          var hist_data = generate_slide_hist(data,binWidth,stepWidth);

          var margin = {top: 20, right: 20, bottom: 30, left: 50},
              width  = chartWidth - margin.left - margin.right,
              height = chartHeight - margin.top - margin.bottom;

          var x = d3.scaleLinear()
              .range([0, width])
              .domain(d3.extent(data));

          var y = d3.scaleLinear()
              .range([height, 0])
              .domain([0,d3.max(hist_data, function(d) { return d.in_bin; })]);

          var line = d3.line()
              .x(function(d) { return x(d.center); })
              .y(function(d) { return y(d.in_bin); });

          var svg = d3.select(this).append("svg")
              .attr("width",  width  + margin.left + margin.right)
              .attr("height", height + margin.top  + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          svg.append("path")
            .datum(hist_data)
            .attr("class", "line")
            .attr("d", line);

          svg.append("g")
              .attr("class", "axis axis--x")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x));

          svg.append("g")
              .attr("class", "axis axis--y")
              .call(d3.axisLeft(y))
              .append("text")
                  .attr("class", "axis-title")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 6)
                  .attr("dy", ".71em")
                  .style("text-anchor", "end")
                  .text("# in x +- binwidth/2");
      })

    }
    chart.binWidth = function(value) {
        if (!arguments.length) return binWidth;
        binWidth = value;
        return chart;
    };

    chart.stepWidth = function(value) {
        if (!arguments.length) return stepWidth;
        stepWidth = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return chartHeight;
        chartHeight = value;
        return chart;
    };

    chart.width = function(value) {
        if (!arguments.length) return chartWidth;
        chartWidth = value;
        return chart;
    };

    return chart;
}

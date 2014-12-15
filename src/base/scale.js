// opts looks like {scale: {}, 
              // axis: {}, 
              // type: <"linear", "ordinal", "time", etc... >,
              // orient: "",
              // position: ""};
// for scales not x or y, axis will reflect 
// settings for the legend (maybe)
// all scales will get passed through "setScales"
// but opts will override defaults
function Scale(opts) {
  if(!(this instanceof Scale)){
    return new Scale(opts);
  }
  // allow setting of orient, position, scaleType, 
  // scale and axis settings, etc.
  var attributes = {
    aesthetic: null,
    domain: null,
    range: null,
    plot: null,
    scaleType: null, // linear, log, ordinal, time, category, 
    // maybe radial, etc.
    scale: null,
    rangeBands: [0.1, 0.1],
    opts: {},
    label: "",
    labelPosition: [0.5, 0.5],
    offset: 45,
  };
  // store passed object
  this.attributes = attributes;
  var getSet = ["aesthetic", "plot", "opts",
                "rangeBands", "label", 'offset'];
  for(var attr in this.attributes){
    if(!this[attr] && _.contains(getSet, attr) ){
      this[attr] = createAccessor(attr);
    }
  }
  this._userOpts = {};
  if(!_.isUndefined(opts)){
    // opts may be updated by later functions
    // _userOpts stays fixed on initiation.
    this.attributes.opts = opts;
    this._userOpts = opts;
    this.scaleType(opts.type ? opts.type:null);
    this.offset(opts.offset ? opts.offset:attributes.offset);
  }
}

Scale.prototype.scaleType = function(scaleType) {
  if(!arguments.length) { return this.attributes.scaleType; }
  this.attributes.scaleType = scaleType;
  switch(scaleType) {
    case 'linear':
      this.attributes.scale = d3.scale.linear().nice();
      break;
    case 'log':
      this.attributes.scale = d3.scale.log().nice();
      break;
    case 'ordinal':
      this.attributes.scale = d3.scale.ordinal();
      break;
    case 'time':
      this.attributes.scale = d3.time.scale().nice();
      break;
    case 'date':
      this.attributes.scale = d3.time.scale().nice();
      break;
    case "category10":
      this.attributes.scale = d3.scale.category10();
      break;
    case "category20":
      this.attributes.scale = d3.scale.category20();
      break;
    case "category20b":
      this.attributes.scale = d3.scale.category20b();
      break;
    case "category20c":
      this.attributes.scale = d3.scale.category20c();
      break;
  }
  return this;
};

Scale.prototype.scale = function(settings){
  if(!arguments.length) { return this.attributes.scale; }
  for(var s in settings){
    if(this.attributes.scale.hasOwnProperty(s)){
      this.attributes.scale[s](settings[s]);
    }
  }
  return this;
};

Scale.prototype.range = function(range, rb) {
  if(!arguments.length) { return this.attributes.range; }
  if(this.scaleType() === "ordinal"){
    if(_.isUndefined(rb)) { 
      rb = this.rangeBands(); 
    }
    this.attributes.scale
        .rangeRoundBands(range, rb[0], rb[1]);
  } else {
    this.attributes.scale.range(range);
  }
  this.attributes.range = range;
  return this;
};

Scale.prototype.domain = function(domain) {
  if(!arguments.length) { return this.attributes.domain; }
  if(this.scaleType() ==="log"){
    if(!_.all(domain, function(d) { return d > 0;}) ){
      console.warn("domain must be greater than 0 for log scale." +
      " Scale " + this.aesthetic() + " has requested domain " +
      domain[0] + " - " + domain[1] + ". Setting lower " +
      "bound to 1. Try setting them manually." );
      domain[0] = 1;
    }
  }
  if(_.isNull(this.domain())){ 
    this.attributes.domain = domain; 
  } else {
    var d = this.attributes.domain;
    if(_.contains(linearScales, this.scaleType())){
      if(domain[0] < d[0]) { this.attributes.domain[0] = domain[0];}
      if(domain[1] > d[1]) { this.attributes.domain[1] = domain[1];}
    } else {
      this.attributes.domain = _.unique(_.flatten([d, domain]));
    }
  }
  this.scale().domain(this.attributes.domain);
  return this;
};

Scale.prototype.axisLabel = function(o, l) {
  if(!arguments.length) { return this.attributes.label; }
  // o is the label
  if(_.isString(o)){ 
    this.attributes.label = o; 
    return this;
  }
  if(o instanceof d3.selection){
    var pd = this.plot().plotDim(),
        tr, offset,
        r = 90;
    if(this.aesthetic() === "y"){
      offset = this.opts().axis.position === "left" ? -this.offset():this.offset();
      tr = "translate(" + offset + "," + pd.y + ")rotate(" + -r + ")";
    } else {
      offset = this.opts().axis.position === "top" ? -this.offset():this.offset();
      tr = "translate(0," + offset + ")";
    }
    // make the label
    var label = o.selectAll('.label').data([0]);
    label
      .attr('width', pd[this.aesthetic()])
      .attr('height', "20")
      .attr('transform', tr)
      .each(function() {
        d3.select(this).select('p').text(l);
      });
    label.enter().append('foreignObject')
      .attr('width', pd[this.aesthetic()])
      .attr('height', "20")
      .attr('transform', tr)
      .attr('class', 'label')
      .append('xhtml:body')
      .append('div')
      .append('p')
      .text(l);
  }
};

Scale.prototype.positionAxis = function() {
  var margins = this.plot().margins(),
      dim = this.plot().plotDim(),
      aes = this.aesthetic(),
      opts = this.opts().axis;
  if(aes === "x"){
    if(opts.position === "bottom"){
      return [margins.left, margins.top + dim.y];
    }
    if(opts.position === "top"){
      return [margins.left, margins.top];
    }
  }
  if(aes === "y") {
    if(opts.position === "left"){
      return [margins.left, margins.top];
    }
    if(opts.position === "right"){
      return [margins.left + dim.x, margins.top];
    }
  }
};

ggd3.scale = Scale;
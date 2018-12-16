const d3 = require('d3');
const $ = require('jquery');
const tippy = require('tippy.js');

const svg_text = d3.select('svg#text_line');
svg_text
    .attr('height',  '5000px')
    .attr('width', function () {
        return $(this).closest('main').width();
    });
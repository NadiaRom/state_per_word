const d3 = require('d3');
const $ = require('jquery');
const tippy = require('tippy.js');

const svg = d3.select('svg#text_line');

d3.json('states_data/file_index.json')
    .then(function (file_index) {
        d3.select('nav')
            .selectAll('button.sel_article')
            .data(file_index)
            .enter()
            .append('button')
            .classed('sel_article', true)
            .text(d => d.html_id)
            .attr('title', d => d.ra_title);

        $('nav').append(`<span id=selected_state></span>`);

        $('button.sel_article').first().addClass('active');

        const update_viz = function () {
            const active_doc = $('button.sel_article.active').text();
            $('main article span').remove();
            $('svg > *').remove();
            d3.json(`states_data/${active_doc}.json`)
                .then(function (data) {
                    data.states_per_word = data.states_per_word.slice(3);
                    var spans = d3.select('main article')
                        .selectAll('span')
                        .data(data.states_per_word)
                        .enter()
                        .append('span')
                        .text(d => d[0] + '  ');

                    svg
                        .attr('height',  function () {
                            return $(this).closest('article').height();
                        })
                        .attr('width', function () {
                            return $(this).closest('article').width();
                        });

                    let span_coords = [];
                    let svg_offset = $(svg.node()).offset();

                    span_coords = $('main article span')
                        .map(function (i) {
                            let $t = $(this);
                            return {...$t.offset(), width: $t.width(), height: $t.height(), i: i};
                        });
                    span_coords = d3.nest()
                        .key(d => d.top)
                        .entries(span_coords);

                    let w = +svg.attr('width'), h = +svg.attr('height');
                    let line_h = +span_coords[1].key - +span_coords[0].key;
                    let span_h = $('main article span').first().height();
                    const scale_h = d3.scaleLinear()
                        .range([line_h, 0])
                        .domain([-1, 1])
                        .clamp(true); // distribution of state weights

                    const line = d3.line()
                        .x(d => d.x)
                        .y(d => scale_h(d.y))
                        .curve(d3.curveStepBefore);

                    let lines = svg.selectAll('g.line')
                        .data(span_coords)
                        .enter()
                        .append('g')
                        .classed('line', true)
                        .attr('transform', d => `translate(0,${+d.key - svg_offset.top - line_h + span_h*1.5})`);

                    let activation_paths =  lines.selectAll('path')
                        .data(function (dat) {
                            let new_data = [];
                            for (let j = 1; j < 401; j++) {
                                new_data.push(
                                    dat.values.map(function (d) {
                                        return {
                                            'y': data.states_per_word[d.i][j],
                                            'x': d.left - svg_offset.left,
                                            'i': d.i,
                                            'j': j,
                                        }
                                    })
                                )
                            }
                            return new_data;
                        })
                        .enter()
                        .append('path')
                        .attr('class', (_, i) => `act${i}`)
                        .attr('d', line)
                        .on('click', function () {
                            let cl = $(this).attr('class');
                            $('svg path').removeClass('active');
                            $(`path.${cl}`).addClass('active');
                            $('#selected_state').text(cl.match(/[0-9]+/)[0])
                        });
                });
        };

        update_viz();

        $('button.sel_article').click(function () {
            $('button.sel_article').removeClass('active');
            $(this).addClass('active');
            update_viz();
        })
    });
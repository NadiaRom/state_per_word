const d3 = require('d3');
const $ = require('jquery');
const tippy = require('tippy.js');

const svg = d3.select('svg#text_line');

d3.json('ru_states_per_word.json')
    .then(function (data) {
        
        for (const k of Object.keys(data)) {
            data[k].states_per_word = data[k].states_per_word.slice(3);
        }
        
        d3.select('nav')
            .selectAll('button.sel_article')
            .data(Object.keys(data))
            .enter()
            .append('button')
            .classed('sel_article', true)
            .text((d) => d);

        $('nav').append(`<span id=selected_state></span>`);
        
        $('button.sel_article').first().addClass('active');

        let active_doc = $('button.sel_article.active').text();

        const draw_text = function () {
            $('main article span').remove();
            var spans = d3.select('main article')
                .selectAll('span')
                .data(data[active_doc].states_per_word)
                .enter()
                .append('span')
                .text(d => d[0] + '  ');
        };

        draw_text();
        svg
            .attr('height',  function () {
                return $(this).closest('article').height();
            })
            .attr('width', function () {
                return $(this).closest('article').width();
            });

        let span_coords = [];
        const draw_svg = function () {
            $('svg > *').remove();
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
                // .data(d => d.values.map(v => data[active_doc].states_per_word[v.i].slice(1)))
                .data(function (dat) {
                    let new_data = [];
                    for (let j = 1; j < 401; j++) {
                        new_data.push(
                            dat.values.map(function (d) {
                                return {
                                    'y': data[active_doc].states_per_word[d.i][j],
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
        };

        draw_svg();


        $('button.sel_article').click(function () {
            $('button.sel_article').removeClass('active');
            $(this).addClass('active');
            active_doc = $('button.sel_article.active').text();
            draw_text();

            svg
                .attr('height',  function () {
                    return $(this).closest('article').height();
                })
                .attr('width', function () {
                    return $(this).closest('article').width();
                });

            draw_svg();
        })
        
    });
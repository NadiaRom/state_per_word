const d3 = require('d3');
const $ = require('jquery');
const tippy = require('tippy.js');

const canvas = d3.select('canvas#text_line');

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
        
        $('button.sel_article').first().addClass('active');

        let active_doc = $('button.sel_article.active').text();

        const draw_text = function () {
            $('main article span').remove();
            var spans = d3.select('main article')
                .selectAll('span')
                .data(data[active_doc].states_per_word)
                .enter()
                .append('span')
                .text(d => d[0]);
        };

        draw_text();
        canvas
            .attr('height',  function () {
                return $(this).closest('article').height();
            })
            .attr('width', function () {
                return $(this).closest('article').width();
            });

        let span_coords = [];
        const draw_canvas = function () {
            let canvas_offset = $(canvas.node()).offset();
            span_coords = $('main article span')
                .map(function (i) {
                    let $t = $(this);
                    return {...$t.offset(), width: $t.width(), height: $t.height(), i: i};
                });
            span_coords = d3.nest()
                .key(d => d.top)
                .entries(span_coords);

            const context = canvas.node().getContext('2d');
            let cw = +canvas.attr('width'), ch = +canvas.attr('height');
            let line_h = +span_coords[1].key - +span_coords[0].key;
            const scale_h = d3.scaleLinear()
                .range([line_h, 0])
                .domain([-1, 1]); // distribution of state weights

            const line = d3.line()
                .x(d => d.x)
                .y(d => scale_h(d.y) + d.y_off)
                .curve(d3.curveStep)
                .context(context);

            span_coords.map(function(val) {
                let top_offset = +val.key - canvas_offset.top;
                // for (let i = 0; i < 400; i++) {
                //    
                // }
                let dat = [];
                val.values.map(function (d) {
                    dat.push({
                        x: d.left + d.width / 2 - canvas_offset.left,
                        y: +data[active_doc].states_per_word[d.i][1],
                        y_off: top_offset,
                    })
                });

                context.beginPath();
                line(dat);
                context.lineWidth = 1.5;
                context.strokeStyle = "steelblue";
                context.stroke();
            })
        };

        draw_canvas();


        $('button.sel_article').click(function () {
            $('button.sel_article').removeClass('active');
            $(this).addClass('active');
            active_doc = $('button.sel_article.active').text();
            draw_text();

            canvas
                .attr('height',  function () {
                    return $(this).closest('article').height();
                })
                .attr('width', function () {
                    return $(this).closest('article').width();
                });
        })
        
    });
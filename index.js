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

        let span_coords = {};
        const draw_canvas = function () {
            let article_offset = $('main article').offset();
            $('main article span').each(function () {
                debugger;
                $(this)
            })
        };


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
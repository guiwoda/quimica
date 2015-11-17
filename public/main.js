require.config({
    baseUrl: './',
    paths: {
        "c3": "vendor/c3/c3.min",
        "d3": "vendor/d3/d3.min"
    },
    shim: {
        "c3": {
            exports: "c3"
        },
        "d3": {
            exports: "d3"
        }
    },
    packages: [
        {
            name: 'physicsjs',
            location: 'vendor/PhysicsJS/dist',
            main: 'physicsjs-full.min'
        },
        {
            name: "tween",
            location: 'vendor/tween.js/src',
            main: "Tween"
        },
        {
            name: "pixi",
            location: 'vendor/pixi.js/bin',
            main: "pixi"
        },
        {
            name: "ractive",
            location: 'vendor/ractive',
            main: 'ractive'
        }
    ]
});


require(['physicsjs', 'pixi', 'ractive', 'c3'], function(Physics, PIXI, Ractive, c3){
    var collisions = 0,
        init = new Date();

    window.PIXI = PIXI;
    var ractive = new Ractive({
        el: document.getElementById('info'),
        template: '#infotable',
        data: {
            qty: 0,
            spd: 0,
            col: 0,
            vol: 0,
            presion: 0,
            temp: 0
        }
    });

    var chart = c3.generate({
        bindto: '#chart',
        data: {
            columns: [
                ['presión'],
                ['temperatura']
            ]
        }
    });

    Physics(function (world) {
        var cont = document.getElementById('viewport');
        var rect = cont.getBoundingClientRect();

        ractive.set('vol', rect.width * rect.height);

        // bounds of the window
        var viewportBounds = Physics.aabb(0, 0, rect.width, rect.height),
            radius = 10,
            energy = 0;

        // create a renderer
        var renderer = Physics.renderer('pixi', {
            el: 'viewport'
        });

        // add the renderer
        world.add(renderer);

        // render on each step
        world.on('step', function () {
            world.render();
        });

        // constrain objects to these bounds
        var edgeBounce = Physics.behavior('edge-collision-detection', {
            aabb: viewportBounds,
            restitution: 1,
            cof: 0
        });

        var last = {};
        var rerender = function () {
            rect = cont.getBoundingClientRect();
            if (rect.width != last.width || rect.height != last.height){
                viewportBounds = Physics.aabb(0, 0, rect.width, rect.height);
                edgeBounce.setAABB(viewportBounds);
                ractive.set('vol', rect.width * rect.height);
            }

            last.width = rect.width;
            last.height = rect.height;
        };

        setInterval(rerender, 200);

        world.on('interact:poke', function(data){
            addCircle(data.x, data.y);
        });

        world.on('collisions:detected', function(){
            collisions++;
        });

        function addCircle(x, y) {
            var circle = Physics.body('circle', {
                x: x,
                y: y,
                vx: Math.random(),
                vy: Math.random(),
                radius: radius,
                restitution: 1,
                cof: 0,
                styles: {
                    fillStyle: '0x14546f',
                    angleIndicator: '0x72240d'
                }
            });

            world.add(circle);
            ractive.add('qty');
        }

        ractive.on('add', function(e){
            addCircle(rect.width / 2, rect.height / 2);
        });

        addCircle(renderer.width * 0.3, renderer.height * 0.3);
        addCircle(renderer.width * 0.4, renderer.height * 0.4);
        addCircle(renderer.width * 0.5, renderer.height * 0.5);
        addCircle(renderer.width * 0.6, renderer.height * 0.6);

        world.add([
            Physics.behavior('interactive', { el: renderer.container }),
            Physics.behavior('body-impulse-response'),
            Physics.behavior('body-collision-detection'),
            Physics.behavior('sweep-prune'),
            edgeBounce
        ]);

        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function( time ) {
            world.step( time );
        });

        var counter = 0;
        setInterval(function(){
            ractive.set('spd', Math.round(100 * world._bodies.reduce(function(prev, body){
                return prev + Math.sqrt(
                    Math.pow(body.state.vel.x, 2) +
                    Math.pow(body.state.vel.y, 2)
                );
            }, 0) / world._bodies.length));

            counter++;
            var col = collisions / ((Date.now() - init.getTime()) / 1000);
            ractive.set('col', Math.round(col));

            collisions = 0;
            init = new Date();

            chart.flow({
                columns: [
                    ['presión', col],
                    ['temperatura', col]
                ],
                length: counter > 20 ? 1 : 0
            });
        }, 1000);
    });
});
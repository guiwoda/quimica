require.config({
    baseUrl: './',
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


require(['physicsjs', 'pixi', 'ractive'], function(Physics, PIXI, Ractive){
    window.PIXI = PIXI;
    var ractive = new Ractive({

    });

    Physics(function (world) {
        // bounds of the window
        var viewportBounds = Physics.aabb(0, 0, window.innerWidth, window.innerHeight),
            edgeBounce;

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

        window.addEventListener('resize', function () {
            viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
            edgeBounce.setAABB(viewportBounds);
        }, true);

        world.on('interact:poke', function(data){
            addCircle(data.x, data.y);
        });

        world.on('collision:detected', function(){

        });

        function addCircle(x, y) {
            world.add(Physics.body('circle', {
                x: x,
                y: y,
                vx: Math.random(),
                vy: Math.random(),
                radius: 40,
                restitution: 1,
                cof: 0,
                styles: {
                    fillStyle: '0x14546f',
                    angleIndicator: '0x72240d'
                }
            }));
        }

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
    });
});
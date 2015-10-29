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
        }
    ]
});


require(['physicsjs', 'pixi'], function(Physics, PIXI){
    window.PIXI = PIXI;

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
        edgeBounce = Physics.behavior('edge-collision-detection', {
            aabb: viewportBounds
        });

        window.addEventListener('resize', function () {
            viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
            edgeBounce.setAABB(viewportBounds);
        }, true);

        // create some bodies
        world.add( Physics.body('circle', {
            x: renderer.width * 0.4,
            y: renderer.height * 0.3,
            vx: 0.7,
            radius: 40,
            styles: {
                fillStyle: '0x14546f',
                angleIndicator: '#72240d'
            }
        }));

        world.add( Physics.body('circle', {
            x: renderer.width * 0.7,
            y: renderer.height * 0.3,
            vx: -0.2,
            radius: 40,
            styles: {
                fillStyle: '0x14546f',
                angleIndicator: '#3b3e6b'
            }
        }));

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
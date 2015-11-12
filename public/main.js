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
    var SPEED = Math.random(),
        collisions = 0,
        init = Date.now();

    window.PIXI = PIXI;
    var ractive = new Ractive({
        el: document.getElementById('info'),
        template:
            '<ul class="list-unstyled">' +
                '<li>Cantidad: {{qty}}</li>' +
                '<li>Velocidad: <input type="number" value="{{spd}}" on-change="integrate"></li>' +
                '<li>Colisiones/seg: {{col}}</li>' +
            '</ul>',
        data: {
            qty: 4,
            spd: SPEED,
            col: 0
        }
    });

    Physics(function (world) {
        // bounds of the window
        var viewportBounds = Physics.aabb(0, 0, window.innerWidth / 2, window.innerHeight / 2),
            radius = window.innerWidth * 0.01;

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
            viewportBounds = Physics.aabb(0, 0, window.innerWidth / 2, window.innerHeight / 2);
            edgeBounce.setAABB(viewportBounds);
        }, true);

        world.on('interact:poke', function(data){
            addCircle(data.x, data.y);

            ractive.add('qty');
        });

        world.on('collisions:detected', function(){
            collisions++;
        });

        var multi = [-1, 1];

        function addCircle(x, y) {
            var circle = Physics.body('circle', {
                x: x,
                y: y,
                vx: SPEED * (multi[Math.floor(Math.random() * 2)]),
                vy: SPEED,
                radius: radius,
                restitution: 1,
                cof: 0,
                styles: {
                    fillStyle: '0x14546f',
                    angleIndicator: '0x72240d'
                }
            });

            world.add(circle);

            ractive.on('integrate', function(){
                circle.linearVelocity
            });
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

        setInterval(function(){
            ractive.set('col', collisions / ((Date.now() - init) / 1000));

            collisions = 0;
            init = Date.now();
        }, 1000);
    });
});
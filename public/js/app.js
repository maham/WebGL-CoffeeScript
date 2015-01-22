requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',
        "rx": "http://cdnjs.cloudflare.com/ajax/libs/rxjs/2.1.18/rx",
        "rx.binding": "http://cdnjs.cloudflare.com/ajax/libs/rxjs/2.1.18/rx.binding",
        "rx.time": "http://cdnjs.cloudflare.com/ajax/libs/rxjs/2.1.18/rx.time",
        "rx.dom": "http://cdnjs.cloudflare.com/ajax/libs/rxjs-dom/2.0.7/rx.dom"
    }
});

requirejs( ['app/main'], function( main ) {
    
} );

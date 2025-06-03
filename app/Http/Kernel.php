<?php
// app/Http/Kernel.php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

// Only import the middleware classes you have:
use App\Http\Middleware\Authenticate;
use App\Http\Middleware\CheckUserRole;
use App\Http\Middleware\RedirectIfAuthenticated;

use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Routing\Middleware\ThrottleRequests;

class Kernel extends HttpKernel
{
    /**
     * Global HTTP middleware stack.
     */
    protected $middleware = [
        // (you can leave this empty if you have no globals)
    ];

    /**
     * Route middleware groups.
     */
    protected $middlewareGroups = [
        'web' => [
            // (your web middleware, if any)
        ],
        'api' => [
            ThrottleRequests::class.':api',
            SubstituteBindings::class,
        ],
    ];

    /**
     * Route middleware aliases.
     * Laravel uses this, not $middlewareAliases, to look up middleware by name.
     */
    protected $routeMiddleware = [
        'auth'       => Authenticate::class,
        'guest'      => RedirectIfAuthenticated::class,
        'bindings'   => SubstituteBindings::class,
        'throttle'   => ThrottleRequests::class,
        // register your role-checker here:
        'check.role' => \App\Http\Middleware\CheckUserRole::class,    
    ];
}


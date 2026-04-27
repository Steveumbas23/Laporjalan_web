<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $isHttpsRequest = $request->isSecure()
            || $request->header('X-Forwarded-Proto') === 'https';

        $contentSecurityPolicy = [
            "default-src 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "object-src 'none'",
            "manifest-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
            "font-src 'self' data: https://fonts.gstatic.com https://fonts.bunny.net",
            "connect-src 'self' https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org ws: wss:",
            "worker-src 'self' blob:",
        ];

        if ($isHttpsRequest) {
            $contentSecurityPolicy[] = 'upgrade-insecure-requests';
        }

        $response->headers->set(
            'Content-Security-Policy',
            implode('; ', $contentSecurityPolicy)
        );

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->set('Cross-Origin-Resource-Policy', 'same-site');
        $response->headers->set('Origin-Agent-Cluster', '?1');
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');
        $response->headers->set('X-DNS-Prefetch-Control', 'off');
        $response->headers->set(
            'Permissions-Policy',
            'geolocation=(), microphone=(), camera=(), payment=(), usb=(), fullscreen=(self)'
        );

        if ($isHttpsRequest) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }

        return $response;
    }
}

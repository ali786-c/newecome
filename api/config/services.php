<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'payhub' => [
        'client_id' => env('PAYHUB_CLIENT_ID'),
        'secret' => env('PAYHUB_CLIENT_SECRET'),
        'url' => env('PAYHUB_API_URL'),
        'currency' => 'EUR',
        'success_url' => env('FRONTEND_URL', 'http://upgradercx.com') . '/orders',
        'cancel_url' => env('FRONTEND_URL', 'http://upgradercx.com') . '/checkout',
    ],

    'g2a' => [
        'client_id' => env('G2A_CLIENT_ID'),
        'client_secret' => env('G2A_CLIENT_SECRET'),
        'email' => env('G2A_EMAIL'),
        'base_url' => env('G2A_BASE_URL', 'https://sandboxapi.g2a.com'),
    ],

    'gemini' => [
        'key' => env('GOOGLE_GEMINI_API_KEY'),
    ],

];
